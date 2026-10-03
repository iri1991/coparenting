import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { createPasswordResetAndSend } from "@/lib/password-reset";

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

  const { sent } = await createPasswordResetAndSend(email);

  if (!sent) {
    return NextResponse.json(
      { error: "Nu am putut trimite emailul. Încearcă mai târziu sau verifică setările serverului." },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, message: "Dacă există un cont cu acest email, vei primi un link." });
}
