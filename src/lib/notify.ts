import { format } from "date-fns";
import { ro } from "date-fns/locale";
import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getEventDisplayLabel } from "@/types/events";
import { getSubscriptionsForUsers, sendPushToSubscriptions } from "@/lib/push";
import { homeAppUrl } from "@/lib/deep-links";
import { sendEmail, wrapEmailHtml, emailButtonHtml } from "@/lib/email";
import type { ScheduleEvent } from "@/types/events";

type Db = Awaited<ReturnType<typeof getDb>>;

/**
 * Trimite notificare push membrilor familiei (în afară de creator) când se adaugă un eveniment nou.
 * Nu aruncă erori – doar loghează; apelul nu blochează răspunsul API.
 */
export async function sendNewEventNotification(
  db: Db,
  familyId: ObjectId,
  creatorId: string,
  event: ScheduleEvent
): Promise<void> {
  const family = await db
    .collection("families")
    .findOne({ _id: familyId }, { projection: { memberIds: 1 } });
  const memberIds = ((family as { memberIds?: unknown[] } | null)?.memberIds ?? []).map((id) => String(id));
  const userIds = memberIds.filter((id) => id !== creatorId);
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
    url: homeAppUrl({ tab: "program", date: event.date }),
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
    url: homeAppUrl({ tab: "program", blocked: true }),
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
    url: homeAppUrl({ tab: "hub" }),
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
    url: homeAppUrl({ tab: "hub" }),
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
    url: homeAppUrl({ tab: "program" }),
  });
}

/**
 * Notifică ceilalți membri ai familiei când se adaugă o activitate nouă a copilului.
 */
export async function sendChildActivityAddedNotification(
  recipientUserIds: string[],
  actorLabel: string,
  activityName: string,
  periodEndDate: string
): Promise<void> {
  if (recipientUserIds.length === 0) return;
  const subs = await getSubscriptionsForUsers(recipientUserIds);
  if (subs.length === 0) return;
  const dateLabel = format(new Date(periodEndDate + "T12:00:00"), "d MMM yyyy", { locale: ro });
  await sendPushToSubscriptions(subs, {
    title: "Activitate nouă adăugată",
    body: `${actorLabel} a adăugat „${activityName}” (${dateLabel}).`,
    url: homeAppUrl({ tab: "hub" }),
  });
}

/**
 * Notifică ceilalți membri ai familiei când se adaugă un material util nou.
 */
export async function sendUsefulLinkAddedNotification(
  recipientUserIds: string[],
  actorLabel: string,
  titleLabel: string
): Promise<void> {
  if (recipientUserIds.length === 0) return;
  const subs = await getSubscriptionsForUsers(recipientUserIds);
  if (subs.length === 0) return;
  await sendPushToSubscriptions(subs, {
    title: "Material util nou",
    body: `${actorLabel} a adăugat „${titleLabel}”.`,
    url: homeAppUrl({ tab: "hub" }),
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
  const actionSentence = `${who} a modificat evenimentul de ${dateLabel}: ${body}.`;

  const subs = await getSubscriptionsForUsers(recipientIds);
  if (subs.length > 0) {
    await sendPushToSubscriptions(subs, { title, body, url: homeAppUrl({ tab: "program", date: event.date }) });
  }

  const { ObjectId } = await import("mongodb");
  const oids = recipientIds.map((id) => new ObjectId(id));
  const users = await db.collection("users").find({ _id: { $in: oids } }).project({ email: 1 }).toArray();
  const emails = users.map((u) => (u as { email?: string }).email).filter((e): e is string => typeof e === "string" && e.length > 0);
  if (emails.length > 0) {
    const appUrl = (process.env.NEXTAUTH_URL || "https://homesplit.ro").replace(/\/$/, "");
    const content = `
      <p style="margin: 0 0 16px; font-size: 16px;">${actionSentence}</p>
      <p style="margin: 0 0 8px; font-size: 15px; color: #78716c;">Deschide aplicația pentru a vedea modificările.</p>
      ${emailButtonHtml(appUrl, "Deschide aplicația")}
    `;
    await sendEmail({
      to: emails,
      subject: `HomeSplit – ${title}`,
      html: wrapEmailHtml(content),
      text: `${actionSentence} Deschide aplicația.`,
    });
  }
}
