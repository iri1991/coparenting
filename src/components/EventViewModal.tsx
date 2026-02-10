"use client";

import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import { X, MapPin, Calendar, Clock, Lock } from "lucide-react";
import type { ScheduleEvent } from "@/types/events";
import { getEventDisplayLabel, LOCATION_LABELS, PARENT_LABELS } from "@/types/events";
import { ParentIcon } from "@/components/ParentIcon";
import type { BlockedPeriod } from "@/types/blocked";

interface EventViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ScheduleEvent | null;
  onEdit?: (event: ScheduleEvent) => void;
  blockedPeriods?: BlockedPeriod[];
}

export function EventViewModal({
  isOpen,
  onClose,
  event,
  onEdit,
  blockedPeriods = [],
}: EventViewModalProps) {
  if (!isOpen || !event) return null;

  const eventDate = event.date;
  const blocksOnThisDay = (blockedPeriods || []).filter(
    (b) => b.startDate <= eventDate && b.endDate >= eventDate
  );

  const title = event.title?.trim() || getEventDisplayLabel(event);
  const locationLabel =
    event.location === "other" && event.locationLabel?.trim()
      ? event.locationLabel.trim()
      : LOCATION_LABELS[event.location];
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-view-title"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-stone-900 rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-stone-800 dark:to-stone-850 border-b border-stone-200 dark:border-stone-700 px-5 pt-5 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/60 dark:hover:bg-stone-700/60 touch-manipulation"
            aria-label="Închide"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
          <div className="flex items-start gap-4">
            <span className="shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 shadow-sm">
              <ParentIcon
                parent={event.parent}
                size={28}
                aria-label={getEventDisplayLabel(event)}
              />
            </span>
            <div className="min-w-0 flex-1 pr-8">
              <h2
                id="event-view-title"
                className="text-lg font-semibold text-stone-800 dark:text-stone-100 leading-snug"
              >
                {title}
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                {format(parseISO(event.date), "EEEE, d MMMM yyyy", { locale: ro })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 text-stone-700 dark:text-stone-300">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
              <Calendar className="w-4 h-4" />
            </span>
            <div>
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                Data
              </p>
              <p className="text-sm font-medium">
                {format(parseISO(event.date), "d MMMM yyyy", { locale: ro })}
              </p>
            </div>
          </div>

          {hasTime && (
            <div className="flex items-center gap-3 text-stone-700 dark:text-stone-300">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                  Orar
                </p>
                <p className="text-sm font-medium">{timeLabel}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-stone-700 dark:text-stone-300">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
              <MapPin className="w-4 h-4" />
            </span>
            <div>
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                Locație
              </p>
              <p className="text-sm font-medium">{locationLabel}</p>
            </div>
          </div>

          {event.notes?.trim() && (
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1.5">
                Note
              </p>
              <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
                {event.notes.trim()}
              </p>
            </div>
          )}

          {blocksOnThisDay.length > 0 && (
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Zi blocată
              </p>
              <ul className="space-y-2">
                {blocksOnThisDay.map((b) => (
                  <li
                    key={b.id}
                    className="text-sm text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/50 rounded-lg px-3 py-2 border border-stone-100 dark:border-stone-700"
                  >
                    <span className="font-medium">{PARENT_LABELS[b.parentType]}</span>
                    {b.note?.trim() ? (
                      <span className="text-stone-600 dark:text-stone-400"> – {b.note.trim()}</span>
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
              className="flex-1 py-3 rounded-xl border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-300 font-medium hover:bg-stone-50 dark:hover:bg-stone-800 touch-manipulation"
            >
              Închide
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onEdit(event);
                  onClose();
                }}
                className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 active:scale-[0.98] touch-manipulation"
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
