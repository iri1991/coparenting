import { ObjectId } from "mongodb";
import { addDays, format } from "date-fns";
import { ro } from "date-fns/locale";
import { getDb } from "@/lib/mongodb";
import { getNextMonday, generateProposalForWeek } from "@/lib/proposal";
import { sendWeeklyProposalCreatedNotification } from "@/lib/notify";
import { getEventDisplayLabel } from "@/types/events";
import { getSubscriptionsForUsers, sendPushToSubscriptions } from "@/lib/push";
import { homeAppUrl } from "@/lib/deep-links";
import type { ParentType, LocationType } from "@/types/events";

function deriveFromType(type: string): { parent: ParentType; location: LocationType } {
  switch (type) {
    case "tunari":
      return { parent: "tata", location: "tunari" };
    case "otopeni":
      return { parent: "mama", location: "otopeni" };
    case "together":
      return { parent: "together", location: "other" };
    default:
      return { parent: "tata", location: "other" };
  }
}

function toDisplayEvent(doc: {
  type?: string | null;
  parent?: string | null;
  location?: string | null;
  locationLabel?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}) {
  const hasNew = doc.parent != null && doc.location != null;
  const parent = (hasNew ? doc.parent : deriveFromType(doc.type ?? "other").parent) as ParentType;
  const location = (hasNew ? doc.location : deriveFromType(doc.type ?? "other").location) as LocationType;
  const locationLabel = doc.locationLabel ?? undefined;
  const label = getEventDisplayLabel({ parent, location, locationLabel } as Parameters<typeof getEventDisplayLabel>[0]);
  const time = doc.startTime || doc.endTime ? [doc.startTime, doc.endTime].filter(Boolean).join(" – ") : null;
  return time ? `${label} (${time})` : label;
}

export async function runWeeklyProposalJob() {
  const nextMonday = getNextMonday();
  const weekStart = format(nextMonday, "yyyy-MM-dd");
  const weekEnd = format(addDays(nextMonday, 6), "yyyy-MM-dd");
  const weekLabel = `${format(nextMonday, "d MMM", { locale: ro })} – ${format(new Date(weekEnd + "T12:00:00"), "d MMM yyyy", { locale: ro })}`;

  const db = await getDb();
  const families = await db.collection("families").find({}).project({ _id: 1, memberIds: 1, plan: 1 }).toArray();

  let created = 0;
  for (const fam of families as { _id: ObjectId; memberIds?: string[]; plan?: string }[]) {
    const memberIds = fam.memberIds ?? [];
    if (memberIds.length < 2) continue;
    const plan = fam.plan === "pro" || fam.plan === "family" ? fam.plan : "free";
    if (plan === "free") continue;

    const familyId = fam._id;
    const existing = await db.collection("schedule_proposals").findOne({ familyId, weekStart, status: "pending" });
    if (existing) continue;

    const days = await generateProposalForWeek(familyId, weekStart);
    if (days.length === 0) continue;

    const now = new Date();
    await db.collection("schedule_proposals").insertOne({
      familyId,
      weekStart,
      days,
      approvedBy: {},
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
    created++;
    sendWeeklyProposalCreatedNotification(memberIds, weekLabel).catch((e) =>
      console.error("[cron weekly-proposal] notify", e)
    );
  }

  return {
    ok: true,
    weekStart,
    weekLabel,
    familiesProcessed: families.length,
    proposalsCreated: created,
  };
}

export async function runEveningReminderJob() {
  const tomorrow = addDays(new Date(), 1);
  const tomorrowStr = format(tomorrow, "yyyy-MM-dd");
  const tomorrowLabel = format(tomorrow, "EEEE, d MMM", { locale: ro });

  const db = await getDb();
  const events = await db
    .collection("schedule_events")
    .find({ date: tomorrowStr })
    .sort({ startTime: 1, date: 1 })
    .toArray();
  const families = await db.collection("families").find({}, { projection: { _id: 1, memberIds: 1 } }).toArray();

  let pushSent = 0;
  let familiesNotified = 0;

  for (const family of families as { _id: unknown; memberIds?: unknown[] }[]) {
    const memberIds = (family.memberIds ?? []).map((id) => String(id)).filter(Boolean);
    if (memberIds.length === 0) continue;

    const familyEvents = events.filter((e) => String((e as { familyId?: unknown }).familyId) === String(family._id));
    const subs = await getSubscriptionsForUsers(memberIds);
    if (subs.length === 0) continue;

    if (familyEvents.length === 0) {
      await sendPushToSubscriptions(subs, {
        title: `Mâine: ${tomorrowLabel}`,
        body: "Niciun eveniment programat.",
        url: homeAppUrl({ tab: "program", date: tomorrowStr }),
      });
      pushSent += subs.length;
      familiesNotified += 1;
      continue;
    }

    const lines = familyEvents.map((doc) => toDisplayEvent(doc as Parameters<typeof toDisplayEvent>[0]));
    const body = lines.join(" · ");
    await sendPushToSubscriptions(subs, {
      title: `Mâine: ${tomorrowLabel}`,
      body,
      url: homeAppUrl({ tab: "program", date: tomorrowStr }),
    });
    pushSent += subs.length;
    familiesNotified += 1;
  }

  return {
    ok: true,
    date: tomorrowStr,
    eventsCount: events.length,
    familiesNotified,
    pushSent,
  };
}

/**
 * Reminder punctual pentru ritualuri (ex. 19:30).
 * Rulează pe minut, filtrează ritualurile active cu timeLabel == HH:mm (ora locală RO).
 */
export async function runRitualReminderJob(nowTimeLabel: string, nowDate: string) {
  const db = await getDb();

  function triggerAt(timeLabel: string, leadMinutes: number): string {
    const [hh, mm] = timeLabel.split(":").map((x) => Number(x));
    const total = hh * 60 + mm - Math.max(0, leadMinutes);
    const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
    const h2 = String(Math.floor(normalized / 60)).padStart(2, "0");
    const m2 = String(normalized % 60).padStart(2, "0");
    return `${h2}:${m2}`;
  }

  const rituals = await db
    .collection("family_rituals")
    .find({ active: { $ne: false }, timeLabel: { $type: "string", $ne: "" } })
    .toArray();

  let remindersSent = 0;
  for (const ritual of rituals as {
    _id: ObjectId;
    familyId: ObjectId;
    title: string;
    responsibleParent?: "tata" | "mama" | "both";
    timeLabel?: string;
    reminderLeadMinutes?: number;
  }[]) {
    if (!ritual.timeLabel || !/^\d{2}:\d{2}$/.test(ritual.timeLabel)) continue;
    const lead = typeof ritual.reminderLeadMinutes === "number" ? Math.max(0, Math.floor(ritual.reminderLeadMinutes)) : 0;
    const whenToSend = triggerAt(ritual.timeLabel, lead);
    if (whenToSend !== nowTimeLabel) continue;

    const family = await db
      .collection("families")
      .findOne({ _id: ritual.familyId }, { projection: { memberIds: 1 } });
    const memberIds = ((family as { memberIds?: string[] } | null)?.memberIds ?? []).map(String);
    if (memberIds.length === 0) continue;

    let recipientUserIds: string[] = [];
    if (ritual.responsibleParent === "tata" || ritual.responsibleParent === "mama") {
      const users = await db
        .collection("users")
        .find({ _id: { $in: memberIds.map((id) => new ObjectId(id)) } })
        .project({ _id: 1, parentType: 1 })
        .toArray();
      recipientUserIds = (users as { _id: ObjectId; parentType?: string }[])
        .filter((u) => u.parentType === ritual.responsibleParent)
        .map((u) => String(u._id));
    } else {
      recipientUserIds = memberIds;
    }
    if (recipientUserIds.length === 0) continue;

    // dedupe per user/date/time/ritual
    const pendingRecipients: string[] = [];
    for (const uid of recipientUserIds) {
      const already = await db.collection("ritual_reminder_logs").findOne({
        familyId: ritual.familyId,
        ritualId: ritual._id,
        userId: uid,
        date: nowDate,
        timeLabel: nowTimeLabel,
      });
      if (!already) pendingRecipients.push(uid);
    }
    if (pendingRecipients.length === 0) continue;

    const subs = await getSubscriptionsForUsers(pendingRecipients);
    if (subs.length === 0) continue;

    await sendPushToSubscriptions(subs, {
      title: `Ritual: ${ritual.title}`,
      body:
        lead > 0
          ? `În ${lead} min: „${ritual.title}” (programat la ${ritual.timeLabel}).`
          : `E timpul pentru „${ritual.title}” (${ritual.timeLabel}).`,
      url: homeAppUrl({ tab: "program", hash: "rituals" }),
    });
    remindersSent += subs.length;

    const now = new Date();
    if (pendingRecipients.length > 0) {
      await db.collection("ritual_reminder_logs").insertMany(
        pendingRecipients.map((uid) => ({
          familyId: ritual.familyId,
          ritualId: ritual._id,
          userId: uid,
          date: nowDate,
          timeLabel: nowTimeLabel,
          createdAt: now,
        }))
      );
    }
  }

  return {
    ok: true,
    time: nowTimeLabel,
    date: nowDate,
    ritualsMatched: rituals.length,
    remindersSent,
  };
}
