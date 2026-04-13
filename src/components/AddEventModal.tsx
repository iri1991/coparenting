"use client";
import { useLanguage } from "@/contexts/LanguageContext";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { ScheduleEvent, ParentType, LocationType } from "@/types/events";
import { ParentIcon } from "@/components/ParentIcon";
import { useFamilyLabels, getEventDisplayLabelWithLabels } from "@/contexts/FamilyLabelsContext";

type EventPayload = Omit<ScheduleEvent, "id" | "created_at"> & {
  allowPastEdit?: boolean;
  pastEditReason?: string;
};

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
  const { t } = useLanguage();
  const ev = t.app.events;
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [allowPastEdit, setAllowPastEdit] = useState(false);
  const [pastEditReason, setPastEditReason] = useState("");

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
      setAllowPastEdit(false);
      setPastEditReason("");
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
      setAllowPastEdit(false);
      setPastEditReason("");
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
      setAllowPastEdit(false);
      setPastEditReason("");
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
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const isEditingPastEvent = Boolean(editEvent && editEvent.date < todayStr);

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
        ...(isEditingPastEvent ? { allowPastEdit, pastEditReason: pastEditReason.trim() || undefined } : {}),
        ...(endDateVal && endDateVal >= date ? { endDate: endDateVal } : {}),
      },
      editEvent?.id
    );
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="app-native-surface-strong max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] shadow-xl animate-in slide-in-from-bottom duration-200 sm:rounded-[2rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 border-b border-[#ead9c8] bg-[rgba(255,249,243,0.92)] px-4 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                {editEvent ? ev.update : ev.newProgram}
              </p>
              <h2 id="modal-title" className="mt-1 text-lg font-semibold text-stone-900">
                {editEvent ? ev.editTitle : ev.addTitle}
              </h2>
            </div>
          <button
            type="button"
            onClick={onClose}
              className="app-native-icon-button rounded-2xl p-2.5 text-stone-600 touch-manipulation"
            aria-label={ev.close}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div className={`grid gap-2.5 ${!editEvent ? "grid-cols-2" : "grid-cols-1"}`}>
            <div className="min-w-0">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                {ev.from}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="app-native-input app-native-picker w-full min-w-0 px-3 py-3 text-[15px]"
              />
            </div>
            {!editEvent && (
              <div className="min-w-0">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                  {ev.until}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={date}
                  className="app-native-input app-native-picker w-full min-w-0 px-3 py-3 text-[15px]"
                />
                {endDate && endDate >= date && (
                  <p className="mt-1 text-xs text-stone-500">
                    {ev.rangeHint}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="min-w-0">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                {ev.startTime}
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="app-native-input app-native-picker w-full min-w-0 px-3 py-3 text-[15px]"
              />
            </div>
            <div className="min-w-0">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                {ev.endTime}
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="app-native-input app-native-picker w-full min-w-0 px-3 py-3 text-[15px]"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
              {ev.withWhom} {labels.childName}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["tata", "mama", "together"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setParent(p)}
                  aria-label={labels.parentLabels[p]}
                  className={`
                    flex items-center justify-center rounded-[1.3rem] border p-4 transition touch-manipulation
                    ${parent === p ? "border-[#c87a5c] bg-[#fff4e9] shadow-[0_14px_28px_rgba(184,92,62,0.1)]" : "border-white/70 bg-white/74 hover:bg-white/86"}
                  `}
                >
                  <ParentIcon parent={p} size={28} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
              {ev.location}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["tunari", "otopeni", "other"] as const).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className={`
                    rounded-[1.3rem] border px-3 py-3 text-center text-sm font-semibold transition touch-manipulation
                    ${location === loc ? "border-[#c87a5c] bg-[#fff4e9] text-stone-800 shadow-[0_14px_28px_rgba(184,92,62,0.1)]" : "border-white/70 bg-white/74 text-stone-600 hover:bg-white/86"}
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
                placeholder={ev.locationPlaceholder}
                className="app-native-input mt-2 w-full px-4 py-3 text-sm"
              />
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
              {ev.titleOpt}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={displayLabel}
              className="app-native-input w-full px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
              {ev.notesOpt}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={ev.notesPlaceholder}
              className="app-native-input w-full resize-none px-4 py-3 text-sm"
            />
          </div>
          {isEditingPastEvent && (
            <div className="space-y-2 rounded-[1.5rem] border border-[#efcfb6] bg-[#fff5eb] p-4">
              <p className="text-sm font-semibold text-[#9f5a40]">
                {ev.pastEdit}
              </p>
              <label className="flex items-start gap-2 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={allowPastEdit}
                  onChange={(e) => setAllowPastEdit(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-amber-500"
                  required
                />
                {ev.pastConfirm}
              </label>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                  {ev.reason}
                </label>
                <textarea
                  value={pastEditReason}
                  onChange={(e) => setPastEditReason(e.target.value)}
                  placeholder={ev.reasonPlaceholder}
                  required
                  minLength={8}
                  rows={2}
                  className="app-native-input w-full px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="app-native-secondary-button flex-1 px-4 py-3 text-sm font-semibold text-stone-700 touch-manipulation"
            >
              {ev.cancel}
            </button>
            <button
              type="submit"
              className="app-native-primary-button flex-1 px-4 py-3 text-sm font-semibold active:scale-[0.98] touch-manipulation"
            >
              {editEvent ? ev.save : ev.add}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
