"use client";

import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import { X, MapPin, Calendar, Clock, Lock } from "lucide-react";
import type { ScheduleEvent } from "@/types/events";
import { ParentIcon } from "@/components/ParentIcon";
import { useFamilyLabels, getEventDisplayLabelWithLabels } from "@/contexts/FamilyLabelsContext";
import type { BlockedPeriod } from "@/types/blocked";

interface EventViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ScheduleEvent | null;
  onEdit?: (event: ScheduleEvent) => void;
  /** Când false, butonul „Editează” nu se afișează (ex. evenimente din trecut). */
  canEdit?: boolean;
  blockedPeriods?: BlockedPeriod[];
}

export function EventViewModal({
  isOpen,
  onClose,
  event,
  onEdit,
  canEdit = true,
  blockedPeriods = [],
}: EventViewModalProps) {
  const labels = useFamilyLabels();
  if (!isOpen || !event) return null;

  const eventDate = event.date;
  const blocksOnThisDay = (blockedPeriods || []).filter(
    (b) => b.startDate <= eventDate && b.endDate >= eventDate
  );

  const title = event.title?.trim() || getEventDisplayLabelWithLabels(event, labels);
  const locationLabel =
    event.location === "other" && event.locationLabel?.trim()
      ? event.locationLabel.trim()
      : labels.locationLabels[event.location];
  const hasTime = !!(event.startTime || event.endTime);
  const timeLabel =
    event.startTime && event.endTime
      ? `${event.startTime} – ${event.endTime}`
      : event.startTime
        ? event.startTime
        : event.endTime
          ? `până ${event.endTime}`
          : "";

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-view-title"
    >
      <div
        className="app-native-surface-strong w-full max-w-md overflow-hidden rounded-t-[2rem] shadow-xl animate-in slide-in-from-bottom duration-200 sm:rounded-[2rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative border-b border-[#ead9c8] bg-[linear-gradient(145deg,rgba(255,246,237,0.98)_0%,rgba(249,239,229,0.88)_100%)] px-5 pb-6 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="app-native-icon-button absolute right-3 top-3 rounded-2xl p-2.5 text-stone-600 touch-manipulation"
            aria-label="Închide"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
          <div className="flex items-start gap-4">
            <span className="shrink-0 flex h-12 w-12 items-center justify-center rounded-[1.4rem] bg-white/82 border border-white/70 shadow-sm">
              <ParentIcon
                parent={event.parent}
                size={28}
                aria-label={getEventDisplayLabelWithLabels(event, labels)}
              />
            </span>
            <div className="min-w-0 flex-1 pr-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Detalii eveniment</p>
              <h2
                id="event-view-title"
                className="text-lg font-semibold leading-snug text-stone-900"
              >
                {title}
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {format(parseISO(event.date), "EEEE, d MMMM yyyy", { locale: ro })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 rounded-[1.35rem] bg-white/72 px-3 py-3 text-stone-700">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f6eee5] text-stone-500">
              <Calendar className="w-4 h-4" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                Data
              </p>
              <p className="text-sm font-medium">
                {format(parseISO(event.date), "d MMMM yyyy", { locale: ro })}
              </p>
            </div>
          </div>

          {hasTime && (
            <div className="flex items-center gap-3 rounded-[1.35rem] bg-white/72 px-3 py-3 text-stone-700">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f8e4da] text-[#b96a4b]">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                  Orar
                </p>
                <p className="text-sm font-medium">{timeLabel}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 rounded-[1.35rem] bg-white/72 px-3 py-3 text-stone-700">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff1df] text-[#b85c3e]">
              <MapPin className="w-4 h-4" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                Locație
              </p>
              <p className="text-sm font-medium">{locationLabel}</p>
            </div>
          </div>

          {event.notes?.trim() && (
            <div className="rounded-[1.35rem] bg-white/72 px-4 py-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                Note
              </p>
              <p className="whitespace-pre-wrap text-sm text-stone-700">
                {event.notes.trim()}
              </p>
            </div>
          )}

          {blocksOnThisDay.length > 0 && (
            <div className="rounded-[1.35rem] bg-[#fff5eb] px-4 py-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#9f5a40]">
                <Lock className="w-3.5 h-3.5" />
                Zi blocată
              </p>
              <ul className="space-y-2">
                {blocksOnThisDay.map((b) => (
                  <li
                    key={b.id}
                    className="rounded-[1rem] border border-[#efcfb6] bg-white/76 px-3 py-2 text-sm text-stone-700"
                  >
                    <span className="font-medium">{labels.parentLabels[b.parentType]}</span>
                    {b.note?.trim() ? (
                      <span className="text-stone-600"> – {b.note.trim()}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="app-native-secondary-button flex-1 px-4 py-3 text-sm font-semibold text-stone-700 touch-manipulation"
            >
              Închide
            </button>
            {onEdit && canEdit && (
              <button
                type="button"
                onClick={() => {
                  onEdit(event);
                  onClose();
                }}
                className="app-native-primary-button flex-1 px-4 py-3 text-sm font-semibold active:scale-[0.98] touch-manipulation"
              >
                Editează
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
