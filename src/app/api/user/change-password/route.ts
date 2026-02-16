import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const body = await request.json();
  const { currentPassword, newPassword } = body;
  if (!currentPassword || typeof currentPassword !== "string" || !newPassword || typeof newPassword !== "string") {
    return NextResponse.json(
      { error: "Parola curentă și parola nouă sunt obligatorii." },
      { status: 400 }
    );
  }
  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "Parola nouă trebuie să aibă cel puțin 6 caractere." },
      { status: 400 }
    );
  }
  const db = await getDb();
  let oid: ObjectId;
  try {
    oid = new ObjectId(session.user.id);
  } catch {
    return NextResponse.json({ error: "ID invalid" }, { status: 400 });
  }
  const user = await db.collection("users").findOne(
    { _id: oid },
    { projection: { passwordHash: 1 } }
  );
  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Cont negăsit." }, { status: 404 });
  }
  const ok = await bcrypt.compare(currentPassword, (user as unknown as { passwordHash: string }).passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Parola curentă este incorectă." }, { status: 400 });
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.collection("users").updateOne(
    { _id: oid },
    { $set: { passwordHash, updatedAt: new Date() } }
  );
  return NextResponse.json({ ok: true });
}
