"use client";

import { format, startOfWeek, endOfWeek, addDays, isToday, isSameDay } from "date-fns";
import { ro } from "date-fns/locale";
import { MessageSquare } from "lucide-react";
import type { ScheduleEvent } from "@/types/events";
import { getEventShortLabel } from "@/types/events";
import { ParentIcon } from "@/components/ParentIcon";

const WEEKDAY_LETTERS = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];

interface WeekSummaryProps {
  events: ScheduleEvent[];
  onSelectDay?: (date: Date) => void;
  selectedDate?: Date | null;
}

export function WeekSummary({
  events,
  onSelectDay,
  selectedDate,
}: WeekSummaryProps) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function getEventsForDay(date: Date) {
    const d = format(date, "yyyy-MM-dd");
    return events.filter((e) => e.date === d);
  }

  function getEventsWithNotes(date: Date): ScheduleEvent[] {
    return getEventsForDay(date).filter((e) => e.notes?.trim());
  }

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden">
      <div className="px-4 py-3.5 border-b border-stone-100 dark:border-stone-800">
        <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100 tracking-tight">
          Săptămâna în curs
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          {format(weekStart, "d MMM", { locale: ro })} – {format(weekEnd, "d MMM yyyy", { locale: ro })}
        </p>
      </div>
      <div className="p-3 flex gap-2 overflow-x-auto min-h-[100px]">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const eventsWithNotes = getEventsWithNotes(day);
          const hasNotes = eventsWithNotes.length > 0;
          const first = dayEvents[0];
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const today = isToday(day);
          return (
            <div key={day.toISOString()} className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => onSelectDay?.(day)}
                className={`
                  w-[76px] min-w-[76px] rounded-xl flex flex-col items-center
                  touch-manipulation active:scale-[0.98] transition border-2
                  ${isSelected ? "border-amber-400 bg-amber-50/80 dark:bg-amber-950/30 dark:border-amber-500" : "border-transparent hover:bg-stone-50 dark:hover:bg-stone-800/50"}
                  ${today && !isSelected ? "bg-stone-50 dark:bg-stone-800/30" : ""}
                  ${hasNotes ? "ring-2 ring-amber-300/60 dark:ring-amber-500/40 ring-offset-1 ring-offset-white dark:ring-offset-stone-900 rounded-xl" : ""}
                `}
              >
                <div className="pt-2.5 pb-1 flex flex-col items-center gap-0.5 relative">
                  {hasNotes && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400"
                      title="Are comentarii"
                    >
                      <MessageSquare size={10} strokeWidth={2.5} />
                    </span>
                  )}
                  <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    {WEEKDAY_LETTERS[day.getDay() === 0 ? 6 : day.getDay() - 1]}
                  </span>
                  <span
                    className={`
                      text-lg font-semibold tabular-nums
                      ${today ? "text-amber-600 dark:text-amber-400" : "text-stone-700 dark:text-stone-300"}
                    `}
                  >
                    {format(day, "d")}
                  </span>
                </div>
                <div className="flex-1 w-full px-1.5 pb-2.5 flex flex-col items-center justify-center min-h-[44px]">
                  {first ? (
                    <>
                      <span className="mb-1 flex items-center justify-center">
                        <ParentIcon parent={first.parent} size={20} aria-label={getEventShortLabel(first)} />
                      </span>
                      <span className="text-[11px] leading-snug text-stone-600 dark:text-stone-300 text-center font-medium">
                        {first.title ? (
                          <span className="line-clamp-2">{first.title}</span>
                        ) : (
                          getEventShortLabel(first)
                        )}
                      </span>
                      {dayEvents.length > 1 && (
                        <span className="text-[10px] text-stone-400 mt-0.5 font-medium">
                          +{dayEvents.length - 1}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[11px] text-stone-300 dark:text-stone-500">—</span>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
