import type { ParentType } from "@/types/events";
import type { RitualResponsibleParent } from "@/types/ritual";
import { addDaysToDateString } from "@/lib/date-bucharest";
import { resolveParentForRitualOnDay, type ScheduleDaySlot } from "@/lib/schedule-parent-by-time";

export type RitualReportCaretaker = ParentType;

export interface RitualReportInputRitual {
  id: string;
  title: string;
  /** Opțional HH:mm — raportul alege părintele din segmentul programului care conține ora. */
  timeLabel?: string | null;
  responsibleParent: RitualResponsibleParent;
  active: boolean;
}

export interface RitualReportCaretakerStats {
  eligible: number;
  done: number;
  missed: number;
}

export interface RitualReportRow {
  ritualId: string;
  title: string;
  responsibleParent: RitualResponsibleParent;
  active: boolean;
  byCaretaker: Record<RitualReportCaretaker, RitualReportCaretakerStats>;
  totals: { eligible: number; done: number; missed: number };
}

const EMPTY_BUCKET: RitualReportCaretakerStats = { eligible: 0, done: 0, missed: 0 };

function emptyBuckets(): Record<RitualReportCaretaker, RitualReportCaretakerStats> {
  return {
    tata: { ...EMPTY_BUCKET },
    mama: { ...EMPTY_BUCKET },
    together: { ...EMPTY_BUCKET },
  };
}

/** Ziua contează pentru ritual dacă părintele responsabil (sau amândoi) se potrivește cu programul. */
export function ritualAppliesOnDay(responsible: RitualResponsibleParent, caretaker: ParentType): boolean {
  if (responsible === "both") return true;
  if (caretaker === "together") return true;
  return responsible === caretaker;
}

function isValidYmd(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/** Generează toate zilele YYYY-MM-DD între from și to (inclusiv). Presupune from <= to. */
export function iterateDateRangeInclusive(from: string, to: string): string[] {
  if (!isValidYmd(from) || !isValidYmd(to) || from > to) return [];
  const out: string[] = [];
  let d = from;
  while (d <= to) {
    out.push(d);
    d = addDaysToDateString(d, 1);
  }
  return out;
}

/**
 * Construiește raport: pentru fiecare zi cu program, dacă ritualul se aplică,
 * numără bifat vs nebifat, pe bucket-ul „cine era cu copilul” (tata / mama / together).
 * `slotsByDate`: evenimentele calendar pe zi; ora (dacă există) determină părintele pentru ritual.
 */
export function buildRitualReport(
  rituals: RitualReportInputRitual[],
  slotsByDate: Map<string, ScheduleDaySlot[]>,
  checkinKeys: Set<string>
): RitualReportRow[] {
  const dates = [...slotsByDate.keys()].sort();

  return rituals.map((ritual) => {
    const byCaretaker = emptyBuckets();
    let eligible = 0;
    let done = 0;
    let missed = 0;

    for (const date of dates) {
      const slots = slotsByDate.get(date);
      if (!slots?.length) continue;
      const caretaker = resolveParentForRitualOnDay(slots, ritual.timeLabel);
      if (!caretaker) continue;
      if (!ritualAppliesOnDay(ritual.responsibleParent, caretaker)) continue;

      eligible += 1;
      const key = `${ritual.id}|${date}`;
      const isDone = checkinKeys.has(key);

      byCaretaker[caretaker].eligible += 1;
      if (isDone) {
        byCaretaker[caretaker].done += 1;
        done += 1;
      } else {
        byCaretaker[caretaker].missed += 1;
        missed += 1;
      }
    }

    return {
      ritualId: ritual.id,
      title: ritual.title,
      responsibleParent: ritual.responsibleParent,
      active: ritual.active,
      byCaretaker,
      totals: { eligible, done, missed },
    };
  });
}

/** Limitează intervalul pentru API (zile). */
export const RITUAL_REPORT_MAX_RANGE_DAYS = 400;
