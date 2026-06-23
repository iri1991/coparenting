"use client";

import { useState, useEffect, useCallback } from "react";
import { Gauge } from "lucide-react";
import {
  scoreLabel,
  SCORE_COMPONENT_LABELS,
  type CoparentingScore,
} from "@/types/coparenting-score";

interface CoparentingScoreCardProps {
  parentType: "tata" | "mama" | null;
}

/** Culoare în funcție de scor (roșu-cald → chihlimbar → verde). */
function toneFor(score: number): { bar: string; text: string } {
  if (score >= 85) return { bar: "#1d9e75", text: "text-[#0f6e56]" };
  if (score >= 65) return { bar: "#63991a", text: "text-[#3b6d11]" };
  if (score >= 40) return { bar: "#ba7517", text: "text-[#854f0b]" };
  return { bar: "#d85a30", text: "text-[#993c1d]" };
}

export function CoparentingScoreCard({ parentType }: CoparentingScoreCardProps) {
  const [data, setData] = useState<CoparentingScore | null>(null);
  const [loaded, setLoaded] = useState(false);

  const fetchScore = useCallback(async () => {
    try {
      const res = await fetch("/api/coparenting-score", { cache: "no-store" });
      if (res.ok) setData(await res.json());
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!parentType) {
      setLoaded(true);
      return;
    }
    fetchScore();
  }, [parentType, fetchScore]);

  if (!parentType || !loaded || !data) return null;
  // Nimic relevant încă (familie nouă) → nu aglomera.
  if (!data.hasData) return null;

  const overallTone = toneFor(data.overall);

  return (
    <section className="app-native-surface rounded-[2rem] p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-base font-semibold text-stone-800 flex items-center gap-2">
          <Gauge className="w-4.5 h-4.5 text-[#b86a4b]" aria-hidden />
          Sănătatea co-parentingului
        </h2>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="shrink-0 flex flex-col items-center justify-center rounded-2xl bg-white/72 border border-[#ecdcc9] w-20 h-20">
          <span className={`text-2xl font-bold tabular-nums ${overallTone.text}`}>{data.overall}</span>
          <span className="text-[10px] text-stone-400">/ 100</span>
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${overallTone.text}`}>Scor general · {scoreLabel(data.overall)}</p>
          <p className="text-xs text-stone-500 mt-0.5">
            Derivat din program, comunicare, decizii și cheltuieli. Date obiective, nu impresii.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {data.components.map((c) => {
          const tone = toneFor(c.score);
          return (
            <div key={c.key}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-medium text-stone-600">{SCORE_COMPONENT_LABELS[c.key]}</span>
                <span className="text-xs text-stone-400">{c.detail}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                <div className="h-full rounded-full" style={{ width: `${c.score}%`, backgroundColor: tone.bar }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
