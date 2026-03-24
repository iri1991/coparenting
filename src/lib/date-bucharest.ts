import { addDays, format, parse } from "date-fns";

/** Data calendaristică „azi” în Europe/Bucharest (YYYY-MM-DD), aliniată la programul din UI. */
export function getTodayDateStringEuropeBucharest(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Bucharest" });
}

/** Adaugă n zile la un YYYY-MM-DD (calendar simplu, suficient pentru intervale în program). */
export function addDaysToDateString(ymd: string, n: number): string {
  const base = parse(ymd, "yyyy-MM-dd", new Date());
  return format(addDays(base, n), "yyyy-MM-dd");
}
