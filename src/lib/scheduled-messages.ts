import { ObjectId } from "mongodb";
import type { getDb } from "@/lib/mongodb";
import { sendNewChatMessageNotification } from "@/lib/notify";

type Db = Awaited<ReturnType<typeof getDb>>;

interface ScheduledDoc {
  _id: ObjectId;
  familyId: ObjectId;
  senderId: string;
  text: string;
  sendAt: Date;
  replyToId?: string;
  replyToSenderId?: string;
  replyToText?: string;
}

/**
 * Livrează mesajele programate scadente (sendAt <= acum): le mută în colecția `messages`,
 * trimite notificarea și șterge intrarea programată. Dacă `familyId` e dat, procesează doar
 * acea familie; altfel toate. Nu aruncă — folosit și din chat GET (flush lazy) și din cron.
 *
 * Returnează numărul de mesaje livrate.
 */
export async function flushDueScheduledMessages(db: Db, familyId?: ObjectId): Promise<number> {
  const now = new Date();
  const filter: Record<string, unknown> = { sendAt: { $lte: now } };
  if (familyId) filter.familyId = familyId;

  // Cache pe familie pentru memberIds + nume.
  const familyCache = new Map<
    string,
    { memberIds: string[]; parent1Name: string; parent2Name: string } | null
  >();

  let delivered = 0;
  // Revendică atomic fiecare mesaj scadent (findOneAndDelete) ca să evităm livrarea
  // dublă când ambii părinți interoghează simultan.
  for (let guard = 0; guard < 200; guard++) {
    const doc = (await db
      .collection("scheduled_messages")
      .findOneAndDelete(filter, { sort: { sendAt: 1 } })) as ScheduledDoc | null;
    if (!doc) break;

    const famKey = String(doc.familyId);
    let fam = familyCache.get(famKey);
    if (fam === undefined) {
      const familyDoc = await db
        .collection("families")
        .findOne(
          { _id: doc.familyId },
          { projection: { memberIds: 1, parent1Name: 1, parent2Name: 1, active: 1 } }
        );
      if (!familyDoc || (familyDoc as { active?: boolean }).active === false) {
        fam = null;
      } else {
        const f = familyDoc as { memberIds?: string[]; parent1Name?: string; parent2Name?: string };
        fam = {
          memberIds: (f.memberIds ?? []).map(String),
          parent1Name: f.parent1Name?.trim() || "Părinte 1",
          parent2Name: f.parent2Name?.trim() || "Părinte 2",
        };
      }
      familyCache.set(famKey, fam);
    }

    // Familie inexistentă/dezactivată sau expeditor scos din familie → mesajul (deja
    // revendicat/șters) e abandonat.
    if (!fam || !fam.memberIds.includes(doc.senderId)) {
      continue;
    }

    const insertDoc: Record<string, unknown> = {
      familyId: doc.familyId,
      senderId: doc.senderId,
      text: doc.text,
      createdAt: new Date(),
    };
    if (doc.replyToId && doc.replyToSenderId && typeof doc.replyToText === "string") {
      insertDoc.replyToId = doc.replyToId;
      insertDoc.replyToSenderId = doc.replyToSenderId;
      insertDoc.replyToText = doc.replyToText;
    }
    await db.collection("messages").insertOne(insertDoc);
    delivered += 1;

    const otherUserIds = fam.memberIds.filter((id) => id !== doc.senderId);
    if (otherUserIds.length > 0) {
      const senderIndex = fam.memberIds.indexOf(doc.senderId);
      const senderLabel =
        senderIndex === 0 ? fam.parent1Name : senderIndex === 1 ? fam.parent2Name : "Celălalt părinte";
      sendNewChatMessageNotification(otherUserIds, senderLabel, doc.text).catch((err) =>
        console.error("[scheduled-messages] push failed", err)
      );
    }
  }

  return delivered;
}
