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
  const { parentType } = body;
  if (parentType !== "tata" && parentType !== "mama") {
    return NextResponse.json(
      { error: "parentType trebuie să fie 'tata' sau 'mama'" },
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
  await db.collection("users").updateOne(
    { _id: oid },
    { $set: { parentType, updatedAt: new Date() } }
  );
  return NextResponse.json({ parentType });
}
