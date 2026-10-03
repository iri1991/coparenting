import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAdminApi, logAdminAction } from "@/lib/admin";
import { removeUserFromFamily } from "@/lib/admin-actions";

/** DELETE ?userId=…: scoate un membru din familie (inclusiv ID-uri orfane din memberIds). */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  const userId = new URL(request.url).searchParams.get("userId") ?? "";
  if (!ObjectId.isValid(id) || !userId) {
    return NextResponse.json({ error: "Parametri invalizi." }, { status: 400 });
  }
  const result = await removeUserFromFamily(userId, new ObjectId(id));
  await logAdminAction(session, "Membru scos din familie", { type: "family", id }, { userId, ...result });
  return NextResponse.json({ ok: true, ...result });
}
