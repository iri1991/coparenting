import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAdminApi } from "@/lib/admin";

/** POST { text }: adaugă o notă internă (vizibilă doar adminilor). */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const text = typeof body.text === "string" ? body.text.trim().slice(0, 2000) : "";
  if (!text) return NextResponse.json({ error: "Nota este goală." }, { status: 400 });

  const db = await getDb();
  const doc = { familyId: new ObjectId(id), text, adminEmail: session.user.email, createdAt: new Date() };
  const { insertedId } = await db.collection("admin_notes").insertOne(doc);
  return NextResponse.json({
    note: { id: String(insertedId), text, adminEmail: doc.adminEmail, createdAt: doc.createdAt.toISOString() },
  });
}

/** DELETE ?noteId=…: șterge o notă internă. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  const noteId = new URL(request.url).searchParams.get("noteId") ?? "";
  if (!ObjectId.isValid(id) || !ObjectId.isValid(noteId)) return NextResponse.json({ error: "Parametri invalizi." }, { status: 400 });
  const db = await getDb();
  await db.collection("admin_notes").deleteOne({ _id: new ObjectId(noteId), familyId: new ObjectId(id) });
  return NextResponse.json({ ok: true });
}
