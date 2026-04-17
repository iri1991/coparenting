import type { ParentType } from "@/types/events";

/** Eveniment calendar pe o zi (aceeași dată YYYY-MM-DD). */
export interface ScheduleDaySlot {
  parent: ParentType;
  startTime?: string | null;
  endTime?: string | null;
}

const DAY_MINUTES = 24 * 60;

/** Parsează HH:mm sau H:mm → minute de la miezul nopții; invalid → null. */
export function timeStrToMinutes(t: string | null | undefined): number | null {
  if (t == null || typeof t !== "string") return null;
  const m = t.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min) || h > 23 || min > 59) return null;
  return h * 60 + min;
}

function sortKeyStart(slot: ScheduleDaySlot): number {
  const m = timeStrToMinutes(slot.startTime);
  if (m != null) return m;
  return -1;
}

function slotsSorted(slots: ScheduleDaySlot[]): ScheduleDaySlot[] {
  return [...slots].sort((a, b) => {
    const ka = sortKeyStart(a);
    const kb = sortKeyStart(b);
    if (ka !== kb) return ka - kb;
    return 0;
  });
}

function dayHasAnyClockTime(slots: ScheduleDaySlot[]): boolean {
  return slots.some(
    (s) =>
      (s.startTime != null && String(s.startTime).trim() !== "") ||
      (s.endTime != null && String(s.endTime).trim() !== "")
  );
}

export interface DayMinuteSegment {
  start: number;
  end: number;
  parent: ParentType;
}

/**
 * Împarte ziua în segmente [start, end) în minute, pe baza evenimentelor.
 * Dacă niciun eveniment nu are oră, întreaga zi revine la primul slot (comportament vechi).
 */
export function buildDaySegments(slots: ScheduleDaySlot[]): DayMinuteSegment[] {
  if (slots.length === 0) return [];
  const sorted = slotsSorted(slots);
  if (!dayHasAnyClockTime(sorted)) {
    return [{ start: 0, end: DAY_MINUTES, parent: sorted[0].parent }];
  }

  const out: DayMinuteSegment[] = [];
  let cursor = 0;

  for (let i = 0; i < sorted.length; i++) {
    const s = sorted[i];
    const explicitStart = timeStrToMinutes(s.startTime);
    const start = explicitStart != null ? Math.max(explicitStart, cursor) : cursor;
    const next = sorted[i + 1];
    const nextStart = next ? timeStrToMinutes(next.startTime) : null;

    let end = timeStrToMinutes(s.endTime);
    if (end == null) {
      end = nextStart != null ? nextStart : DAY_MINUTES;
    }
    if (nextStart != null && end > nextStart) end = nextStart;

    end = Math.min(DAY_MINUTES, Math.max(start, end));
    if (end > start) {
      out.push({ start, end, parent: s.parent });
      cursor = end;
    } else {
      cursor = Math.max(cursor, start);
    }
  }

  return out;
}

/** Minute cu fiecare părinte (fără gap-uri neacoperite). */
export function minutesByParentForDay(slots: ScheduleDaySlot[]): Map<ParentType, number> {
  const map = new Map<ParentType, number>();
  for (const seg of buildDaySegments(slots)) {
    const len = seg.end - seg.start;
    if (len <= 0) continue;
    map.set(seg.parent, (map.get(seg.parent) ?? 0) + len);
  }
  return map;
}

/**
 * Părintele „cu copilul” pentru ritual: la timeLabel în segmentul care îl conține;
 * fără timeLabel → segmentul cel mai lung (egalitate: primul cronologic).
 */
export function resolveParentForRitualOnDay(
  slots: ScheduleDaySlot[],
  ritualTimeLabel: string | null | undefined
): ParentType | null {
  if (slots.length === 0) return null;
  const segments = buildDaySegments(slots);
  if (segments.length === 0) return slots[0].parent;

  const ritualMin = timeStrToMinutes(ritualTimeLabel ?? null);
  if (ritualMin != null) {
    for (const seg of segments) {
      if (ritualMin >= seg.start && ritualMin < seg.end) return seg.parent;
    }
    // ora nu cade într-un interval programat → același criteriu ca fără oră (segment dominant)
  }

  let best = segments[0];
  for (const seg of segments) {
    const d = seg.end - seg.start;
    const bd = best.end - best.start;
    if (d > bd) best = seg;
  }
  return best.parent;
}
