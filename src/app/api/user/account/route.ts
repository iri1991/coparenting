import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { isAdminEmail } from "@/lib/admin-emails";
import { deleteUserAccount } from "@/lib/account-deletion";

/** DELETE { password }: utilizatorul își șterge propriul cont (confirmat cu parola). */
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  if (isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Contul de admin nu poate fi șters din aplicație." }, { status: 400 });
  }
  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";
  if (!password) {
    return NextResponse.json({ error: "Confirmă cu parola contului." }, { status: 400 });
  }
  const db = await getDb();
  const user = await db.collection("users").findOne({ _id: new ObjectId(session.user.id) }, { projection: { passwordHash: 1 } });
  const hash = (user as { passwordHash?: string } | null)?.passwordHash;
  if (!hash || !(await bcrypt.compare(password, hash))) {
    return NextResponse.json({ error: "Parola este incorectă." }, { status: 400 });
  }
  const result = await deleteUserAccount(db, session.user.id);
  return NextResponse.json({ ok: true, ...result });
}
