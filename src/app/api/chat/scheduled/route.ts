import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { flushDueScheduledMessages } from "@/lib/scheduled-messages";
import type { ScheduledMessage } from "@/types/scheduled-message";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_REPLY_PREVIEW_LENGTH = 120;
const DEFAULT_DELAY_MIN = 5;
const MAX_DELAY_MIN = 60;

const NO_STORE_JSON = { "Cache-Control": "no-store, private, must-revalidate" } as const;

function toScheduled(doc: {
  _id: unknown;
  text: string;
  sendAt: Date;
  createdAt: Date;
  replyToId?: string;
  replyToSenderId?: string;
  replyToText?: string;
}): ScheduledMessage {
  return {
    id: String(doc._id),
    text: doc.text,
    sendAt: doc.sendAt.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    replyTo:
      doc.replyToId && doc.replyToSenderId && typeof doc.replyToText === "string"
        ? { id: doc.replyToId, senderId: doc.replyToSenderId, text: doc.replyToText }
        : null,
  };
}

async function requireFamily(session: Awaited<ReturnType<typeof auth>>) {
  if (!session?.user?.id) return { error: NextResponse.json({ error: "Neautorizat" }, { status: 401 }) };
  if (!session.user.familyId) {
    return { error: NextResponse.json({ error: "Nu aparțineți unei familii." }, { status: 400 }) };
  }
  const db = await getDb();
  const familyId = new ObjectId(session.user.familyId);
  const family = await getActiveFamily(db, familyId);
  if (!family) {
    return { error: NextResponse.json({ error: "Familia nu există sau a fost dezactivată." }, { status: 403 }) };
  }
  return { db, familyId, family };
}

/** GET: mesajele mele programate, încă neexpediate. */
export async function GET() {
  const session = await auth();
  const ctx = await requireFamily(session);
  if (ctx.error) return ctx.error;
  const { db, familyId } = ctx;

  const docs = await db
    .collection("scheduled_messages")
    .find({ familyId, senderId: session!.user!.id })
    .sort({ sendAt: 1 })
    .toArray();
  return NextResponse.json(
    { scheduled: (docs as Parameters<typeof toScheduled>[0][]).map(toScheduled) },
    { headers: NO_STORE_JSON }
  );
}

/** POST: programează un mesaj cu întârziere (cooldown). */
export async function POST(request: Request) {
  const session = await auth();
  const ctx = await requireFamily(session);
  if (ctx.error) return ctx.error;
  const { db, familyId, family } = ctx;

  const memberIds = (family.memberIds ?? []).map(String);
  if (!memberIds.includes(session!.user!.id)) {
    return NextResponse.json({ error: "Nu sunteți membru al acestei familii." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "Mesajul nu poate fi gol." }, { status: 400 });
  if (text.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: `Mesajul poate avea maximum ${MAX_MESSAGE_LENGTH} caractere.` }, { status: 400 });
  }
  const delayMin = Math.min(
    Math.max(Number.isFinite(body.delayMinutes) ? Math.floor(body.delayMinutes) : DEFAULT_DELAY_MIN, 1),
    MAX_DELAY_MIN
  );

  // Rezolvă răspunsul la momentul programării.
  let replyPayload: { replyToId: string; replyToSenderId: string; replyToText: string } | undefined;
  const replyToId = typeof body.replyToId === "string" ? body.replyToId.trim() : "";
  if (replyToId) {
    let replyOid: ObjectId;
    try {
      replyOid = new ObjectId(replyToId);
    } catch {
      return NextResponse.json({ error: "Mesajul la care răspunzi nu este valid." }, { status: 400 });
    }
    const replied = await db
      .collection("messages")
      .findOne({ _id: replyOid, familyId }, { projection: { _id: 1, senderId: 1, text: 1 } });
    if (replied) {
      const rSender = String((replied as { senderId?: unknown }).senderId ?? "");
      const rText = String((replied as { text?: unknown }).text ?? "").trim();
      if (rSender && rText) {
        replyPayload = {
          replyToId: String((replied as { _id: unknown })._id),
          replyToSenderId: rSender,
          replyToText:
            rText.length > MAX_REPLY_PREVIEW_LENGTH ? `${rText.slice(0, MAX_REPLY_PREVIEW_LENGTH - 1)}…` : rText,
        };
      }
    }
  }

  const now = new Date();
  const sendAt = new Date(now.getTime() + delayMin * 60_000);
  const insertDoc: Record<string, unknown> = {
    familyId,
    senderId: session!.user!.id,
    text,
    sendAt,
    createdAt: now,
  };
  if (replyPayload) {
    insertDoc.replyToId = replyPayload.replyToId;
    insertDoc.replyToSenderId = replyPayload.replyToSenderId;
    insertDoc.replyToText = replyPayload.replyToText;
  }
  const { insertedId } = await db.collection("scheduled_messages").insertOne(insertDoc);
  const created = await db.collection("scheduled_messages").findOne({ _id: insertedId });
  return NextResponse.json({ scheduled: toScheduled(created as Parameters<typeof toScheduled>[0]) });
}

/** PATCH: { id, action: "send-now" } — livrează imediat un mesaj programat propriu. */
export async function PATCH(request: Request) {
  const session = await auth();
  const ctx = await requireFamily(session);
  if (ctx.error) return ctx.error;
  const { db, familyId } = ctx;

  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  let oid: ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  }
  if (body.action !== "send-now") {
    return NextResponse.json({ error: "Acțiune necunoscută." }, { status: 400 });
  }
  const result = await db
    .collection("scheduled_messages")
    .updateOne({ _id: oid, familyId, senderId: session!.user!.id }, { $set: { sendAt: new Date(0) } });
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Mesaj programat negăsit." }, { status: 404 });
  }
  await flushDueScheduledMessages(db, familyId);
  return NextResponse.json({ ok: true });
}

/** DELETE: anulează un mesaj programat propriu. */
export async function DELETE(request: Request) {
  const session = await auth();
  const ctx = await requireFamily(session);
  if (ctx.error) return ctx.error;
  const { db, familyId } = ctx;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || "";
  let oid: ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  }
  const result = await db
    .collection("scheduled_messages")
    .deleteOne({ _id: oid, familyId, senderId: session!.user!.id });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Mesaj programat negăsit." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
