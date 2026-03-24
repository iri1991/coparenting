"use client";

import { useState, useCallback, useEffect } from "react";
import { Sparkles, MapPin, Loader2, Check, X } from "lucide-react";
import { normalizeSuggestionTitleKey } from "@/lib/suggestion-title";

interface ActivityRecommendationsTabProps {
  activityCity?: string;
  onActivityLogged?: () => void;
}

type SuggestionItem = { title: string; why: string; tip?: string };

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
  };
};

function todayBucharest(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Bucharest" });
}

export function ActivityRecommendationsTab({ activityCity, onActivityLogged }: ActivityRecommendationsTabProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiOk | null>(null);
  const [decisions, setDecisions] = useState<Record<string, "accepted" | "rejected">>({});
  const [, setHydratingDecisions] = useState(false);
  const [actionIndex, setActionIndex] = useState<{ type: "accept" | "reject"; index: number } | null>(null);

  const refreshDecisionsForDate = useCallback(async (date: string) => {
    setHydratingDecisions(true);
    try {
      const res = await fetch(`/api/activity-suggestion-decisions?date=${encodeURIComponent(date)}`);
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.decisions && typeof json.decisions === "object") {
        setDecisions(json.decisions as Record<string, "accepted" | "rejected">);
      }
    } finally {
      setHydratingDecisions(false);
    }
  }, []);

  useEffect(() => {
    void refreshDecisionsForDate(todayBucharest());
  }, [refreshDecisionsForDate]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);

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
      setData(json as ApiOk);
      const d = (json as ApiOk).meta?.contextDate;
      if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
        await refreshDecisionsForDate(d);
      }
    } catch {
      setError("Eroare de rețea. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }, [activityCity, refreshDecisionsForDate]);

  const contextDate = data?.meta?.contextDate ?? todayBucharest();

  const handleAccept = useCallback(
    async (s: SuggestionItem, _index: number) => {
      const key = normalizeSuggestionTitleKey(s.title);

      setActionIndex({ type: "accept", index: _index });
      setError(null);
      try {
        const res = await fetch("/api/child-activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activityName: s.title.trim(),
            notes: "Sugestie AI",
            periodEndDate: contextDate,
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
          body: JSON.stringify({ date: contextDate, title: s.title, status: "accepted" }),
        });
        onActivityLogged?.();
        setDecisions((prev) => ({ ...prev, [key]: "accepted" }));
      } finally {
        setActionIndex(null);
      }
    },
    [contextDate, onActivityLogged]
  );

  const handleReject = useCallback(
    async (s: SuggestionItem, _index: number) => {
      const key = normalizeSuggestionTitleKey(s.title);

      setActionIndex({ type: "reject", index: _index });
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

  const busy = (i: number, kind: "accept" | "reject") =>
    actionIndex?.index === i && actionIndex?.type === kind;

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
              Generează idei pentru azi; acceptă pentru a le adăuga la activitățile cu copilul sau refuză (rămâne marcat).
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
          {loading ? "Se generează…" : "Sugestii AI"}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {data?.meta && (data.meta.temperatureC != null || data.meta.weatherLabelRo) && (
        <p className="mt-3 text-xs text-stone-600 dark:text-stone-400">
          {data.meta.cityLabel && (
            <>
              <span className="font-medium">{data.meta.cityLabel}</span>
              {" · "}
            </>
          )}
          {data.meta.temperatureC != null && <>{Math.round(data.meta.temperatureC)}°C</>}
          {data.meta.weatherLabelRo && (
            <>
              {data.meta.temperatureC != null ? ", " : ""}
              {data.meta.weatherLabelRo}
            </>
          )}
        </p>
      )}

      {data && (
        <div className="mt-3 space-y-3 text-sm text-stone-700 dark:text-stone-300">
          <p className="leading-relaxed">{data.intro}</p>
          {data.notRelevantNote && (
            <p className="rounded-xl bg-stone-100/80 dark:bg-stone-800/80 px-3 py-2 text-xs leading-relaxed">
              {data.notRelevantNote}
            </p>
          )}
          <ul className="space-y-3">
            {data.suggestions.map((s, i) => {
              const key = normalizeSuggestionTitleKey(s.title);
              const st = decisions[key];
              return (
                <li
                  key={`${key}-${i}`}
                  className="rounded-xl border border-stone-200/80 dark:border-stone-700 bg-white/60 dark:bg-stone-950/40 px-3 py-2.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-stone-900 dark:text-stone-100">{s.title}</p>
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
                    {!st && (
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => handleAccept(s, i)}
                          disabled={!!actionIndex}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 touch-manipulation"
                        >
                          {busy(i, "accept") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(s, i)}
                          disabled={!!actionIndex}
                          className="inline-flex items-center gap-1 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 touch-manipulation"
                        >
                          {busy(i, "reject") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                          Refuz
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-stone-600 dark:text-stone-400 leading-snug">{s.why}</p>
                  {s.tip && (
                    <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-500 italic">{s.tip}</p>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-stone-500 dark:text-stone-500 italic border-t border-stone-200/80 dark:border-stone-700 pt-3">
            {data.disclaimer}
          </p>
        </div>
      )}
    </section>
  );
}
