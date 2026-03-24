import { differenceInYears, parseISO, isValid } from "date-fns";

export function ageYearsFromBirthDate(isoDate: string | undefined | null): number | null {
  if (!isoDate || typeof isoDate !== "string") return null;
  const d = parseISO(isoDate);
  if (!isValid(d)) return null;
  const now = new Date();
  if (d > now) return null;
  return differenceInYears(now, d);
}
