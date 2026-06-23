"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { BookHeart, Plus, Pencil, Trash2 } from "lucide-react";
import {
  GUIDE_CATEGORY_ORDER,
  GUIDE_CATEGORY_LABELS,
  GUIDE_CATEGORY_EMOJI,
  type GuideCategory,
  type GuideEntry,
} from "@/types/parenting-guide";
import { AddGuideEntryModal } from "@/components/AddGuideEntryModal";

interface ParentingGuideCardProps {
  parentType: "tata" | "mama" | null;
}

export function ParentingGuideCard({ parentType }: ParentingGuideCardProps) {
  const [entries, setEntries] = useState<GuideEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GuideEntry | null>(null);
  const [presetCategory, setPresetCategory] = useState<GuideCategory>("sleep");

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/parenting-guide");
      if (res.ok) {
        const data = await res.json();
        setEntries(Array.isArray(data.entries) ? data.entries : []);
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
    fetchEntries();
  }, [parentType, fetchEntries]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Ștergi această regulă?")) return;
      const res = await fetch(`/api/parenting-guide?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) await fetchEntries();
    },
    [fetchEntries]
  );

  const grouped = useMemo(() => {
    const map = new Map<GuideCategory, GuideEntry[]>();
    for (const e of entries) {
      const arr = map.get(e.category) ?? [];
      arr.push(e);
      map.set(e.category, arr);
    }
    return GUIDE_CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => ({ category: c, items: map.get(c)! }));
  }, [entries]);

  if (!parentType || !loaded) return null;

  function openAdd() {
    setEditing(null);
    setPresetCategory("sleep");
    setModalOpen(true);
  }

  function openEdit(entry: GuideEntry) {
    setEditing(entry);
    setModalOpen(true);
  }

  return (
    <section className="app-native-surface rounded-[2rem] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-1">
        <h2 className="text-base font-semibold text-stone-800 flex items-center gap-2">
          <BookHeart className="w-4.5 h-4.5 text-[#b86a4b]" aria-hidden />
          Ghidul nostru comun
        </h2>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-full bg-[#fff1df] px-3 py-1.5 text-xs font-semibold text-[#9f5a40] hover:bg-[#ffe7cd]"
        >
          <Plus className="w-3.5 h-3.5" />
          Adaugă regulă
        </button>
      </div>
      <p className="text-xs text-stone-500 mb-3">
        Reguli pe care le aplicați la fel în ambele case — predictibilitate pentru copil.
      </p>

      {entries.length === 0 ? (
        <p className="text-sm text-stone-500">
          Nu aveți încă reguli comune. Adăugați primele înțelegeri (somn, ecrane, mâncare, limite) ca să fie la fel
          indiferent de casa în care e copilul.
        </p>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ category, items }) => (
            <div key={category}>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">
                <span className="text-sm">{GUIDE_CATEGORY_EMOJI[category]}</span>
                {GUIDE_CATEGORY_LABELS[category]}
              </p>
              <ul className="space-y-1.5">
                {items.map((e) => (
                  <li
                    key={e.id}
                    className="group flex items-start justify-between gap-2 rounded-[1.2rem] border border-[#ecdcc9] bg-white/70 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-800">{e.title}</p>
                      {e.detail && <p className="mt-0.5 text-xs text-stone-500">{e.detail}</p>}
                    </div>
                    <div className="shrink-0 flex gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => openEdit(e)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-white"
                        aria-label="Editează"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(e.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-white"
                        aria-label="Șterge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <AddGuideEntryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchEntries}
        initialCategory={presetCategory}
        editEntry={editing}
      />
    </section>
  );
}
