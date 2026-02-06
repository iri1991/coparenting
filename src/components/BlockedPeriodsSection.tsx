"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Lock, Plus, Trash2 } from "lucide-react";
import type { BlockedPeriod } from "@/types/blocked";

interface BlockedPeriodsSectionProps {
  onAddClick: () => void;
}

export function BlockedPeriodsSection({ onAddClick }: BlockedPeriodsSectionProps) {
  const [list, setList] = useState<BlockedPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMine = useCallback(async () => {
    const res = await fetch("/api/blocked-days?mine=1");
    if (res.ok) {
      const data = await res.json();
      setList(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMine();
  }, [fetchMine]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Ștergi această perioadă blocată?")) return;
      const res = await fetch(`/api/blocked-days?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) await fetchMine();
    },
    [fetchMine]
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2">
          <Lock className="w-4 h-4 text-stone-500" aria-hidden />
          Zilele mele blocate
        </h2>
        <button
          type="button"
          onClick={onAddClick}
          className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-[0.98] touch-manipulation"
        >
          <Plus className="w-4 h-4" />
          Adaugă perioadă
        </button>
      </div>
      <div className="p-3">
        {loading ? (
          <p className="text-sm text-stone-400">Se încarcă…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Nu ai perioade blocate. Adaugă când ești plecat ca să nu se programeze zile cu Eva în acele zile.
          </p>
        ) : (
          <ul className="space-y-2">
            {list.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-2 py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700"
              >
                <div>
                  <span className="text-sm font-medium text-stone-800 dark:text-stone-200">
                    {format(new Date(b.startDate + "T12:00:00"), "d MMM", { locale: ro })}
                    {" – "}
                    {format(new Date(b.endDate + "T12:00:00"), "d MMM yyyy", { locale: ro })}
                  </span>
                  {b.note?.trim() && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{b.note}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(b.id)}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-stone-400 hover:text-red-600 dark:hover:text-red-400 touch-manipulation"
                  aria-label="Șterge perioada"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
