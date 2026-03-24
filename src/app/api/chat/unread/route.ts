import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

const NO_STORE_JSON = { "Cache-Control": "no-store, private, must-revalidate" } as const;

/** GET: numărul de mesaje necitite în chat (pentru badge). */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ unreadCount: 0 }, { headers: NO_STORE_JSON });
  }
  if (!session.user.familyId) {
    return NextResponse.json({ unreadCount: 0 }, { headers: NO_STORE_JSON });
  }

  const db = await getDb();
  const user = await db.collection("users").findOne(
    { _id: new ObjectId(session.user.id) },
    { projection: { chatLastReadAt: 1 } }
  );
  const chatLastReadAt = (user as { chatLastReadAt?: Date } | null)?.chatLastReadAt ?? null;

  const familyId = new ObjectId(session.user.familyId);
  const filter: {
    familyId: ObjectId;
    senderId: { $ne: string };
    createdAt?: { $gt: Date };
  } = {
    familyId,
    senderId: { $ne: session.user.id },
  };
  if (chatLastReadAt) {
    filter.createdAt = { $gt: chatLastReadAt };
  }

  const unreadCount = await db.collection("messages").countDocuments(filter);
  return NextResponse.json({ unreadCount }, { headers: NO_STORE_JSON });
}
