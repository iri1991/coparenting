import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

const TOKEN_BYTES = 32;
const EXPIRY_HOURS = 2;

/** POST: trimite email cu link de resetare parolă. Nu dezvăluie dacă emailul există. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  if (!email) {
    return NextResponse.json({ error: "Email-ul este obligatoriu." }, { status: 400 });
  }

  const db = await getDb();
  const user = await db.collection("users").findOne(
    { email },
    { projection: { _id: 1 } }
  );
  if (!user) {
    return NextResponse.json({ ok: true, message: "Dacă există un cont cu acest email, vei primi un link." });
  }

  const token = crypto.randomBytes(TOKEN_BYTES).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setHours(expiresAt.getHours() + EXPIRY_HOURS);

  await db.collection("password_reset_tokens").deleteMany({ email });
  await db.collection("password_reset_tokens").insertOne({
    email,
    token,
    expiresAt,
    createdAt: now,
  });

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const sent = await sendEmail({
    to: email,
    subject: "Resetare parolă HomeSplit",
    html: `
      <p>Ai solicitat resetarea parolei pentru HomeSplit.</p>
      <p><strong><a href="${resetUrl}">Resetează parola</a></strong></p>
      <p>Link direct: ${resetUrl}</p>
      <p>Linkul expiră în ${EXPIRY_HOURS} ore. Dacă nu ai solicitat resetarea, poți ignora acest email.</p>
    `,
    text: `Resetare parolă HomeSplit. Link: ${resetUrl} (expiră în ${EXPIRY_HOURS} ore.)`,
  });

  if (!sent) {
    return NextResponse.json(
      { error: "Nu am putut trimite emailul. Încearcă mai târziu sau verifică setările serverului." },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, message: "Dacă există un cont cu acest email, vei primi un link." });
}
