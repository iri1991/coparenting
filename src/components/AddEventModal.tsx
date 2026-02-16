"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { ScheduleEvent, ParentType, LocationType } from "@/types/events";
import { ParentIcon } from "@/components/ParentIcon";
import { useFamilyLabels, getEventDisplayLabelWithLabels } from "@/contexts/FamilyLabelsContext";

type EventPayload = Omit<ScheduleEvent, "id" | "created_at">;

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: EventPayload & { endDate?: string }, existingId?: string) => void;
  initialDate?: Date | null;
  editEvent?: ScheduleEvent | null;
  currentUserId?: string;
}

export function AddEventModal({
  isOpen,
  onClose,
  onSave,
  initialDate,
  editEvent,
  currentUserId,
}: AddEventModalProps) {
  const labels = useFamilyLabels();
  const [date, setDate] = useState(
    initialDate ? format(initialDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState("");
  const [parent, setParent] = useState<ParentType>("tata");
  const [location, setLocation] = useState<LocationType>("tunari");
  const [locationLabel, setLocationLabel] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    if (editEvent) {
      setDate(editEvent.date);
      setEndDate("");
      setParent(editEvent.parent);
      setLocation(editEvent.location);
      setLocationLabel(editEvent.locationLabel || "");
      setTitle(editEvent.title || "");
      setNotes(editEvent.notes || "");
      setStartTime(editEvent.startTime || "");
      setEndTime(editEvent.endTime || "");
    } else if (initialDate) {
      setDate(format(initialDate, "yyyy-MM-dd"));
      setEndDate("");
      setParent("tata");
      setLocation("tunari");
      setLocationLabel("");
      setTitle("");
      setNotes("");
      setStartTime("");
      setEndTime("");
    } else {
      setDate(format(new Date(), "yyyy-MM-dd"));
      setEndDate("");
      setParent("tata");
      setLocation("tunari");
      setLocationLabel("");
      setTitle("");
      setNotes("");
      setStartTime("");
      setEndTime("");
    }
  }, [editEvent, initialDate, isOpen]);

  const displayLabel = getEventDisplayLabelWithLabels(
    {
      id: "",
      date,
      parent,
      location,
      locationLabel: locationLabel.trim() || undefined,
      created_by: "",
      created_at: "",
    },
    labels
  );

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const endDateVal = endDate.trim();
    onSave(
      {
        date,
        parent,
        location,
        locationLabel: locationLabel.trim() || undefined,
        title: title.trim() || undefined,
        notes: notes.trim() || undefined,
        startTime: startTime.trim() || undefined,
        endTime: endTime.trim() || undefined,
        created_by: currentUserId || "",
        ...(endDateVal && endDateVal >= date ? { endDate: endDateVal } : {}),
      },
      editEvent?.id
    );
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-stone-900 rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 px-4 py-3 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold text-stone-800 dark:text-stone-100">
            {editEvent ? "Editează eveniment" : "Adaugă eveniment"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -m-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 touch-manipulation"
            aria-label="Închide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className={`grid gap-3 ${!editEvent ? "grid-cols-1 min-[400px]:grid-cols-2" : "grid-cols-1"}`}>
            <div className="min-w-0">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                De la data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full min-w-0 px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
            </div>
            {!editEvent && (
              <div className="min-w-0">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Până la (opțional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={date}
                  className="w-full min-w-0 px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
                {endDate && endDate >= date && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Se creează evenimente pentru fiecare zi din interval.
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Ora start
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full min-w-0 px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Ora sfârșit
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full min-w-0 px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              Cu cine e {labels.childName}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["tata", "mama", "together"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setParent(p)}
                  aria-label={labels.parentLabels[p]}
                  className={`
                    flex items-center justify-center p-4 rounded-xl border-2 transition touch-manipulation
                    ${parent === p ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40" : "border-stone-200 dark:border-stone-600 hover:border-stone-300"}
                  `}
                >
                  <ParentIcon parent={p} size={28} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              Locație
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["tunari", "otopeni", "other"] as const).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className={`
                    px-3 py-2.5 rounded-xl border-2 text-center transition touch-manipulation text-sm font-medium
                    ${location === loc ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-stone-800 dark:text-stone-200" : "border-stone-200 dark:border-stone-600 hover:border-stone-300 text-stone-600 dark:text-stone-400"}
                  `}
                >
                  {labels.locationLabels[loc]}
                </button>
              ))}
            </div>
            {location === "other" && (
              <input
                type="text"
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                placeholder="Ex: vacanță, bunici..."
                className="mt-2 w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Titlu (opțional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={displayLabel}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Note (opțional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Detalii, ore, etc."
              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 font-medium hover:bg-stone-50 dark:hover:bg-stone-800 touch-manipulation"
            >
              Anulare
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 active:scale-[0.98] touch-manipulation"
            >
              {editEvent ? "Salvează" : "Adaugă"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
