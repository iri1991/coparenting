import type { ReactNode } from "react";
import { format, formatDistanceToNowStrict } from "date-fns";
import { ro } from "date-fns/locale";
import type { PlanType } from "@/types/plan";
import { PLAN_NAMES } from "@/types/plan";

export function fmtDate(value: string | null | undefined, pattern = "d MMM yyyy"): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : format(d, pattern, { locale: ro });
}

export function fmtRelative(value: string | null | undefined): string {
  if (!value) return "niciodată";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return `acum ${formatDistanceToNowStrict(d, { locale: ro })}`;
}

export function pct(part: number, total: number): string {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

export function Card({ title, subtitle, actions, children, className = "" }: { title?: ReactNode; subtitle?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900 ${className}`}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-stone-100 px-4 py-3 dark:border-stone-800">
          <div className="min-w-0">
            {title && <h2 className="font-semibold text-stone-800 dark:text-stone-100">{title}</h2>}
            {subtitle && <p className="text-xs text-stone-500 dark:text-stone-400">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function StatCard({ label, value, hint, tone = "default" }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "default" | "good" | "warn" }) {
  const toneClass =
    tone === "good" ? "text-emerald-600 dark:text-emerald-400" : tone === "warn" ? "text-amber-600 dark:text-amber-400" : "text-stone-900 dark:text-stone-100";
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <p className="text-[11px] font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${toneClass}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
  );
}

const BADGE_TONES = {
  neutral: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  good: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  warn: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  bad: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  info: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
} as const;

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: keyof typeof BADGE_TONES }) {
  return <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium ${BADGE_TONES[tone]}`}>{children}</span>;
}

export function PlanBadge({ plan }: { plan: PlanType }) {
  return <Badge tone={plan === "free" ? "neutral" : plan === "pro" ? "warn" : "good"}>{PLAN_NAMES[plan]}</Badge>;
}

export function SubscriptionBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-stone-400">—</span>;
  const tone = status === "active" || status === "trialing" ? "good" : ["past_due", "unpaid", "incomplete"].includes(status) ? "bad" : "neutral";
  return <Badge tone={tone}>{status}</Badge>;
}

export function daysSince(value: string): number {
  return (Date.now() - new Date(value).getTime()) / 86_400_000;
}

/** Badge pentru ultima activitate: verde < 7 zile, galben < 30, gri altfel. */
export function ActivityBadge({ lastActiveAt }: { lastActiveAt: string | null }) {
  if (!lastActiveAt) return <Badge>niciodată</Badge>;
  const days = daysSince(lastActiveAt);
  const tone = days < 7 ? "good" : days < 30 ? "warn" : "neutral";
  return <Badge tone={tone}>{fmtRelative(lastActiveAt)}</Badge>;
}

export const inputClass =
  "rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100";
export const buttonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800";
export const primaryButtonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-700 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300";
export const dangerButtonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:bg-stone-900 dark:text-red-300 dark:hover:bg-red-950";

export function SortHeader<K extends string>({
  col,
  sortKey,
  sortDir,
  onSort,
  children,
}: {
  col: K;
  sortKey: K;
  sortDir: "asc" | "desc";
  onSort: (col: K) => void;
  children: ReactNode;
}) {
  const active = sortKey === col;
  return (
    <th className="cursor-pointer select-none px-3 py-2.5 text-left font-medium hover:text-stone-900 dark:hover:text-stone-100" onClick={() => onSort(col)}>
      {children}
      <span className={active ? "ml-1 text-amber-500" : "ml-1 text-stone-300"}>{active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}</span>
    </th>
  );
}
