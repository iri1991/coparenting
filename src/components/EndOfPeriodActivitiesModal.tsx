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
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  const normalizedCatalog = useMemo(
    () =>
      activityCatalog
        .map((x) => x.trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "ro", { sensitivity: "base" })),
    [activityCatalog]
  );

  const filteredSuggestions = useMemo(() => {
    const q = activityName.trim().toLowerCase();
    if (!q) return normalizedCatalog.slice(0, 8);
    const starts = normalizedCatalog.filter((x) => x.toLowerCase().startsWith(q));
    const contains = normalizedCatalog.filter(
      (x) => !x.toLowerCase().startsWith(q) && x.toLowerCase().includes(q)
    );
    return [...starts, ...contains].slice(0, 8);
  }, [activityName, normalizedCatalog]);

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
      setShowSuggestions(false);
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
        className="app-native-surface-strong w-full max-w-md rounded-[2rem] shadow-xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-stone-900 mb-1">
          Activități la final de perioadă
        </h3>
        <p className="text-sm text-stone-500 mb-3">
          Ce a făcut copilul în perioada încheiată la {dateLabel}?
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-stone-500 mb-1">Activitate</label>
            <div className="relative">
              <input
                value={activityName}
                onChange={(e) => {
                  setActivityName(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  // Let click on suggestion run before hiding.
                  setTimeout(() => setShowSuggestions(false), 120);
                }}
                placeholder="Ex. puzzle, desen, lego, parc"
                className="app-native-input w-full px-3 py-2 text-sm"
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full max-h-52 overflow-auto rounded-xl border border-[#e7d5c4] bg-white shadow-lg">
                  {filteredSuggestions.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        onMouseDown={() => {
                          setActivityName(item);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-[#fff5eb]"
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="mt-1 text-xs text-stone-500">
              Selectează din activitățile anterioare sau scrie una nouă; dacă e nouă, se adaugă automat în nomenclator.
            </p>
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Observații</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Text liber: ce i-a plăcut, ce să evitați să repetați etc."
              className="app-native-input w-full px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="app-native-secondary-button flex-1 py-2 text-sm font-medium text-stone-700"
            >
              Închide
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="app-native-primary-button flex-1 py-2 text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Se salvează..." : "Salvează"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

