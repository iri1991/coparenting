import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { sendNewChatMessageNotification } from "@/lib/notify";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES = 100;

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

  const docs = await db
    .collection("messages")
    .find({ familyId })
    .sort({ createdAt: -1 })
    .limit(MAX_MESSAGES)
    .toArray();

  const messages = (docs as { _id: unknown; senderId: string; text: string; createdAt: Date }[]).map((d) => {
    const senderIndex = memberIds.indexOf(d.senderId);
    const senderLabel = senderIndex === 0 ? parent1Name : senderIndex === 1 ? parent2Name : "Membru";
    return {
      id: String(d._id),
      senderId: d.senderId,
      senderLabel,
      text: d.text,
      createdAt: d.createdAt.toISOString(),
    };
  });

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

  const now = new Date();
  const { insertedId } = await db.collection("messages").insertOne({
    familyId,
    senderId: session.user.id,
    text,
    createdAt: now,
  });

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
  });
}
