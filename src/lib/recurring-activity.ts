import { addDays, format, parse } from "date-fns";
import type { RecurringActivity, RecurringActivityOverride, Weekday } from "@/types/recurring-activity";
import { WEEKDAYS, weekdayForDateString } from "@/types/recurring-activity";
import { addDaysToDateString } from "@/lib/date-bucharest";

/** Luni (YYYY-MM-DD) a săptămânii care conține `referenceDate`. */
export function mondayOfWeekContaining(referenceDate: string): string {
  const base = parse(referenceDate, "yyyy-MM-dd", new Date());
  const dow = base.getDay();
  const toMonday = dow === 0 ? -6 : 1 - dow;
  return format(addDays(base, toMonday), "yyyy-MM-dd");
}

/** Data din săptămâna lui `referenceDate` pentru ziua recurentă implicită a activității. */
export function defaultOccurrenceDateInWeek(activityWeekday: Weekday, referenceDate: string): string {
  const monday = mondayOfWeekContaining(referenceDate);
  const idx = WEEKDAYS.indexOf(activityWeekday);
  return addDaysToDateString(monday, idx);
}

export function triggerAt(timeLabel: string, leadMinutes: number): string {
  const [hh, mm] = timeLabel.split(":").map((x) => Number(x));
  const total = hh * 60 + mm - Math.max(0, leadMinutes);
  const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const h2 = String(Math.floor(normalized / 60)).padStart(2, "0");
  const m2 = String(normalized % 60).padStart(2, "0");
  return `${h2}:${m2}`;
}

/** Data evenimentului (poate fi mâine dacă leadul trece de miezul nopții). */
export function activityDateAtNotificationTime(
  nowDateValue: string,
  activityTimeLabel: string,
  leadMinutes: number
): string {
  const [hh, mm] = activityTimeLabel.split(":").map((x) => Number(x));
  const triggerTotal = hh * 60 + mm - Math.max(0, leadMinutes);
  if (triggerTotal < 0) return addDaysToDateString(nowDateValue, 1);
  return nowDateValue;
}

export type OverridesByDate = Map<string, RecurringActivityOverride>;

export function overridesMapForActivity(overrides: RecurringActivityOverride[]): OverridesByDate {
  const m = new Map<string, RecurringActivityOverride>();
  for (const o of overrides) m.set(o.date, o);
  return m;
}

/** Suprimă programul implicit în `date` din cauza unui override (anulat sau mutat). */
export function defaultSuppressedOnDate(
  activity: Pick<RecurringActivity, "weekday">,
  date: string,
  byDate: OverridesByDate,
  allOverridesForActivity: RecurringActivityOverride[]
): boolean {
  const direct = byDate.get(date);
  if (direct?.skipped) return true;
  if (direct && !direct.skipped && weekdayForDateString(date) === activity.weekday) return true;
  for (const o of allOverridesForActivity) {
    if (o.skipped) continue;
    if (o.replacesDate === date) return true;
  }
  return false;
}

export interface OccurrenceSlot {
  activityId: string;
  activityDate: string;
  timeLabel: string;
  leadMinutes: number;
  title: string;
  familyId: string;
}

/** Sloturi care ar trebui să declanșeze reminder la `nowTimeLabel` / `nowDate`. */
export function collectOccurrenceSlotsForReminder(params: {
  nowTimeLabel: string;
  nowDate: string;
  activities: Array<{
    _id: string;
    familyId: string;
    title: string;
    weekday: Weekday;
    timeLabel: string;
    reminderLeadMinutes: number;
    active?: boolean;
  }>;
  overrides: RecurringActivityOverride[];
}): OccurrenceSlot[] {
  const { nowTimeLabel, nowDate, activities, overrides } = params;
  const overridesByActivity = new Map<string, RecurringActivityOverride[]>();
  for (const o of overrides) {
    const list = overridesByActivity.get(o.activityId) ?? [];
    list.push(o);
    overridesByActivity.set(o.activityId, list);
  }

  const slots: OccurrenceSlot[] = [];
  const seen = new Set<string>();

  for (const activity of activities) {
    if (activity.active === false) continue;
    if (!activity.timeLabel || !/^\d{2}:\d{2}$/.test(activity.timeLabel)) continue;

    const lead =
      typeof activity.reminderLeadMinutes === "number"
        ? Math.max(0, Math.floor(activity.reminderLeadMinutes))
        : 0;
    const actOverrides = overridesByActivity.get(activity._id) ?? [];
    const byDate = overridesMapForActivity(actOverrides);

    for (const ov of actOverrides) {
      if (ov.skipped) continue;
      const t = ov.timeLabel?.trim();
      if (!t || !/^\d{2}:\d{2}$/.test(t)) continue;
      const when = triggerAt(t, lead);
      if (when !== nowTimeLabel) continue;
      const activityDate = activityDateAtNotificationTime(nowDate, t, lead);
      if (activityDate !== ov.date) continue;
      const key = `${activity._id}|${activityDate}|${t}`;
      if (seen.has(key)) continue;
      seen.add(key);
      slots.push({
        activityId: activity._id,
        familyId: activity.familyId,
        title: activity.title,
        activityDate,
        timeLabel: t,
        leadMinutes: lead,
      });
    }

    const whenDefault = triggerAt(activity.timeLabel, lead);
    if (whenDefault !== nowTimeLabel) continue;
    const activityDate = activityDateAtNotificationTime(nowDate, activity.timeLabel, lead);
    if (weekdayForDateString(activityDate) !== activity.weekday) continue;
    if (defaultSuppressedOnDate(activity, activityDate, byDate, actOverrides)) continue;

    const key = `${activity._id}|${activityDate}|${activity.timeLabel}`;
    if (seen.has(key)) continue;
    seen.add(key);
    slots.push({
      activityId: activity._id,
      familyId: activity.familyId,
      title: activity.title,
      activityDate,
      timeLabel: activity.timeLabel,
      leadMinutes: lead,
    });
  }

  return slots;
}

/** Pentru UI: calculează `replacesDate` când utilizatorul alege altă zi decât cea implicită. */
export function inferReplacesDate(
  activityWeekday: Weekday,
  occurrenceDate: string
): string | undefined {
  if (weekdayForDateString(occurrenceDate) === activityWeekday) return undefined;
  return defaultOccurrenceDateInWeek(activityWeekday, occurrenceDate);
}
