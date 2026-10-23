/** Utilitare de dată fără dependențe (luni ca prima zi a săptămânii, ca pe web). */
export const MONTHS_RO = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
export const WEEKDAYS_SHORT_RO = ["L", "Ma", "Mi", "J", "V", "S", "D"];
const WEEKDAYS_LONG_RO = ["duminică", "luni", "marți", "miercuri", "joi", "vineri", "sâmbătă"];

export function ymd(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function parseYmd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Zilele afișate în grila lunii (săptămâni întregi, de luni până duminică). */
export function monthGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - offset);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const days = Math.ceil((offset + last.getDate()) / 7) * 7;
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function monthLabel(d: Date): string {
  return `${MONTHS_RO[d.getMonth()]} ${d.getFullYear()}`;
}

export function dayLabel(d: Date): string {
  const today = ymd(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (ymd(d) === today) return "Azi";
  if (ymd(d) === ymd(tomorrow)) return "Mâine";
  const w = WEEKDAYS_LONG_RO[d.getDay()];
  return `${w.charAt(0).toUpperCase()}${w.slice(1)}, ${d.getDate()} ${MONTHS_RO[d.getMonth()]}`;
}

export function timeLabel(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
