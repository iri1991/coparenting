import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getHealthContext } from "@/lib/health";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const ctx = await getHealthContext(session.user.id);
  if (!ctx) return NextResponse.json({ error: "Context familie invalid." }, { status: 400 });
  const { id } = await params;
  let oid: ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  }
  const doc = await ctx.db.collection("child_medical_reports").findOne({ _id: oid, familyId: ctx.familyId });
  if (!doc) return NextResponse.json({ error: "Raport negăsit." }, { status: 404 });
  const d = doc as unknown as { name?: string; contentType?: string; content: Buffer };
  const safeName = (d.name || "raport-medical").replace(/[^a-zA-Z0-9._\s-]/g, "_").trim().slice(0, 100) || "raport-medical";
  const ext = d.contentType === "application/pdf" ? "pdf" : (d.contentType || "application/octet-stream").split("/")[1] || "bin";
  return new NextResponse(new Uint8Array(d.content), {
    headers: {
      "Content-Type": d.contentType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safeName}.${ext}"`,
    },
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const ctx = await getHealthContext(session.user.id);
  if (!ctx) return NextResponse.json({ error: "Context familie invalid." }, { status: 400 });
  const { id } = await params;
  let oid: ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  }
  await ctx.db.collection("child_medical_reports").deleteOne({ _id: oid, familyId: ctx.familyId });
  return NextResponse.json({ ok: true });
}
