"use client";

import { useMemo, useState } from "react";

interface EndOfPeriodActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodEndDate: string;
  activityCatalog: string[];
  onSaved: () => void;
}

export function EndOfPeriodActivitiesModal({
  isOpen,
  onClose,
  periodEndDate,
  activityCatalog,
  onSaved,
}: EndOfPeriodActivitiesModalProps) {
  const [activityName, setActivityName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateLabel = useMemo(() => {
    try {
      return new Date(periodEndDate + "T12:00:00").toLocaleDateString("ro-RO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return periodEndDate;
    }
  }, [periodEndDate]);

  async function handleSave() {
    if (!activityName.trim()) {
      setError("Completează activitatea.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/child-activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityName: activityName.trim(),
          notes: notes.trim(),
          periodEndDate,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Eroare la salvare.");
        return;
      }
      setActivityName("");
      setNotes("");
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-1">
          Activități la final de perioadă
        </h3>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
          Ce a făcut copilul în perioada încheiată la {dateLabel}?
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Activitate</label>
            <input
              list="activity-catalog"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="Ex. puzzle, desen, lego, parc"
              className="w-full rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
            />
            <datalist id="activity-catalog">
              {activityCatalog.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Observații</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Text liber: ce i-a plăcut, ce să evitați să repetați etc."
              className="w-full rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-stone-300 dark:border-stone-600 py-2 text-sm"
            >
              Închide
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-xl bg-amber-500 text-white py-2 text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
            >
              {saving ? "Se salvează..." : "Salvează"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

