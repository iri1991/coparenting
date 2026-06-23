/** Cui îi revine ziua specială. „alternate” = se schimbă în fiecare an. */
export type SpecialDayAssignment = "tata" | "mama" | "together" | "alternate";

/** Părintele rezolvat pentru un an (fără „alternate”). */
export type ResolvedHolder = "tata" | "mama" | "together";

/** Recurență: anuală (aceeași lună+zi în fiecare an) sau o singură dată. */
export type SpecialDayRecurrence = "annual" | "oneoff";

export const SPECIAL_DAY_EMOJIS = ["🗓️", "🎄", "🎂", "🎃", "🐣", "🎓", "🏖️", "❤️", "🎉", "⛪"];

/**
 * O zi specială (sărbătoare, ziua copilului, prima zi de școală) cu repartizare
 * între părinți și, opțional, alternanță automată pe ani. Elimină renegocierea
 * acelorași zile în fiecare an.
 */
export interface SpecialDay {
  id: string;
  title: string;
  emoji: string;
  recurrence: SpecialDayRecurrence;
  /** Pentru recurrence === "annual". */
  month?: number; // 1–12
  day?: number; // 1–31
  /** Pentru recurrence === "oneoff" (YYYY-MM-DD). */
  date?: string;
  assignment: SpecialDayAssignment;
  /** Pentru assignment === "alternate": anul de referință și cine îl are atunci. */
  alternateAnchorYear?: number;
  alternateAnchorParent?: "tata" | "mama";
  note?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/** Data zilei speciale în anul dat (YYYY-MM-DD), sau null dacă nu se aplică acelui an. */
export function resolveSpecialDayDate(day: SpecialDay, year: number): string | null {
  if (day.recurrence === "oneoff") {
    if (!day.date) return null;
    return Number(day.date.slice(0, 4)) === year ? day.date : null;
  }
  if (!day.month || !day.day) return null;
  return `${year}-${String(day.month).padStart(2, "0")}-${String(day.day).padStart(2, "0")}`;
}

/** Cine are copilul în ziua specială, pentru anul dat (rezolvă alternanța). */
export function resolveSpecialDayHolder(day: SpecialDay, year: number): ResolvedHolder {
  if (day.assignment !== "alternate") return day.assignment;
  const anchorYear = day.alternateAnchorYear ?? year;
  const anchorParent = day.alternateAnchorParent ?? "tata";
  const even = (year - anchorYear) % 2 === 0;
  if (even) return anchorParent;
  return anchorParent === "tata" ? "mama" : "tata";
}

/** Următoarea ocurență (>= azi) ca {date, year}, pentru sortare și afișare. */
export function nextSpecialDayOccurrence(
  day: SpecialDay,
  todayStr: string
): { date: string; year: number } | null {
  if (day.recurrence === "oneoff") {
    if (!day.date) return null;
    return { date: day.date, year: Number(day.date.slice(0, 4)) };
  }
  const thisYear = Number(todayStr.slice(0, 4));
  for (const y of [thisYear, thisYear + 1]) {
    const occ = resolveSpecialDayDate(day, y);
    if (occ && occ >= todayStr) return { date: occ, year: y };
  }
  const occ = resolveSpecialDayDate(day, thisYear + 1);
  return occ ? { date: occ, year: thisYear + 1 } : null;
}
