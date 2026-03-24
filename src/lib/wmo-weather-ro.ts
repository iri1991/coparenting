/** Coduri WMO (Open-Meteo) → descriere scurtă în română. */
export function wmoWeatherLabelRo(code: number): string {
  if (code === 0) return "senin";
  if (code === 1) return "predominant senin";
  if (code === 2) return "parțial înnorat";
  if (code === 3) return "înnorat";
  if (code === 45 || code === 48) return "ceață";
  if (code >= 51 && code <= 57) return "burniță / ploaie ușoară";
  if (code >= 61 && code <= 67) return "ploae";
  if (code >= 71 && code <= 77) return "ninsoare";
  if (code >= 80 && code <= 82) return "averse";
  if (code >= 85 && code <= 86) return "ninsoare puternică";
  if (code >= 95 && code <= 99) return "furtună / descărcări electrice";
  return "condiții mixte";
}
