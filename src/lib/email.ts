/**
 * Email via Resend – doar pentru setup și cont:
 * invitație familie, resetare parolă etc.
 * Notificările de evenimente / reminder seara sunt push, nu email.
 */

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY?.trim();
const from = process.env.EMAIL_FROM?.trim() || "HomeSplit <onboarding@resend.dev>";
const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://homesplit.ro";

const resend = apiKey ? new Resend(apiKey) : null;

export function isEmailConfigured(): boolean {
  return Boolean(apiKey);
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

/** Culori brand: amber/orange aliniat cu aplicația */
const BRAND = {
  primary: "#d97706",
  primaryLight: "#fef3c7",
  text: "#1c1917",
  textMuted: "#78716c",
  border: "#e7e5e4",
  bg: "#fffbeb",
  white: "#ffffff",
};

/**
 * Înfășoară conținutul HTML al emailului într-un layout cu branding HomeSplit.
 * Folosește inline styles pentru compatibilitate maximă cu clienții de email.
 */
export function wrapEmailHtml(contentHtml: string): string {
  const logoUrl = `${baseUrl}/logo.png`;
  return `
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HomeSplit</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f5f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.6; color: ${BRAND.text};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f5f5f4; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: ${BRAND.white}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06);">
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND.bg} 0%, #fff7ed 100%); border-bottom: 1px solid ${BRAND.border}; padding: 28px 32px; text-align: center;">
              <a href="${baseUrl}" style="text-decoration: none; display: inline-block;">
                <img src="${logoUrl}" alt="HomeSplit" width="48" height="48" style="display: block; margin: 0 auto 8px; border-radius: 12px; width: 48px; height: 48px; object-fit: contain;" />
                <span style="font-size: 22px; font-weight: 700; color: ${BRAND.primary}; letter-spacing: -0.02em;">HomeSplit</span>
              </a>
              <p style="margin: 6px 0 0; font-size: 13px; color: ${BRAND.textMuted}; font-weight: 500;">Planifică zilele cu copilul</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              ${contentHtml}
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid ${BRAND.border}; padding: 20px 32px; text-align: center; font-size: 13px; color: ${BRAND.textMuted};">
              <p style="margin: 0;">Acest email a fost trimis de <strong>HomeSplit</strong>.</p>
              <p style="margin: 8px 0 0;"><a href="${baseUrl}" style="color: ${BRAND.primary}; font-weight: 600; text-decoration: none;">Deschide aplicația</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/**
 * Generează HTML pentru un buton CTA (call-to-action) în email.
 */
export function emailButtonHtml(href: string, label: string): string {
  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
  <tr>
    <td align="center">
      <a href="${href}" style="display: inline-block; padding: 14px 28px; background-color: ${BRAND.primary}; color: ${BRAND.white}; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.12);">${label}</a>
    </td>
  </tr>
</table>`.trim();
}

/**
 * Trimite un email prin Resend. Returnează true dacă a fost trimis, false dacă Resend nu e configurat.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY lipsește – email netrimis");
    return false;
  }
  try {
    const { error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: html ?? (text ? text.replace(/\n/g, "<br>") : undefined),
      text,
    });
    if (error) {
      console.error("[email] Resend error", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] send failed", e);
    return false;
  }
}

import type { Db } from "mongodb";

/**
 * Notifică toți membrii familiei pe email când configurarea a fost actualizată.
 * Apelat după PATCH family, POST/PATCH/DELETE children, POST/DELETE residences, documente.
 */
export async function notifyFamilyConfigUpdated(
  db: Db,
  familyId: import("mongodb").ObjectId,
  updatedByName?: string | null
): Promise<void> {
  const family = await db.collection("families").findOne({ _id: familyId });
  const memberIds = (family as { memberIds?: unknown[] } | null)?.memberIds ?? [];
  if (memberIds.length === 0) return;
  const { ObjectId } = await import("mongodb");
  const oids = memberIds.map((id: unknown) => new ObjectId(String(id)));
  const usersList = await db.collection("users").find({ _id: { $in: oids } }).toArray();
  const emails = usersList
    .map((u) => (u as { email?: string }).email)
    .filter((e): e is string => typeof e === "string" && e.length > 0);
  if (emails.length === 0) return;
  const who = updatedByName?.trim() || "Un părinte";
  const content = `
    <p style="margin: 0 0 16px; font-size: 16px; color: ${BRAND.text};">Configurarea familiei a fost actualizată de <strong>${who}</strong>.</p>
    <p style="margin: 0 0 8px; font-size: 15px; color: ${BRAND.textMuted};">Verifică în aplicație pentru detalii.</p>
    ${emailButtonHtml(baseUrl, "Deschide aplicația")}
  `;
  await sendEmail({
    to: emails,
    subject: "HomeSplit – Configurare actualizată",
    html: wrapEmailHtml(content),
    text: `Configurarea familiei a fost actualizată de ${who}. Verifică în aplicație: ${baseUrl}`,
  });
}
