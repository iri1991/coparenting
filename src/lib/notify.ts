import { format } from "date-fns";
import { ro } from "date-fns/locale";
import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getEventDisplayLabel } from "@/types/events";
import { getSubscriptionsForUsers, sendPushToSubscriptions } from "@/lib/push";
import { sendEmail } from "@/lib/email";
import type { ScheduleEvent } from "@/types/events";

type Db = Awaited<ReturnType<typeof getDb>>;

/**
 * Trimite notificare push tuturor utilizatorilor (în afară de creator) când se adaugă un eveniment nou.
 * Nu aruncă erori – doar loghează; apelul nu blochează răspunsul API.
 */
export async function sendNewEventNotification(event: ScheduleEvent): Promise<void> {
  const db = await getDb();
  const users = await db.collection("users").find({}).project({ _id: 1 }).toArray();
  const creatorId = event.created_by;
  const userIds = (users as { _id: unknown }[])
    .filter((u) => String(u._id) !== creatorId)
    .map((u) => String(u._id));
  if (userIds.length === 0) return;

  const subs = await getSubscriptionsForUsers(userIds);
  if (subs.length === 0) return;

  const dateLabel = format(new Date(event.date + "T12:00:00"), "EEEE, d MMM", { locale: ro });
  const label = getEventDisplayLabel(event);
  const time =
    event.startTime || event.endTime
      ? [event.startTime, event.endTime].filter(Boolean).join(" – ")
      : null;
  const body = time ? `${label} (${time})` : label;

  await sendPushToSubscriptions(subs, {
    title: `Eveniment nou: ${dateLabel}`,
    body,
    url: "/",
  });
}

/**
 * Notifică părintele care a blocat ziua că celălalt a încercat să adauge program cu copilul în perioada blocată.
 */
export async function sendBlockedDayAttemptNotification(
  blockerUserId: string,
  attemptedByParentLabel: string,
  dateStr: string
): Promise<void> {
  const subs = await getSubscriptionsForUsers([blockerUserId]);
  if (subs.length === 0) return;
  const dateLabel = format(new Date(dateStr + "T12:00:00"), "d MMM yyyy", { locale: ro });
  await sendPushToSubscriptions(subs, {
    title: "Zi blocată",
    body: `${attemptedByParentLabel} a încercat să programeze cu copilul pe ${dateLabel}, dar ai acea zi blocată.`,
    url: "/",
  });
}

/**
 * Notificare push când primești un mesaj nou în chat de la celălalt părinte.
 */
export async function sendNewChatMessageNotification(
  recipientUserIds: string[],
  senderLabel: string,
  textPreview: string
): Promise<void> {
  if (recipientUserIds.length === 0) return;
  const subs = await getSubscriptionsForUsers(recipientUserIds);
  if (subs.length === 0) return;
  const body = textPreview.length > 60 ? textPreview.slice(0, 57) + "…" : textPreview;
  await sendPushToSubscriptions(subs, {
    title: `Mesaj de la ${senderLabel}`,
    body: body || "Mesaj nou în chat",
    url: "/chat",
  });
}

/**
 * Notifică ambii părinți că propunerea de program pentru săptămâna următoare e gata de aprobat.
 */
export async function sendWeeklyProposalCreatedNotification(
  recipientUserIds: string[],
  weekLabel: string
): Promise<void> {
  if (recipientUserIds.length === 0) return;
  const subs = await getSubscriptionsForUsers(recipientUserIds);
  if (subs.length === 0) return;
  await sendPushToSubscriptions(subs, {
    title: "Propunere program săptămână",
    body: `Programul pentru ${weekLabel} e gata. Deschide aplicația și aprobă.`,
    url: "/",
  });
}

/**
 * Notifică celălalt părinte că partenerul a aprobat propunerea.
 */
export async function sendProposalApprovedByOtherNotification(
  recipientUserId: string,
  approverLabel: string,
  weekLabel: string
): Promise<void> {
  const subs = await getSubscriptionsForUsers([recipientUserId]);
  if (subs.length === 0) return;
  await sendPushToSubscriptions(subs, {
    title: "Program aprobat",
    body: `${approverLabel} a aprobat programul pentru ${weekLabel}. Dacă și tu aprobi, se aplică automat.`,
    url: "/",
  });
}

/**
 * Notifică ambii părinți că programul a fost aplicat (ambele aprobări).
 */
export async function sendProposalAppliedNotification(
  recipientUserIds: string[],
  weekLabel: string
): Promise<void> {
  if (recipientUserIds.length === 0) return;
  const subs = await getSubscriptionsForUsers(recipientUserIds);
  if (subs.length === 0) return;
  await sendPushToSubscriptions(subs, {
    title: "Program aplicat",
    body: `Programul pentru ${weekLabel} a fost aplicat. Verifică calendarul.`,
    url: "/",
  });
}

/**
 * Notifică ceilalți membri ai familiei (push + email) când un eveniment este modificat
 * și mai sunt cel mult 3 zile până la data evenimentului.
 */
export async function sendEventUpdatedNotification(
  db: Db,
  familyId: ObjectId,
  event: ScheduleEvent,
  editorUserId: string,
  editorLabel: string
): Promise<void> {
  const family = await db.collection("families").findOne({ _id: familyId }, { projection: { memberIds: 1 } });
  const memberIds = (family as { memberIds?: unknown[] } | null)?.memberIds ?? [];
  const recipientIds = memberIds.map((id) => String(id)).filter((id) => id !== editorUserId);
  if (recipientIds.length === 0) return;

  const dateLabel = format(new Date(event.date + "T12:00:00"), "EEEE, d MMM", { locale: ro });
  const label = getEventDisplayLabel(event);
  const time =
    event.startTime || event.endTime ? [event.startTime, event.endTime].filter(Boolean).join(" – ") : null;
  const body = time ? `${label} (${time})` : label;
  const title = `Eveniment modificat: ${dateLabel}`;
  const who = editorLabel.trim() || "Un părinte";

  const subs = await getSubscriptionsForUsers(recipientIds);
  if (subs.length > 0) {
    await sendPushToSubscriptions(subs, { title, body, url: "/" });
  }

  const { ObjectId } = await import("mongodb");
  const oids = recipientIds.map((id) => new ObjectId(id));
  const users = await db.collection("users").find({ _id: { $in: oids } }).project({ email: 1 }).toArray();
  const emails = users.map((u) => (u as { email?: string }).email).filter((e): e is string => typeof e === "string" && e.length > 0);
  if (emails.length > 0) {
    await sendEmail({
      to: emails,
      subject: `HomeSplit – ${title}`,
      html: `<p><strong>${who}</strong> a modificat un eveniment din calendar.</p><p><strong>${dateLabel}</strong>: ${body}</p><p>Deschide aplicația pentru detalii.</p>`,
      text: `${who} a modificat un eveniment: ${dateLabel} – ${body}. Deschide aplicația.`,
    });
  }
}
