import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { getDb } from "@/lib/mongodb";
import { getEventDisplayLabel } from "@/types/events";
import { getSubscriptionsForUsers, sendPushToSubscriptions } from "@/lib/push";
import type { ScheduleEvent } from "@/types/events";

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
 * Notifică părintele care a blocat ziua că celălalt a încercat să adauge program cu Eva în perioada blocată.
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
    body: `${attemptedByParentLabel} a încercat să programeze cu Eva pe ${dateLabel}, dar ai acea zi blocată.`,
    url: "/",
  });
}
