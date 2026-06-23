"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { X, Plus, Trash2, ArrowRightLeft } from "lucide-react";
import { ModalPortal } from "@/components/ModalPortal";
import { CHILD_MOOD_EMOJI, CHILD_MOOD_ORDER, type ChildMood, type TransitionItem, type TransitionNote } from "@/types/transition-note";
import { useFamilyLabels } from "@/contexts/FamilyLabelsContext";

const MOOD_LABELS: Record<ChildMood, string> = {
  happy: "Vesel",
  calm: "Calm",
  tired: "Obosit",
  upset: "Supărat",
  sick: "Răcit / bolnav",
};

interface TransitionNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Data predării (YYYY-MM-DD). */
  date: string;
  /** Numele părintelui care preia (pentru context). */
  toParentLabel?: string;
  /** Notă existentă pentru editare. */
  editNote?: TransitionNote | null;
}

export function TransitionNoteModal({
  isOpen,
  onClose,
  onSaved,
  date,
  toParentLabel,
  editNote,
}: TransitionNoteModalProps) {
  const labels = useFamilyLabels();
  const [mood, setMood] = useState<ChildMood | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [sleep, setSleep] = useState("");
  const [food, setFood] = useState("");
  const [activities, setActivities] = useState("");
  const [medication, setMedication] = useState("");
  const [generalNote, setGeneralNote] = useState("");
  const [items, setItems] = useState<TransitionItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setMood(editNote?.mood ?? null);
    setMoodNote(editNote?.moodNote ?? "");
    setSleep(editNote?.sleep ?? "");
    setFood(editNote?.food ?? "");
    setActivities(editNote?.activities ?? "");
    setMedication(editNote?.medication ?? "");
    setGeneralNote(editNote?.generalNote ?? "");
    setItems(editNote?.items ?? []);
    setNewItem("");
    setError(null);
  }, [isOpen, editNote]);

  if (!isOpen) return null;

  const recipient = toParentLabel || labels.parentLabels.mama;
  const dateLabel = format(new Date(date + "T12:00:00"), "EEEE, d MMM", { locale: ro });

  function addItem() {
    const label = newItem.trim();
    if (!label) return;
    setItems((prev) => [...prev, { label, traveling: true }]);
    setNewItem("");
  }

  function toggleItem(idx: number) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, traveling: !it.traveling } : it)));
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        date,
        mood: mood ?? undefined,
        moodNote: moodNote.trim() || undefined,
        sleep: sleep.trim() || undefined,
        food: food.trim() || undefined,
        activities: activities.trim() || undefined,
        medication: medication.trim() || undefined,
        generalNote: generalNote.trim() || undefined,
        items,
      };
      const res = editNote
        ? await fetch("/api/transition-notes", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editNote.id, ...payload }),
          })
        : await fetch("/api/transition-notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Eroare la salvare.");
        return;
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full px-3 py-2 rounded-xl border border-[#e7d6c4] bg-white text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#d9b89d]/60";
  const labelCls = "block text-xs font-semibold text-stone-600 mb-1.5";

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="app-native-surface-strong w-full max-w-md max-h-[88vh] rounded-[2rem] shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#ead9c8]">
          <h2 className="text-base font-semibold text-stone-800 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-[#b86a4b]" aria-hidden />
            Notă de predare
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/70 text-stone-500" aria-label="Închide">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          <p className="text-sm text-stone-500">
            Predare <span className="font-medium text-stone-700 capitalize">{dateLabel}</span> către{" "}
            <span className="font-medium text-stone-700">{recipient}</span>. Tot ce trece copilul mai ușor.
          </p>

          {/* Mood */}
          <div>
            <label className={labelCls}>Starea copilului</label>
            <div className="flex flex-wrap gap-2">
              {CHILD_MOOD_ORDER.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(mood === m ? null : m)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
                    mood === m
                      ? "border-[#bf6a4b] bg-[#fff1df] text-[#9f5a40] font-medium"
                      : "border-[#e7d6c4] bg-white text-stone-600 hover:bg-[#fff8f1]"
                  }`}
                >
                  <span className="text-base leading-none">{CHILD_MOOD_EMOJI[m]}</span>
                  {MOOD_LABELS[m]}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="ex. puțin agitat după somn"
              className={`${inputCls} mt-2`}
            />
          </div>

          {/* Sleep */}
          <div>
            <label className={labelCls}>Somn</label>
            <input type="text" value={sleep} onChange={(e) => setSleep(e.target.value)} placeholder="ex. a dormit prost, vise urâte" className={inputCls} />
          </div>

          {/* Food */}
          <div>
            <label className={labelCls}>Mâncare</label>
            <input type="text" value={food} onChange={(e) => setFood(e.target.value)} placeholder="ex. a mâncat bine la prânz, fără cină" className={inputCls} />
          </div>

          {/* Activities / homework */}
          <div>
            <label className={labelCls}>Teme / activități de continuat</label>
            <input type="text" value={activities} onChange={(e) => setActivities(e.target.value)} placeholder="ex. rest de citit 2 pagini pentru luni" className={inputCls} />
          </div>

          {/* Medication */}
          <div>
            <label className={labelCls}>Medicație</label>
            <input type="text" value={medication} onChange={(e) => setMedication(e.target.value)} placeholder="ex. dat sirop dimineața, următoarea doză la 20:00" className={inputCls} />
          </div>

          {/* Items checklist */}
          <div>
            <label className={labelCls}>Obiecte la predare</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem();
                  }
                }}
                placeholder="ex. Ursulețul, caietul de teme…"
                className={inputCls}
              />
              <button
                type="button"
                onClick={addItem}
                className="shrink-0 flex items-center justify-center w-10 rounded-xl bg-[#fff1df] text-[#9f5a40] hover:bg-[#ffe7cd]"
                aria-label="Adaugă obiect"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {items.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {items.map((it, idx) => (
                  <li key={idx} className="flex items-center gap-2 rounded-xl bg-white/70 border border-[#ecdcc9] px-3 py-2">
                    <button
                      type="button"
                      onClick={() => toggleItem(idx)}
                      className={`text-xs font-medium rounded-full px-2 py-1 transition ${
                        it.traveling
                          ? "bg-[#e1f5ee] text-[#0f6e56]"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {it.traveling ? "pleacă cu el" : "rămâne aici"}
                    </button>
                    <span className="flex-1 text-sm text-stone-700 truncate">{it.label}</span>
                    <button type="button" onClick={() => removeItem(idx)} className="p-1 text-stone-400 hover:text-red-500" aria-label="Șterge">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* General note */}
          <div>
            <label className={labelCls}>Altă observație (opțional)</label>
            <textarea
              value={generalNote}
              onChange={(e) => setGeneralNote(e.target.value)}
              rows={2}
              placeholder="orice ar fi util pentru celălalt părinte"
              className={`${inputCls} resize-none`}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>

        <div className="flex gap-2 px-4 py-3 border-t border-[#ead9c8]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#e7d6c4] text-stone-700 font-medium hover:bg-white/60"
          >
            Anulează
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-white font-medium disabled:opacity-50"
          >
            {saving ? "Se salvează…" : editNote ? "Salvează" : "Trimite nota"}
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
