"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, Search, ExternalLink } from "lucide-react";

export interface ActivityIdeaDetailPayload {
  where: string;
  when: string;
  materials: string[];
  process: string;
  verifyNote: string;
  googleMapsSearchUrl: string;
  googleWebSearchUrl: string;
  placeFromGoogle: {
    name?: string;
    formattedAddress?: string;
    rating?: number;
    userRatingsTotal?: number;
    openNow?: boolean;
  } | null;
  sourcesNote: string;
}

interface ActivityIdeaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  cityLabel: string;
}

export function ActivityIdeaDetailModal({ isOpen, onClose, title, cityLabel }: ActivityIdeaDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ActivityIdeaDetailPayload | null>(null);

  useEffect(() => {
    if (!isOpen || !title.trim()) {
      setData(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    (async () => {
      try {
        const res = await fetch("/api/activity-ideas/detail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            cityLabel: cityLabel.trim() || undefined,
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(typeof json.error === "string" ? json.error : "Nu s-au putut încărca detaliile.");
          return;
        }
        setData(json as ActivityIdeaDetailPayload);
      } catch {
        if (!cancelled) setError("Eroare de rețea.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, title, cityLabel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-stone-900 rounded-t-2xl sm:rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="idea-detail-title"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-700 bg-white/95 dark:bg-stone-900/95 backdrop-blur px-4 py-3">
          <h2 id="idea-detail-title" className="text-base font-semibold text-stone-900 dark:text-stone-100 pr-2">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="Închide"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        <div className="p-4 space-y-4 text-sm text-stone-700 dark:text-stone-300">
          {loading && (
            <div className="flex items-center gap-2 text-stone-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Se încarcă detaliile (AI + Google)…
            </div>
          )}
          {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

          {data?.placeFromGoogle?.formattedAddress && (
            <div className="rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800 px-3 py-2 text-xs">
              <p className="font-medium text-emerald-900 dark:text-emerald-200">Google Places</p>
              {data.placeFromGoogle.name && <p className="mt-0.5">{data.placeFromGoogle.name}</p>}
              <p className="text-emerald-800 dark:text-emerald-300">{data.placeFromGoogle.formattedAddress}</p>
              {data.placeFromGoogle.rating != null && (
                <p className="text-emerald-700 dark:text-emerald-400 mt-1">
                  Rating: {data.placeFromGoogle.rating.toFixed(1)}
                  {data.placeFromGoogle.userRatingsTotal != null
                    ? ` (${data.placeFromGoogle.userRatingsTotal} recenzii)`
                    : ""}
                  {data.placeFromGoogle.openNow != null && (
                    <span> · {data.placeFromGoogle.openNow ? "Deschis acum (indicativ)" : "Închis acum (indicativ)"}</span>
                  )}
                </p>
              )}
            </div>
          )}

          {data && (
            <>
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400 mb-1">
                  Unde
                </h3>
                <p className="leading-relaxed whitespace-pre-wrap">{data.where}</p>
              </section>
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400 mb-1">
                  Când
                </h3>
                <p className="leading-relaxed whitespace-pre-wrap">{data.when}</p>
              </section>
              {data.materials.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400 mb-1">
                    Materiale / ce ai la tine
                  </h3>
                  <ul className="list-disc list-inside space-y-0.5">
                    {data.materials.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </section>
              )}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400 mb-1">
                  Pași (proces)
                </h3>
                <p className="leading-relaxed whitespace-pre-wrap">{data.process}</p>
              </section>
              <p className="text-xs text-stone-500 dark:text-stone-400 italic border-t border-stone-200 dark:border-stone-700 pt-3">
                {data.verifyNote}
              </p>
              <p className="text-[11px] text-stone-400">{data.sourcesNote}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={data.googleMapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 dark:border-stone-600 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Google Maps
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
                <a
                  href={data.googleWebSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 dark:border-stone-600 px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  <Search className="h-3.5 w-3.5" />
                  Căutare Google
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
