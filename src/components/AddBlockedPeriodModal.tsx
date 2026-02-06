"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X } from "lucide-react";

interface AddBlockedPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialStart?: Date | null;
  initialEnd?: Date | null;
}

export function AddBlockedPeriodModal({
  isOpen,
  onClose,
  onSaved,
  initialStart,
  initialEnd,
}: AddBlockedPeriodModalProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStartDate(initialStart ? format(initialStart, "yyyy-MM-dd") : today);
      setEndDate(initialEnd ? format(initialEnd, "yyyy-MM-dd") : today);
      setNote("");
      setError(null);
    }
  }, [isOpen, initialStart, initialEnd, today]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (startDate > endDate) {
      setError("Data de început trebuie să fie înainte de data de sfârșit.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/blocked-days", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          note: note.trim() || undefined,
        }),
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
            Adaugă perioadă blocată
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
            aria-label="Închide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            În perioada blocată nu se poate programa niciun eveniment cu Eva (nici cu tine, nici cu celălalt părinte).
          </p>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              De la
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Până la
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Notă (opțional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ex. Plecat în concediu"
              className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder:text-stone-400"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-300 font-medium"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
            >
              {saving ? "Se salvează…" : "Salvează"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
