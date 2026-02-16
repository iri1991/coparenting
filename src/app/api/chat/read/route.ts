import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

/** POST: marchează mesajele din chat ca citite (la deschiderea paginii Chat). */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const db = await getDb();
  await db.collection("users").updateOne(
    { _id: new ObjectId(session.user.id) },
    { $set: { chatLastReadAt: new Date(), updatedAt: new Date() } }
  );
  return NextResponse.json({ ok: true });
}
