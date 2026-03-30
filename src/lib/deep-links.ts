/** Tab-uri din dashboard-ul principal (`/`). */
export type HomeDashboardTab = "program" | "hub" | "idei";

/**
 * Link relativ către aplicația principală cu parametri pentru tab, zi în calendar și fragment.
 * Folosit la payload-uri push (deep link la deschiderea notificării).
 */
export function homeAppUrl(opts?: {
  tab?: HomeDashboardTab;
  /** Zi afișată în calendar (YYYY-MM-DD). */
  date?: string;
  /** Deschide modalul „Zile blocate” (același semantica ca `/?blocked=1`). */
  blocked?: boolean;
  /** Fragment fără `#` (ex: `rituals` → `#rituals`). */
  hash?: string;
}): string {
  const params = new URLSearchParams();
  if (opts?.tab) params.set("tab", opts.tab);
  if (opts?.date) params.set("date", opts.date);
  if (opts?.blocked) params.set("blocked", "1");
  const q = params.toString();
  const base = q ? `/?${q}` : "/";
  const h =
    opts?.hash && opts.hash.length > 0
      ? opts.hash.startsWith("#")
        ? opts.hash
        : `#${opts.hash}`
      : "";
  return `${base}${h}`;
}
