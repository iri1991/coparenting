import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { sendAdminNewUserEmail } from "@/lib/email";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email și parola sunt obligatorii." },
        { status: 400 }
      );
    }
    const emailNorm = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm) || emailNorm.length > 254) {
      return NextResponse.json({ error: "Adresă de email invalidă." }, { status: 400 });
    }
    // Max. 10 conturi noi pe oră de la aceeași adresă IP (anti-spam / conturi în masă).
    const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
    if (await isRateLimited(`signup:${ip}`, 10, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Prea multe înregistrări. Încearcă mai târziu." }, { status: 429 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Parola trebuie să aibă cel puțin 6 caractere." },
        { status: 400 }
      );
    }
    const db = await getDb();
    const existing = await db.collection("users").findOne({ email: emailNorm });
    if (existing) {
      return NextResponse.json(
        { error: "Există deja un cont cu acest email." },
        { status: 400 }
      );
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await db.collection("users").insertOne({
      email: emailNorm,
      passwordHash,
      createdAt: new Date(),
    });
    sendAdminNewUserEmail(emailNorm).catch((e) =>
      console.error("[signup] admin email failed", e)
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Eroare la înregistrare." },
      { status: 500 }
    );
  }
}
