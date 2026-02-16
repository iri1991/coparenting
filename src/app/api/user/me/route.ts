import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
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
    { projection: { email: 1, name: 1, parentType: 1 } }
  );
  if (!user) {
    return NextResponse.json({ error: "Utilizator negăsit" }, { status: 404 });
  }
  return NextResponse.json({
    name: user.name ?? null,
    email: user.email ?? null,
    parentType: user.parentType ?? null,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const body = await request.json();
  const { parentType, name } = body;
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parentType === "tata" || parentType === "mama") {
    updates.parentType = parentType;
  }
  if (typeof name === "string") {
    updates.name = name.trim() || null;
  }
  if (Object.keys(updates).length <= 1) {
    return NextResponse.json(
      { error: "Trimite parentType și/sau name pentru actualizare." },
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
  await db.collection("users").updateOne({ _id: oid }, { $set: updates });
  const result: { parentType?: string; name?: string | null } = {};
  if (updates.parentType) result.parentType = updates.parentType as string;
  if (Object.prototype.hasOwnProperty.call(updates, "name")) result.name = updates.name as string | null;
  return NextResponse.json(result);
}
