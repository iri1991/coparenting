/** Data calendaristică „azi” în Europe/Bucharest (YYYY-MM-DD), aliniată la programul din UI. */
export function getTodayDateStringEuropeBucharest(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Bucharest" });
}
