"use client";

import { useState, useCallback, useEffect } from "react";
import { Sparkles, MapPin, Loader2, Check, X, Trash2, Info } from "lucide-react";
import { normalizeSuggestionTitleKey } from "@/lib/suggestion-title";
import { ActivityIdeaDetailModal } from "@/components/ActivityIdeaDetailModal";

interface ActivityRecommendationsTabProps {
  activityCity?: string;
  onActivityLogged?: () => void;
}

type SuggestionItem = { title: string; why: string; tip?: string };

type IdeaItem = { id: string; title: string; why: string; tip?: string };

type ApiOk = {
  intro: string;
  suggestions: SuggestionItem[];
  notRelevantNote?: string;
  disclaimer: string;
  meta?: {
    contextDate?: string;
    cityLabel?: string;
    temperatureC?: number | null;
    weatherLabelRo?: string | null;
    scheduleWindowEnd?: string;
    availableViewerDates?: string[];
    togetherDates?: string[];
    viewerOnlyDates?: string[];
    childFirstName?: string;
  };
};

type IdeaBoard = {
  intro: string;
  disclaimer: string;
  notRelevantNote?: string;
  items: IdeaItem[];
  meta?: ApiOk["meta"];
};

function todayBucharest(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Bucharest" });
}

/** +n zile la YYYY-MM-DD (local, pentru interval decizii). */
function addCalendarDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const t = new Date(y, m - 1, d + days);
  const y2 = t.getFullYear();
  const m2 = String(t.getMonth() + 1).padStart(2, "0");
  const d2 = String(t.getDate()).padStart(2, "0");
  return `${y2}-${m2}-${d2}`;
}

function formatRoDate(ymd: string): string {
  try {
    return new Date(ymd + "T12:00:00").toLocaleDateString("ro-RO", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return ymd;
  }
}

function storageKey(userId: string): string {
  return `homesplit:activity-ideas:v2:${userId}`;
}

function migrateItems(raw: unknown): IdeaItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => {
    const o = x as Record<string, unknown>;
    const title = typeof o.title === "string" ? o.title : "";
    const why = typeof o.why === "string" ? o.why : "";
    const tip = typeof o.tip === "string" ? o.tip : undefined;
    const id = typeof o.id === "string" && o.id ? o.id : crypto.randomUUID();
    return { id, title, why, tip };
  });
}

export function ActivityRecommendationsTab({ activityCity, onActivityLogged }: ActivityRecommendationsTabProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [board, setBoard] = useState<IdeaBoard | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Record<string, "accepted" | "rejected">>({});
  const [, setHydratingDecisions] = useState(false);
  const [actionIndex, setActionIndex] = useState<{ type: "accept" | "reject"; index: number } | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTitle, setDetailTitle] = useState("");
  /** Zi aleasă pentru salvare la Accept (per idee). */
  const [acceptDayByItemId, setAcceptDayByItemId] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user/me");
        const j = await res.json().catch(() => ({}));
        if (cancelled) return;
        const id = typeof j.id === "string" ? j.id : null;
        setUserId(id);
        if (id) {
          try {
            const raw = localStorage.getItem(storageKey(id));
            if (raw) {
              const parsed = JSON.parse(raw) as Partial<IdeaBoard>;
              if (parsed && typeof parsed.intro === "string" && typeof parsed.disclaimer === "string") {
                setBoard((prev) => {
                  if (prev) return prev;
                  return {
                    intro: parsed.intro!,
                    disclaimer: parsed.disclaimer!,
                    notRelevantNote: parsed.notRelevantNote,
                    meta: parsed.meta,
                    items: migrateItems(parsed.items),
                  };
                });
              }
            }
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!userId || !board) return;
    try {
      localStorage.setItem(storageKey(userId), JSON.stringify(board));
    } catch {
      /* ignore */
    }
  }, [userId, board]);

  const refreshDecisionsForRange = useCallback(async (rangeStart: string, rangeEnd: string) => {
    setHydratingDecisions(true);
    try {
      const res = await fetch(
        `/api/activity-suggestion-decisions?rangeStart=${encodeURIComponent(rangeStart)}&rangeEnd=${encodeURIComponent(rangeEnd)}`
      );
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.decisions && typeof json.decisions === "object") {
        setDecisions(json.decisions as Record<string, "accepted" | "rejected">);
      }
    } finally {
      setHydratingDecisions(false);
    }
  }, []);

  const rangeEndFallback = useCallback(() => addCalendarDays(todayBucharest(), 60), []);

  useEffect(() => {
    const start = todayBucharest();
    void refreshDecisionsForRange(start, rangeEndFallback());
  }, [refreshDecisionsForRange, rangeEndFallback]);

  useEffect(() => {
    const dates = board?.meta?.availableViewerDates;
    if (!dates?.length) return;
    const first = dates[0];
    setAcceptDayByItemId((prev) => {
      const next = { ...prev };
      for (const item of board?.items ?? []) {
        if (!next[item.id]) next[item.id] = first;
      }
      return next;
    });
  }, [board?.items, board?.meta?.availableViewerDates, board?.meta?.contextDate]);

  const contextDate = board?.meta?.contextDate ?? todayBucharest();
  const cityLabelForDetail = board?.meta?.cityLabel?.trim() || activityCity?.trim() || "";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    let lat: number | undefined;
    let lng: number | undefined;
    try {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 12_000,
            maximumAge: 300_000,
          });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }
    } catch {
      // fallback city
    }

    try {
      const res = await fetch("/api/activity-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat,
          lng,
          city: activityCity?.trim() || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Nu am putut încărca sugestiile.");
        return;
      }
      const payload = json as ApiOk;
      const incoming: IdeaItem[] = payload.suggestions.map((s) => ({
        id: crypto.randomUUID(),
        title: s.title,
        why: s.why,
        tip: s.tip,
      }));

      setBoard((prev) => {
        const existingKeys = new Set((prev?.items ?? []).map((i) => normalizeSuggestionTitleKey(i.title)));
        const merged = [...(prev?.items ?? [])];
        for (const it of incoming) {
          const k = normalizeSuggestionTitleKey(it.title);
          if (!existingKeys.has(k)) {
            merged.push(it);
            existingKeys.add(k);
          }
        }
        return {
          intro: payload.intro,
          notRelevantNote: payload.notRelevantNote,
          disclaimer: payload.disclaimer,
          meta: payload.meta,
          items: merged,
        };
      });

      const meta = payload.meta;
      const start = meta?.contextDate ?? todayBucharest();
      const end = meta?.scheduleWindowEnd ?? addCalendarDays(start, 60);
      if (/^\d{4}-\d{2}-\d{2}$/.test(start) && /^\d{4}-\d{2}-\d{2}$/.test(end)) {
        await refreshDecisionsForRange(start, end);
      }
    } catch {
      setError("Eroare de rețea. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }, [activityCity, refreshDecisionsForRange]);

  const handleAccept = useCallback(
    async (s: IdeaItem, index: number) => {
      const key = normalizeSuggestionTitleKey(s.title);
      const chosenDay = acceptDayByItemId[s.id] ?? contextDate;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(chosenDay)) {
        setError("Alege o zi validă.");
        return;
      }

      setActionIndex({ type: "accept", index });
      setError(null);
      try {
        const res = await fetch("/api/child-activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activityName: s.title.trim(),
            notes: `Sugestie AI · planificată pentru ${chosenDay}`,
            periodEndDate: chosenDay,
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(typeof json.error === "string" ? json.error : "Nu s-a putut salva activitatea.");
          return;
        }
        await fetch("/api/activity-suggestion-decisions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: chosenDay, title: s.title, status: "accepted" }),
        });
        onActivityLogged?.();
        setDecisions((prev) => ({ ...prev, [key]: "accepted" }));
      } finally {
        setActionIndex(null);
      }
    },
    [acceptDayByItemId, contextDate, onActivityLogged]
  );

  const handleReject = useCallback(
    async (s: IdeaItem, index: number) => {
      const key = normalizeSuggestionTitleKey(s.title);

      setActionIndex({ type: "reject", index });
      setError(null);
      try {
        const res = await fetch("/api/activity-suggestion-decisions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: contextDate, title: s.title, status: "rejected" }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(typeof json.error === "string" ? json.error : "Nu s-a putut salva refuzul.");
          return;
        }
        setDecisions((prev) => ({ ...prev, [key]: "rejected" }));
      } finally {
        setActionIndex(null);
      }
    },
    [contextDate]
  );

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function selectAll() {
    if (!board?.items.length) return;
    setSelectedIds(board.items.map((i) => i.id));
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  function deleteByIds(ids: string[]) {
    if (ids.length === 0) return;
    setBoard((b) => {
      if (!b) return b;
      return { ...b, items: b.items.filter((i) => !ids.includes(i.id)) };
    });
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
  }

  function openDetail(title: string) {
    setDetailTitle(title);
    setDetailOpen(true);
  }

  const busy = (i: number, kind: "accept" | "reject") =>
    actionIndex?.index === i && actionIndex?.type === kind;

  const hasBoard = board && board.items.length > 0;
  const availableViewerDates = board?.meta?.availableViewerDates ?? [];

  return (
    <section className="rounded-2xl border border-violet-200/80 dark:border-violet-800/80 bg-gradient-to-br from-violet-50/90 to-white dark:from-violet-950/40 dark:to-stone-900 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <span className="mt-0.5 rounded-xl bg-violet-500/15 p-2 text-violet-700 dark:text-violet-300">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">Recomandări</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Sugestii pentru zilele tale cu copilul din calendar (și idei „împreună” când există astfel de zile). La
              Accept alegi ziua. Fără referințe la celălalt părinte. Detalii la click; ștergere manuală sau în masă.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60 touch-manipulation"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          {loading ? "Se generează…" : "Adaugă sugestii AI"}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {hasBoard && board!.meta && (board!.meta.temperatureC != null || board!.meta.weatherLabelRo) && (
        <p className="mt-3 text-xs text-stone-600 dark:text-stone-400">
          {board!.meta.cityLabel && (
            <>
              <span className="font-medium">{board!.meta.cityLabel}</span>
              {" · "}
            </>
          )}
          {board!.meta.temperatureC != null && <>{Math.round(board!.meta.temperatureC)}°C</>}
          {board!.meta.weatherLabelRo && (
            <>
              {board!.meta.temperatureC != null ? ", " : ""}
              {board!.meta.weatherLabelRo}
            </>
          )}
        </p>
      )}

      {hasBoard && selectedIds.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-stone-100/90 dark:bg-stone-800/80 px-3 py-2 text-sm">
          <span className="text-stone-600 dark:text-stone-300">{selectedIds.length} selectate</span>
          <button
            type="button"
            onClick={() => deleteByIds(selectedIds)}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            Șterge selectate
          </button>
          <button type="button" onClick={clearSelection} className="text-xs text-stone-500 hover:underline">
            Renunță la selecție
          </button>
        </div>
      )}

      {hasBoard && (
        <div className="mt-3 space-y-3 text-sm text-stone-700 dark:text-stone-300">
          <p className="leading-relaxed">{board!.intro}</p>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 cursor-pointer">
              <input
                type="checkbox"
                checked={board!.items.length > 0 && selectedIds.length === board!.items.length}
                onChange={(e) => (e.target.checked ? selectAll() : clearSelection())}
                className="rounded border-stone-300"
              />
              Selectează toate ideile
            </label>
            {board!.items.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Ștergi toate ideile din listă?")) {
                    setBoard((b) => (b ? { ...b, items: [] } : b));
                    clearSelection();
                  }
                }}
                className="text-xs text-red-600 dark:text-red-400 hover:underline"
              >
                Golește lista
              </button>
            )}
          </div>

          <ul className="space-y-3">
            {board!.items.map((s, i) => {
              const key = normalizeSuggestionTitleKey(s.title);
              const st = decisions[key];
              const checked = selectedIds.includes(s.id);
              const canSaveToCalendar = availableViewerDates.length > 0;
              return (
                <li
                  key={s.id}
                  className="rounded-xl border border-stone-200/80 dark:border-stone-700 bg-white/60 dark:bg-stone-950/40 px-3 py-2.5 cursor-pointer hover:border-violet-300/80 dark:hover:border-violet-700/80 transition-colors"
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    const t = e.target as HTMLElement;
                    if (t.closest("button, input[type='checkbox'], a")) return;
                    openDetail(s.title);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openDetail(s.title);
                    }
                  }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex gap-2 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelect(s.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 rounded border-stone-300 shrink-0"
                        aria-label={`Selectează ${s.title}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2 flex-wrap">
                          <p className="font-medium text-stone-900 dark:text-stone-100">{s.title}</p>
                          <span className="inline-flex items-center gap-0.5 text-[11px] text-violet-600 dark:text-violet-400 shrink-0">
                            <Info className="h-3.5 w-3.5" aria-hidden />
                            detalii
                          </span>
                        </div>
                        {st === "accepted" && (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-200">
                            <Check className="h-3.5 w-3.5" /> Adăugată la activități
                          </span>
                        )}
                        {st === "rejected" && (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-lg bg-stone-200/90 dark:bg-stone-700 px-2 py-0.5 text-xs font-medium text-stone-600 dark:text-stone-300">
                            <X className="h-3.5 w-3.5" /> Refuzată
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1 flex-wrap justify-end">
                      {!st && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAccept(s, i);
                            }}
                            disabled={!!actionIndex || !canSaveToCalendar}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 touch-manipulation"
                          >
                            {busy(i, "accept") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(s, i);
                            }}
                            disabled={!!actionIndex}
                            className="inline-flex items-center gap-1 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 touch-manipulation"
                          >
                            {busy(i, "reject") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                            Refuz
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteByIds([s.id]);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-900/50 bg-white dark:bg-stone-900 px-2 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                        title="Șterge ideea"
                        aria-label="Șterge ideea"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-stone-600 dark:text-stone-400 leading-snug pl-7">{s.why}</p>
                  {s.tip && (
                    <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-500 italic pl-7">{s.tip}</p>
                  )}
                  {!st && (
                    <div className="mt-2 pl-7 space-y-1" onClick={(e) => e.stopPropagation()}>
                      {canSaveToCalendar ? (
                        <label className="flex flex-wrap items-center gap-2 text-[11px] text-stone-600 dark:text-stone-400">
                          <span className="shrink-0">Salvează pentru ziua:</span>
                          <select
                            value={acceptDayByItemId[s.id] ?? availableViewerDates[0]}
                            onChange={(e) =>
                              setAcceptDayByItemId((prev) => ({ ...prev, [s.id]: e.target.value }))
                            }
                            className="rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 px-2 py-1 text-xs text-stone-800 dark:text-stone-200 max-w-[min(100%,14rem)]"
                          >
                            {availableViewerDates.map((d) => (
                              <option key={d} value={d}>
                                {formatRoDate(d)} ({d})
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : (
                        <p className="text-[11px] text-amber-700 dark:text-amber-300">
                          Adaugă în calendar zilele în care ești cu copilul (sau zile „împreună”) ca să poți salva
                          ideea.
                        </p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-stone-500 dark:text-stone-500 italic border-t border-stone-200/80 dark:border-stone-700 pt-3">
            {board!.disclaimer}
          </p>
        </div>
      )}

      {!hasBoard && hydrated && (
        <p className="mt-4 text-sm text-stone-500 dark:text-stone-400 text-center py-6">
          Apasă „Adaugă sugestii AI” pentru a genera idei. Ele vor rămâne salvate pe acest dispozitiv pentru contul tău.
        </p>
      )}

      <ActivityIdeaDetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detailTitle}
        cityLabel={cityLabelForDetail}
      />
    </section>
  );
}
