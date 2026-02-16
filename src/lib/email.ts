/**
 * Email via Resend – doar pentru setup și cont:
 * invitație familie, resetare parolă etc.
 * Notificările de evenimente / reminder seara sunt push, nu email.
 */

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY?.trim();
const from = process.env.EMAIL_FROM?.trim() || "HomeSplit <onboarding@resend.dev>";

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
  await sendEmail({
    to: emails,
    subject: "HomeSplit – Configurare actualizată",
    html: `<p>Configurarea familiei a fost actualizată de <strong>${who}</strong>.</p><p>Verifică în aplicație pentru detalii.</p>`,
    text: `Configurarea familiei a fost actualizată de ${who}. Verifică în aplicație.`,
  });
}
