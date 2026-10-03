import crypto from "crypto";
import { getDb } from "@/lib/mongodb";
import { sendEmail, wrapEmailHtml, emailButtonHtml } from "@/lib/email";

const TOKEN_BYTES = 32;
export const PASSWORD_RESET_EXPIRY_HOURS = 2;

/**
 * Creează un token de resetare pentru email (înlocuiește tokenurile vechi) și trimite emailul.
 * Returnează linkul generat și dacă emailul a plecat.
 */
export async function createPasswordResetAndSend(
  email: string,
  expiryHours: number = PASSWORD_RESET_EXPIRY_HOURS
): Promise<{ resetUrl: string; sent: boolean }> {
  const db = await getDb();
  const token = crypto.randomBytes(TOKEN_BYTES).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setHours(expiresAt.getHours() + expiryHours);

  await db.collection("password_reset_tokens").deleteMany({ email });
  await db.collection("password_reset_tokens").insertOne({
    email,
    token,
    expiresAt,
    createdAt: now,
  });

  const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const content = `
    <p style="margin: 0 0 16px; font-size: 16px;">Ai solicitat resetarea parolei pentru contul tău HomeSplit.</p>
    <p style="margin: 0 0 8px; font-size: 15px; color: #78716c;">Apasă butonul de mai jos pentru a alege o parolă nouă. Linkul expiră în ${expiryHours} ore.</p>
    ${emailButtonHtml(resetUrl, "Resetează parola")}
    <p style="margin: 24px 0 0; font-size: 14px; color: #78716c;">Dacă nu ai solicitat resetarea, poți ignora acest email.</p>
  `;
  const sent = await sendEmail({
    to: email,
    subject: "Resetare parolă HomeSplit",
    html: wrapEmailHtml(content),
    text: `Resetare parolă HomeSplit. Link: ${resetUrl} (expiră în ${expiryHours} ore.)`,
  });
  return { resetUrl, sent };
}
