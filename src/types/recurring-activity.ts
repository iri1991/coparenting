/** Coduri zi a săptămânii (potrivite cu Intl weekday:"short" lowercased). */
export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const WEEKDAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/**
 * Activitate recurentă săptămânală a copilului (ex. balet, înot).
 * Se repetă în fiecare săptămână în ziua `weekday` la ora `timeLabel`.
 * Responsabilul notificat este părintele care e cu copilul în acel moment (din calendar).
 */
export interface RecurringActivity {
  id: string;
  title: string;
  weekday: Weekday;
  /** Ora HH:mm. */
  timeLabel: string;
  /** Cu câte minute înainte se trimite reminderul (0 = la oră). */
  reminderLeadMinutes: number;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Excepție pentru o singură ocurență (o săptămână concretă).
 * - `date` + `timeLabel`: activitatea are loc în acea zi/oră (chiar dacă diferă de programul implicit).
 * - `skipped`: anulată în acea zi (nu se trimite reminder).
 * - `replacesDate`: suprimă programul implicit în ziua recurentă obișnuită din aceeași săptămână.
 */
export interface RecurringActivityOverride {
  id: string;
  activityId: string;
  /** Data calendaristică a ocurenței (YYYY-MM-DD). */
  date: string;
  timeLabel: string;
  skipped: boolean;
  replacesDate?: string;
  createdAt: string;
  updatedAt: string;
}

/** Ziua săptămânii (cod) pentru un șir YYYY-MM-DD, deterministic (UTC midday). */
export function weekdayForDateString(date: string): Weekday | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const day = new Date(`${date}T12:00:00Z`).getUTCDay(); // 0=Sun..6=Sat
  const map: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[day] ?? null;
}
