"use client";

import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import type { ScheduleEvent } from "@/types/events";
import { getEventDisplayLabel } from "@/types/events";
import { ParentIcon } from "@/components/ParentIcon";

interface EventListProps {
  events: ScheduleEvent[];
  onEdit?: (event: ScheduleEvent) => void;
  onDelete?: (event: ScheduleEvent) => void;
  emptyMessage?: string;
}

export function EventList({
  events,
  onEdit,
  onDelete,
  emptyMessage = "Niciun eveniment în această perioadă.",
}: EventListProps) {
  const sorted = [...events].sort((a, b) => {
    const d = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (d !== 0) return d;
    const aTime = a.startTime ?? "";
    const bTime = b.startTime ?? "";
    return aTime.localeCompare(bTime);
  });

  if (sorted.length === 0) {
    return (
      <p className="text-stone-500 dark:text-stone-400 text-center py-8 text-sm">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {sorted.map((event) => (
        <li
          key={event.id}
          className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm"
        >
          <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800">
            <ParentIcon parent={event.parent} size={20} aria-label={getEventDisplayLabel(event)} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-stone-800 dark:text-stone-100 truncate">
              {event.title || getEventDisplayLabel(event)}
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {format(parseISO(event.date), "EEEE, d MMMM", { locale: ro })}
              {(event.startTime || event.endTime) && (
                <span className="ml-1 font-medium text-stone-600 dark:text-stone-300">
                  {event.startTime && event.endTime
                    ? ` • ${event.startTime} – ${event.endTime}`
                    : event.startTime
                      ? ` • ${event.startTime}`
                      : event.endTime
                        ? ` – ${event.endTime}`
                        : ""}
                </span>
              )}
            </p>
            {event.notes && (
              <p className="text-sm text-stone-600 dark:text-stone-300 mt-1 line-clamp-2">
                {event.notes}
              </p>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(event)}
                className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 touch-manipulation"
                aria-label="Editează"
              >
                <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(event)}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-95 touch-manipulation"
                aria-label="Șterge"
              >
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
