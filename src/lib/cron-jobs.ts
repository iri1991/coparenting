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
import { collectOccurrenceSlotsForReminder } from "@/lib/recurring-activity";
import type { RecurringActivityOverride, Weekday } from "@/types/recurring-activity";
import { sendInactivityReminderEmail, sendPendingInvitationReminderEmail } from "@/lib/email";

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
    // Sărim dacă deja există o propunere pentru această săptămână (pending / aprobată / refuzată).
    // O propunere refuzată nu trebuie regenerată.
    const existing = await db.collection("schedule_proposals").findOne({ familyId, weekStart });
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
 * Reminder pentru activitățile recurente săptămânale ale copilului (ex. balet, înot).
 * Rulează pe minut. Pentru fiecare activitate activă verifică dacă ziua + ora (minus lead)
 * corespund momentului curent (Europe/Bucharest) și notifică responsabilul din acel moment
 * (părintele care e cu copilul în calendar; dacă e „other"/necunoscut → ambii părinți).
 */
export async function runActivityReminderJob(nowTimeLabel: string, nowDate: string) {
  const db = await getDb();

  function eventParentFromDoc(
    doc: { type?: string | null; parent?: string | null }
  ): "tata" | "mama" | "together" | "other" | null {
    if (doc.parent != null) {
      if (
        doc.parent === "tata" ||
        doc.parent === "mama" ||
        doc.parent === "together" ||
        doc.parent === "other"
      )
        return doc.parent;
      return null;
    }
    switch (doc.type ?? "other") {
      case "tunari":
        return "tata";
      case "otopeni":
        return "mama";
      case "together":
        return "together";
      default:
        return null;
    }
  }

  const activities = await db
    .collection("family_recurring_activities")
    .find({ active: { $ne: false }, timeLabel: { $type: "string", $ne: "" } })
    .toArray();

  const familyIds = [
    ...new Set(
      (activities as unknown as { familyId: ObjectId }[]).map((a) => a.familyId)
    ),
  ];
  const overrideDocs =
    familyIds.length > 0
      ? await db
          .collection("family_recurring_activity_overrides")
          .find({ familyId: { $in: familyIds } })
          .toArray()
      : [];

  const overrides: RecurringActivityOverride[] = (overrideDocs as {
    _id: ObjectId;
    activityId: ObjectId;
    date: string;
    timeLabel?: string;
    skipped?: boolean;
    replacesDate?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[]).map((o) => ({
    id: String(o._id),
    activityId: String(o.activityId),
    date: o.date,
    timeLabel: o.timeLabel?.trim() || "",
    skipped: o.skipped === true,
    replacesDate: o.replacesDate?.trim() || undefined,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  }));

  const slots = collectOccurrenceSlotsForReminder({
    nowTimeLabel,
    nowDate,
    activities: (activities as {
      _id: ObjectId;
      familyId: ObjectId;
      title: string;
      weekday?: string;
      timeLabel?: string;
      reminderLeadMinutes?: number;
      active?: boolean;
    }[]).map((a) => {
      const wd = a.weekday;
      const weekday: Weekday =
        wd === "mon" || wd === "tue" || wd === "wed" || wd === "thu" || wd === "fri" || wd === "sat" || wd === "sun"
          ? wd
          : "mon";
      return {
        _id: String(a._id),
        familyId: String(a.familyId),
        title: a.title,
        weekday,
        timeLabel: a.timeLabel ?? "",
        reminderLeadMinutes: a.reminderLeadMinutes ?? 0,
        active: a.active,
      };
    }),
    overrides,
  });

  let remindersSent = 0;
  const familyMembersCache = new Map<
    string,
    { memberIds: string[]; usersByParentType: Map<"tata" | "mama", string[]>; familyOid: ObjectId }
  >();
  const caretakerByFamilyAndDateCache = new Map<string, "tata" | "mama" | "together" | "other" | null>();

  for (const slot of slots) {
    const familyOid = new ObjectId(slot.familyId);
    const activityOid = new ObjectId(slot.activityId);
    const familyKey = slot.familyId;

    let familyEntry = familyMembersCache.get(familyKey);
    if (!familyEntry) {
      const family = await db.collection("families").findOne({ _id: familyOid }, { projection: { memberIds: 1 } });
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
      familyEntry = { memberIds, usersByParentType, familyOid };
      familyMembersCache.set(familyKey, familyEntry);
    }

    const { memberIds, usersByParentType } = familyEntry;
    if (memberIds.length === 0) continue;

    const activityDate = slot.activityDate;
    const caretakerCacheKey = `${familyKey}|${activityDate}`;
    let caretakerNow = caretakerByFamilyAndDateCache.get(caretakerCacheKey);
    if (caretakerNow === undefined) {
      const eventNow = await db.collection("schedule_events").findOne(
        { familyId: familyOid, date: activityDate },
        {
          projection: { parent: 1, type: 1, createdAt: 1 },
          sort: { createdAt: -1, _id: -1 },
        }
      );
      caretakerNow = eventParentFromDoc((eventNow as { parent?: string | null; type?: string | null } | null) ?? {});
      caretakerByFamilyAndDateCache.set(caretakerCacheKey, caretakerNow);
    }

    let recipientUserIds: string[];
    if (caretakerNow === "tata" || caretakerNow === "mama") {
      recipientUserIds = usersByParentType.get(caretakerNow) ?? [];
    } else {
      recipientUserIds = memberIds;
    }
    if (recipientUserIds.length === 0) continue;

    const pendingRecipients: string[] = [];
    for (const uid of recipientUserIds) {
      const already = await db.collection("activity_reminder_logs").findOne({
        familyId: familyOid,
        activityId: activityOid,
        userId: uid,
        date: activityDate,
        timeLabel: nowTimeLabel,
      });
      if (!already) pendingRecipients.push(uid);
    }
    if (pendingRecipients.length === 0) continue;

    const subs = await getSubscriptionsForUsers(pendingRecipients);
    if (subs.length === 0) continue;

    const lead = slot.leadMinutes;
    await sendPushToSubscriptions(subs, {
      title: `Activitate: ${slot.title}`,
      body:
        lead > 0
          ? `În ${lead} min: „${slot.title}” (la ${slot.timeLabel}).`
          : `E timpul pentru „${slot.title}” (${slot.timeLabel}).`,
      url: homeAppUrl({ tab: "rutine", hash: "recurring-activities" }),
    });
    remindersSent += subs.length;

    const now = new Date();
    await db.collection("activity_reminder_logs").insertMany(
      pendingRecipients.map((uid) => ({
        familyId: familyOid,
        activityId: activityOid,
        userId: uid,
        date: activityDate,
        timeLabel: nowTimeLabel,
        createdAt: now,
      }))
    );
  }

  return {
    ok: true,
    time: nowTimeLabel,
    date: nowDate,
    activitiesMatched: activities.length,
    slotsMatched: slots.length,
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

  // Only fetch scheduled plans – on_demand plans have no fixed times and don't get reminders
  const plans = await db
    .collection("child_treatment_plans")
    .find({ active: { $ne: false }, administrationMode: { $ne: "on_demand" } })
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

/**
 * Reminder pentru utilizatorii inactivi (nu au folosit aplicația 5+ zile).
 * Trimite push + email. Deduplică: cel mult un reminder la 5 zile per user.
 * Rulează zilnic.
 */
export async function runInactivityReminderJob() {
  const db = await getDb();
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

  // Utilizatori inactivi: lastActiveAt absent sau > 5 zile în urmă
  // ȘI nu au primit deja un reminder în ultimele 5 zile
  const users = await db.collection("users").find({
    $and: [
      {
        $or: [
          { lastActiveAt: { $lt: fiveDaysAgo } },
          { lastActiveAt: { $exists: false } },
        ],
      },
      {
        $or: [
          { lastInactivityReminderSentAt: { $lt: fiveDaysAgo } },
          { lastInactivityReminderSentAt: { $exists: false } },
        ],
      },
      // Cont creat cu cel puțin 5 zile în urmă (nu spam pe utilizatori noi)
      { createdAt: { $lt: fiveDaysAgo } },
    ],
  }).project({ _id: 1, email: 1, name: 1 }).toArray() as {
    _id: ObjectId;
    email?: string;
    name?: string;
  }[];

  let pushSent = 0;
  let emailSent = 0;
  const now = new Date();

  for (const user of users) {
    const userId = String(user._id);
    const email = user.email ?? "";
    if (!email) continue;

    // Push notification
    const subs = await getSubscriptionsForUsers([userId]);
    if (subs.length > 0) {
      await sendPushToSubscriptions(subs, {
        title: "HomeSplit te așteaptă 👋",
        body: "Nu ai mai deschis aplicația de câteva zile. Verifică programul copilului.",
        url: "/",
      });
      pushSent += subs.length;
    }

    // Email
    const sent = await sendInactivityReminderEmail(email, user.name);
    if (sent) emailSent++;

    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { lastInactivityReminderSentAt: now } }
    );
  }

  return { ok: true, usersChecked: users.length, pushSent, emailSent };
}

/**
 * Reminder pentru invitații pending care nu au fost acceptate.
 * Trimite email la adresa invitată. Deduplică: cel mult o dată la 3 zile per invitație.
 * Rulează zilnic.
 */
export async function runPendingInvitationReminderJob() {
  const db = await getDb();
  const now = new Date();
  const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://homesplit.ro";

  const invitations = await db.collection("invitations").find({
    status: "pending",
    expiresAt: { $gt: now },
    createdAt: { $lt: oneDayAgo }, // cel puțin 1 zi de când a fost trimisă
    $or: [
      { lastReminderSentAt: { $lt: threeDaysAgo } },
      { lastReminderSentAt: { $exists: false } },
    ],
  }).toArray() as {
    _id: ObjectId;
    email: string;
    token: string;
    invitedByUserId?: string;
  }[];

  // Colectează numele invitanților
  const inviterIds = [...new Set(
    invitations.map((i) => i.invitedByUserId).filter(Boolean) as string[]
  )];
  const inviters = inviterIds.length > 0
    ? await db.collection("users")
        .find({ _id: { $in: inviterIds.map((id) => new ObjectId(id)) } })
        .project({ _id: 1, name: 1 })
        .toArray() as { _id: ObjectId; name?: string }[]
    : [];
  const inviterNameById = new Map(inviters.map((u) => [String(u._id), u.name ?? null]));

  let emailSent = 0;
  for (const inv of invitations) {
    const joinUrl = `${baseUrl}/join?token=${inv.token}`;
    const inviterName = inv.invitedByUserId ? (inviterNameById.get(inv.invitedByUserId) ?? null) : null;
    const sent = await sendPendingInvitationReminderEmail(inv.email, inviterName, joinUrl);
    if (sent) {
      emailSent++;
      await db.collection("invitations").updateOne(
        { _id: inv._id },
        { $set: { lastReminderSentAt: now } }
      );
    }
  }

  return { ok: true, invitationsChecked: invitations.length, emailSent };
}
