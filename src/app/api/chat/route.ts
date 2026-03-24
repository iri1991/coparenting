import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { sendNewChatMessageNotification } from "@/lib/notify";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES = 100;
const MAX_REPLY_PREVIEW_LENGTH = 120;

/** GET: mesajele din chat-ul familiei (doar membri). */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  if (!session.user.familyId) {
    return NextResponse.json({ messages: [] });
  }

  const db = await getDb();
  const familyId = new ObjectId(session.user.familyId);
  const family = await getActiveFamily(db, familyId);
  if (!family) {
    return NextResponse.json(
      { error: "Familia nu există sau a fost dezactivată. Contactați suportul." },
      { status: 403 }
    );
  }

  const memberIds = family.memberIds ?? [];
  const parent1Name = (family as { parent1Name?: string }).parent1Name?.trim() || "Părinte 1";
  const parent2Name = (family as { parent2Name?: string }).parent2Name?.trim() || "Părinte 2";
  const otherMemberId = memberIds.find((id) => id !== session.user.id) ?? null;
  let otherLastReadAt: Date | null = null;
  if (otherMemberId) {
    const otherUser = await db.collection("users").findOne(
      { _id: new ObjectId(otherMemberId) },
      { projection: { chatLastReadAt: 1 } }
    );
    otherLastReadAt = (otherUser as { chatLastReadAt?: Date } | null)?.chatLastReadAt ?? null;
  }

  const docs = await db
    .collection("messages")
    .find({ familyId })
    .sort({ createdAt: -1 })
    .limit(MAX_MESSAGES)
    .toArray();

  const messages = (docs as {
    _id: unknown;
    senderId: string;
    text: string;
    createdAt: Date;
    replyToId?: string;
    replyToSenderId?: string;
    replyToText?: string;
  }[]).map(
    (d) => {
      const senderIndex = memberIds.indexOf(d.senderId);
      const senderLabel = senderIndex === 0 ? parent1Name : senderIndex === 1 ? parent2Name : "Membru";
      const seenByOther =
        d.senderId === session.user.id &&
        !!otherLastReadAt &&
        d.createdAt.getTime() <= otherLastReadAt.getTime();
      let replyTo: {
        id: string;
        senderId: string;
        senderLabel: string;
        text: string;
      } | null = null;
      if (
        typeof d.replyToId === "string" &&
        d.replyToId &&
        typeof d.replyToSenderId === "string" &&
        d.replyToSenderId &&
        typeof d.replyToText === "string"
      ) {
        const replySenderIndex = memberIds.indexOf(d.replyToSenderId);
        const replySenderLabel =
          replySenderIndex === 0 ? parent1Name : replySenderIndex === 1 ? parent2Name : "Membru";
        replyTo = {
          id: d.replyToId,
          senderId: d.replyToSenderId,
          senderLabel: replySenderLabel,
          text: d.replyToText,
        };
      }
      return {
        id: String(d._id),
        senderId: d.senderId,
        senderLabel,
        text: d.text,
        createdAt: d.createdAt.toISOString(),
        seenByOther,
        replyTo,
      };
    }
  );

  return NextResponse.json({ messages: messages.reverse() });
}

/** POST: trimite un mesaj în chat-ul familiei. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  if (!session.user.familyId) {
    return NextResponse.json({ error: "Nu aparțineți unei familii." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const replyToId = typeof body.replyToId === "string" ? body.replyToId.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Mesajul nu poate fi gol." }, { status: 400 });
  }
  if (text.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Mesajul poate avea maximum ${MAX_MESSAGE_LENGTH} caractere.` },
      { status: 400 }
    );
  }

  const db = await getDb();
  const familyId = new ObjectId(session.user.familyId);
  const family = await getActiveFamily(db, familyId);
  if (!family) {
    return NextResponse.json(
      { error: "Familia nu există sau a fost dezactivată. Contactați suportul." },
      { status: 403 }
    );
  }
  const memberIds = family.memberIds ?? [];
  if (!memberIds.includes(session.user.id)) {
    return NextResponse.json({ error: "Nu sunteți membru al acestei familii." }, { status: 403 });
  }

  let replyPayload:
    | {
        replyToId: string;
        replyToSenderId: string;
        replyToText: string;
      }
    | undefined;
  if (replyToId) {
    let replyOid: ObjectId;
    try {
      replyOid = new ObjectId(replyToId);
    } catch {
      return NextResponse.json({ error: "Mesajul la care răspunzi nu este valid." }, { status: 400 });
    }
    const repliedMessage = await db.collection("messages").findOne(
      { _id: replyOid, familyId },
      { projection: { _id: 1, senderId: 1, text: 1 } }
    );
    if (!repliedMessage) {
      return NextResponse.json({ error: "Mesajul la care răspunzi nu a fost găsit." }, { status: 404 });
    }
    const replySenderId = String((repliedMessage as { senderId?: unknown }).senderId ?? "");
    const replyTextRaw = String((repliedMessage as { text?: unknown }).text ?? "").trim();
    if (!replySenderId || !replyTextRaw) {
      return NextResponse.json({ error: "Mesajul la care răspunzi nu este disponibil." }, { status: 400 });
    }
    replyPayload = {
      replyToId: String((repliedMessage as { _id: unknown })._id),
      replyToSenderId: replySenderId,
      replyToText:
        replyTextRaw.length > MAX_REPLY_PREVIEW_LENGTH
          ? `${replyTextRaw.slice(0, MAX_REPLY_PREVIEW_LENGTH - 1)}…`
          : replyTextRaw,
    };
  }

  const now = new Date();
  const insertDoc: {
    familyId: ObjectId;
    senderId: string;
    text: string;
    createdAt: Date;
    replyToId?: string;
    replyToSenderId?: string;
    replyToText?: string;
  } = {
    familyId,
    senderId: session.user.id,
    text,
    createdAt: now,
  };
  if (replyPayload) {
    insertDoc.replyToId = replyPayload.replyToId;
    insertDoc.replyToSenderId = replyPayload.replyToSenderId;
    insertDoc.replyToText = replyPayload.replyToText;
  }
  const { insertedId } = await db.collection("messages").insertOne(insertDoc);

  const otherUserIds = memberIds.filter((id) => id !== session.user.id);
  if (otherUserIds.length > 0) {
    const parent1Name = (family as { parent1Name?: string }).parent1Name?.trim() || "Părinte 1";
    const parent2Name = (family as { parent2Name?: string }).parent2Name?.trim() || "Părinte 2";
    const senderIndex = memberIds.indexOf(session.user.id!);
    const senderLabel = senderIndex === 0 ? parent1Name : senderIndex === 1 ? parent2Name : "Celălalt părinte";
    sendNewChatMessageNotification(otherUserIds, senderLabel, text).catch((err) =>
      console.error("[chat] push notification failed", err)
    );
  }

  return NextResponse.json({
    id: String(insertedId),
    senderId: session.user.id,
    text,
    createdAt: now.toISOString(),
    replyTo: replyPayload
      ? {
          id: replyPayload.replyToId,
          senderId: replyPayload.replyToSenderId,
          text: replyPayload.replyToText,
        }
      : null,
  });
}
