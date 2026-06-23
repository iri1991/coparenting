"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { CalendarHeart, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import {
  resolveSpecialDayHolder,
  nextSpecialDayOccurrence,
  type SpecialDay,
  type ResolvedHolder,
} from "@/types/special-day";
import { AddSpecialDayModal } from "@/components/AddSpecialDayModal";
import { useFamilyLabels } from "@/contexts/FamilyLabelsContext";

interface SpecialDaysCardProps {
  parentType: "tata" | "mama" | null;
}

export function SpecialDaysCard({ parentType }: SpecialDaysCardProps) {
  const labels = useFamilyLabels();
  const [days, setDays] = useState<SpecialDay[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SpecialDay | null>(null);

  const todayStr = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  const fetchDays = useCallback(async () => {
    try {
      const res = await fetch("/api/special-days");
      if (res.ok) {
        const data = await res.json();
        setDays(Array.isArray(data.days) ? data.days : []);
      }
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!parentType) {
      setLoaded(true);
      return;
    }
    fetchDays();
  }, [parentType, fetchDays]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Ștergi această zi specială?")) return;
      const res = await fetch(`/api/special-days?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) await fetchDays();
    },
    [fetchDays]
  );

  // Sortează după următoarea ocurență.
  const sorted = useMemo(() => {
    return [...days]
      .map((d) => ({ d, next: nextSpecialDayOccurrence(d, todayStr) }))
      .sort((a, b) => {
        if (!a.next) return 1;
        if (!b.next) return -1;
        return a.next.date.localeCompare(b.next.date);
      });
  }, [days, todayStr]);

  if (!parentType || !loaded) return null;

  function holderBadge(holder: ResolvedHolder) {
    if (holder === "together") {
      return <span className="text-xs font-medium text-amber-700">👪 amândoi</span>;
    }
    const name = labels.parentLabels[holder];
    return (
      <span className="text-xs font-medium text-stone-700">
        {holder === "tata" ? "👨" : "👩"} {name}
      </span>
    );
  }

  return (
    <section className="app-native-surface rounded-[2rem] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-1">
        <h2 className="text-base font-semibold text-stone-800 flex items-center gap-2">
          <CalendarHeart className="w-4.5 h-4.5 text-[#b86a4b]" aria-hidden />
          Zile speciale
        </h2>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-full bg-[#fff1df] px-3 py-1.5 text-xs font-semibold text-[#9f5a40] hover:bg-[#ffe7cd]"
        >
          <Plus className="w-3.5 h-3.5" />
          Adaugă
        </button>
      </div>
      <p className="text-xs text-stone-500 mb-3">
        Sărbători și date importante, cu alternanță automată pe ani — fără renegociere.
      </p>

      {days.length === 0 ? (
        <p className="text-sm text-stone-500">
          Nicio zi specială încă. Adaugă Crăciun, ziua copilului, prima zi de școală și stabilește cine îl are —
          o singură dată.
        </p>
      ) : (
        <ul className="space-y-2">
          {sorted.map(({ d, next }) => {
            const holderThisYear = next ? resolveSpecialDayHolder(d, next.year) : resolveSpecialDayHolder(d, Number(todayStr.slice(0, 4)));
            const isAlternate = d.assignment === "alternate";
            const nextYearHolder = next && isAlternate ? resolveSpecialDayHolder(d, next.year + 1) : null;
            return (
              <li key={d.id} className="group flex items-start gap-3 rounded-[1.2rem] border border-[#ecdcc9] bg-white/70 px-3 py-2.5">
                <span className="text-xl leading-none mt-0.5">{d.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-stone-800">{d.title}</p>
                    {isAlternate && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#eef4fb] px-2 py-0.5 text-[10px] font-semibold text-[#365d89]">
                        <RefreshCw className="w-2.5 h-2.5" /> alternează
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-stone-400">
                    {next ? (
                      <>
                        {format(new Date(next.date + "T12:00:00"), "d MMM yyyy", { locale: ro })} · {holderBadge(holderThisYear)}
                      </>
                    ) : (
                      "fără dată viitoare"
                    )}
                  </p>
                  {nextYearHolder && next && (
                    <p className="text-[11px] text-stone-400">
                      {next.year + 1}: {holderBadge(nextYearHolder)}
                    </p>
                  )}
                  {d.note && <p className="text-[11px] text-stone-400 italic">{d.note}</p>}
                </div>
                <div className="shrink-0 flex gap-0.5 opacity-80 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(d);
                      setModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-white"
                    aria-label="Editează"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(d.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-white"
                    aria-label="Șterge"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AddSpecialDayModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSaved={fetchDays} editDay={editing} />
    </section>
  );
}
