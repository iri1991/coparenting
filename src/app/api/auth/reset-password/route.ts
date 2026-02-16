import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

/** POST: setează parola nouă folosind tokenul din email. Body: { token, newPassword } */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token.trim() : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  if (!token) {
    return NextResponse.json({ error: "Token lipsă." }, { status: 400 });
  }
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json(
      { error: "Parola nouă trebuie să aibă cel puțin 6 caractere." },
      { status: 400 }
    );
  }

  const db = await getDb();
  const now = new Date();
  const doc = await db.collection("password_reset_tokens").findOne({
    token,
    expiresAt: { $gt: now },
  });
  if (!doc) {
    return NextResponse.json(
      { error: "Link invalid sau expirat. Solicită din nou resetarea parolei." },
      { status: 400 }
    );
  }

  const email = (doc as { email: string }).email;
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.collection("users").updateOne(
    { email },
    { $set: { passwordHash, updatedAt: now } }
  );
  await db.collection("password_reset_tokens").deleteMany({ token });

  return NextResponse.json({ ok: true, message: "Parola a fost actualizată. Te poți conecta." });
}
