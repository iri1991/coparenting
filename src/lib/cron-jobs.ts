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
import { addDaysToDateString } from "@/lib/date-bucharest";

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

  function deriveFromType(type: string): "tata" | "mama" | "together" {
    switch (type) {
      case "tunari":
        return "tata";
      case "otopeni":
        return "mama";
      case "together":
        return "together";
      default:
        return "tata";
    }
  }

  function eventParentFromDoc(doc: { type?: string | null; parent?: string | null }): "tata" | "mama" | "together" | null {
    if (doc.parent != null) {
      if (doc.parent === "tata" || doc.parent === "mama" || doc.parent === "together") return doc.parent;
      return null;
    }
    return deriveFromType(doc.type ?? "other");
  }

  function triggerAt(timeLabel: string, leadMinutes: number): string {
    const [hh, mm] = timeLabel.split(":").map((x) => Number(x));
    const total = hh * 60 + mm - Math.max(0, leadMinutes);
    const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
    const h2 = String(Math.floor(normalized / 60)).padStart(2, "0");
    const m2 = String(normalized % 60).padStart(2, "0");
    return `${h2}:${m2}`;
  }

  function ritualDateAtNotificationTime(nowDateValue: string, ritualTimeLabel: string, leadMinutes: number): string {
    const [ritualHh, ritualMm] = ritualTimeLabel.split(":").map((x) => Number(x));
    const ritualTotal = ritualHh * 60 + ritualMm;
    const triggerTotal = ritualTotal - Math.max(0, leadMinutes);
    if (triggerTotal < 0) return addDaysToDateString(nowDateValue, 1);
    return nowDateValue;
  }

  const rituals = await db
    .collection("family_rituals")
    .find({ active: { $ne: false }, timeLabel: { $type: "string", $ne: "" } })
    .toArray();

  let remindersSent = 0;
  const familyMembersCache = new Map<
    string,
    { memberIds: string[]; usersByParentType: Map<"tata" | "mama", string[]> }
  >();
  const caretakerByFamilyAndDateCache = new Map<string, "tata" | "mama" | "together" | null>();
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

    const ritualDate = ritualDateAtNotificationTime(nowDate, ritual.timeLabel, lead);
    const familyKey = String(ritual.familyId);
    let familyEntry = familyMembersCache.get(familyKey);
    if (!familyEntry) {
      const family = await db
        .collection("families")
        .findOne({ _id: ritual.familyId }, { projection: { memberIds: 1 } });
      const memberIds = ((family as { memberIds?: string[] } | null)?.memberIds ?? []).map(String);
      const users = await db
        .collection("users")
        .find({ _id: { $in: memberIds.map((id) => new ObjectId(id)) } })
        .project({ _id: 1, parentType: 1 })
        .toArray();
      const usersByParentType = new Map<"tata" | "mama", string[]>();
      for (const user of users as { _id: ObjectId; parentType?: string }[]) {
        if (user.parentType !== "tata" && user.parentType !== "mama") continue;
        const list = usersByParentType.get(user.parentType) ?? [];
        list.push(String(user._id));
        usersByParentType.set(user.parentType, list);
      }
      familyEntry = { memberIds, usersByParentType };
      familyMembersCache.set(familyKey, familyEntry);
    }

    const { memberIds, usersByParentType } = familyEntry;
    if (memberIds.length === 0) continue;

    const caretakerCacheKey = `${familyKey}|${ritualDate}`;
    let caretakerNow = caretakerByFamilyAndDateCache.get(caretakerCacheKey);
    if (caretakerNow === undefined) {
      const eventNow = await db.collection("schedule_events").findOne(
        { familyId: ritual.familyId, date: ritualDate },
        {
          projection: { parent: 1, type: 1, createdAt: 1 },
          sort: { createdAt: -1, _id: -1 },
        }
      );
      caretakerNow = eventParentFromDoc((eventNow as { parent?: string | null; type?: string | null } | null) ?? {});
      caretakerByFamilyAndDateCache.set(caretakerCacheKey, caretakerNow);
    }

    let recipientUserIds: string[] = [];
    if (caretakerNow === "together") {
      recipientUserIds = memberIds;
    } else if (caretakerNow === "tata" || caretakerNow === "mama") {
      recipientUserIds = usersByParentType.get(caretakerNow) ?? [];
    }
    if (recipientUserIds.length === 0) continue;

    // dedupe per user/date/time/ritual
    const pendingRecipients: string[] = [];
    for (const uid of recipientUserIds) {
      const already = await db.collection("ritual_reminder_logs").findOne({
        familyId: ritual.familyId,
        ritualId: ritual._id,
        userId: uid,
        date: ritualDate,
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
      url: homeAppUrl({ tab: "rutine", hash: "rituals" }),
    });
    remindersSent += subs.length;

    const now = new Date();
    if (pendingRecipients.length > 0) {
      await db.collection("ritual_reminder_logs").insertMany(
        pendingRecipients.map((uid) => ({
          familyId: ritual.familyId,
          ritualId: ritual._id,
          userId: uid,
          date: ritualDate,
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

/**
 * Reminder pentru planuri de tratament (medicamente) pe orele setate.
 * Trimite către părintele responsabil (sau ambii), filtrat după cine e cu copilul în ziua respectivă.
 */
export async function runTreatmentReminderJob(nowTimeLabel: string, nowDate: string) {
  const db = await getDb();

  function triggerAt(timeLabel: string, leadMinutes: number): string {
    const [hh, mm] = timeLabel.split(":").map((x) => Number(x));
    const total = hh * 60 + mm - Math.max(0, leadMinutes);
    const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
    return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
  }

  function ritualDateAtNotificationTime(nowDateValue: string, plannedTimeLabel: string, leadMinutes: number): string {
    const [hh, mm] = plannedTimeLabel.split(":").map((x) => Number(x));
    const triggerTotal = hh * 60 + mm - Math.max(0, leadMinutes);
    if (triggerTotal < 0) return addDaysToDateString(nowDateValue, 1);
    return nowDateValue;
  }

  function matchesRecurrence(
    treatmentDate: string,
    startDate: string,
    recurrenceType?: "daily" | "interval",
    recurrenceIntervalDays?: number | null
  ): boolean {
    if (recurrenceType !== "interval") return true;
    const interval =
      typeof recurrenceIntervalDays === "number" && Number.isFinite(recurrenceIntervalDays)
        ? Math.max(1, Math.floor(recurrenceIntervalDays))
        : 1;
    const start = new Date(`${startDate}T00:00:00`).getTime();
    const current = new Date(`${treatmentDate}T00:00:00`).getTime();
    const days = Math.floor((current - start) / (24 * 60 * 60 * 1000));
    return days >= 0 && days % interval === 0;
  }

  const plans = await db
    .collection("child_treatment_plans")
    .find({ active: { $ne: false } })
    .project({
      familyId: 1,
      childId: 1,
      medicationName: 1,
      dosage: 1,
      startDate: 1,
      endDate: 1,
      times: 1,
      recurrenceType: 1,
      recurrenceIntervalDays: 1,
      reminderLeadMinutes: 1,
      responsibleParent: 1,
    })
    .toArray();

  let remindersSent = 0;
  for (const plan of plans as {
    _id: ObjectId;
    familyId: ObjectId;
    childId: ObjectId;
    medicationName: string;
    dosage: string;
    startDate: string;
    endDate?: string | null;
    times?: string[];
    recurrenceType?: "daily" | "interval";
    recurrenceIntervalDays?: number | null;
    reminderLeadMinutes?: number;
    responsibleParent?: "tata" | "mama" | "both";
  }[]) {
    const times = Array.isArray(plan.times) ? plan.times.filter((t) => /^\d{2}:\d{2}$/.test(t)) : [];
    if (times.length === 0) continue;
    const lead = typeof plan.reminderLeadMinutes === "number" ? Math.max(0, Math.floor(plan.reminderLeadMinutes)) : 0;

    for (const timeLabel of times) {
      const whenToSend = triggerAt(timeLabel, lead);
      if (whenToSend !== nowTimeLabel) continue;
      const treatmentDate = ritualDateAtNotificationTime(nowDate, timeLabel, lead);
      if (plan.startDate > treatmentDate) continue;
      if (plan.endDate && plan.endDate < treatmentDate) continue;
      if (!matchesRecurrence(treatmentDate, plan.startDate, plan.recurrenceType, plan.recurrenceIntervalDays)) continue;

      const eventNow = await db.collection("schedule_events").findOne(
        { familyId: plan.familyId, date: treatmentDate },
        { projection: { parent: 1, type: 1 }, sort: { createdAt: -1, _id: -1 } }
      );
      const parentRaw = (eventNow as { parent?: unknown } | null)?.parent;
      const caretaker =
        parentRaw === "tata" || parentRaw === "mama" || parentRaw === "together"
          ? parentRaw
          : "together";

      const family = await db.collection("families").findOne({ _id: plan.familyId }, { projection: { memberIds: 1 } });
      const memberIds = ((family as { memberIds?: unknown[] } | null)?.memberIds ?? []).map((x) => String(x));
      if (memberIds.length === 0) continue;

      const users = await db
        .collection("users")
        .find({ _id: { $in: memberIds.map((id) => new ObjectId(id)) } })
        .project({ _id: 1, parentType: 1 })
        .toArray();
      const usersByParent = new Map<"tata" | "mama", string[]>();
      for (const u of users as { _id: ObjectId; parentType?: string }[]) {
        if (u.parentType !== "tata" && u.parentType !== "mama") continue;
        const list = usersByParent.get(u.parentType) ?? [];
        list.push(String(u._id));
        usersByParent.set(u.parentType, list);
      }

      let recipientUserIds: string[] = [];
      const responsible = plan.responsibleParent === "tata" || plan.responsibleParent === "mama" ? plan.responsibleParent : "both";
      if (caretaker === "together") {
        recipientUserIds = responsible === "both" ? memberIds : usersByParent.get(responsible) ?? [];
      } else if (responsible === "both") {
        recipientUserIds = usersByParent.get(caretaker) ?? [];
      } else {
        recipientUserIds = responsible === caretaker ? usersByParent.get(caretaker) ?? [] : [];
      }
      if (recipientUserIds.length === 0) continue;

      const pending: string[] = [];
      for (const uid of recipientUserIds) {
        const already = await db.collection("treatment_reminder_logs").findOne({
          familyId: plan.familyId,
          planId: plan._id,
          userId: uid,
          date: treatmentDate,
          timeLabel,
        });
        if (!already) pending.push(uid);
      }
      if (pending.length === 0) continue;

      const subs = await getSubscriptionsForUsers(pending);
      if (subs.length === 0) continue;
      await sendPushToSubscriptions(subs, {
        title: `Tratament: ${plan.medicationName}`,
        body:
          lead > 0
            ? `În ${lead} min: ${plan.medicationName} (${plan.dosage}) la ${timeLabel}.`
            : `E timpul: ${plan.medicationName} (${plan.dosage}) la ${timeLabel}.`,
        url: "/account",
      });
      remindersSent += subs.length;
      const now = new Date();
      await db.collection("treatment_reminder_logs").insertMany(
        pending.map((uid) => ({
          familyId: plan.familyId,
          childId: plan.childId,
          planId: plan._id,
          userId: uid,
          date: treatmentDate,
          timeLabel,
          createdAt: now,
        }))
      );
    }
  }

  return { ok: true, time: nowTimeLabel, date: nowDate, remindersSent };
}
