"use client";

import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  isWithinInterval,
} from "date-fns";
import { ro } from "date-fns/locale";
import type { ScheduleEvent } from "@/types/events";
import { getEventColor, getEventDisplayLabel, PARENT_LABELS } from "@/types/events";
import type { BlockedPeriod } from "@/types/blocked";

export type DateRange = { start: Date; end: Date };

function isDateInBlock(dateStr: string, start: string, end: string): boolean {
  return dateStr >= start && dateStr <= end;
}

interface CalendarProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
  events: ScheduleEvent[];
  onSelectDate: (date: Date) => void;
  selectedRange: DateRange | null;
  onDeselectRange: () => void;
  blockedPeriods?: BlockedPeriod[];
}

export function Calendar({
  currentDate,
  onMonthChange,
  events,
  onSelectDate,
  selectedRange,
  onDeselectRange,
  blockedPeriods = [],
}: CalendarProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const start = startOfWeek(monthStart, { weekStartsOn: 1 });
  const end = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const weeks: Date[][] = [];
  let day = start;
  while (day <= end) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  function getEventsForDay(date: Date) {
    const d = format(date, "yyyy-MM-dd");
    return events.filter((e) => e.date === d);
  }

  function isInRange(date: Date): boolean {
    if (!selectedRange) return false;
    return isWithinInterval(date, { start: selectedRange.start, end: selectedRange.end });
  }

  /** Pentru o zi, returnează inițialele părinților care au blocat (ex. ["I"], ["A"], ["I","A"]) */
  function getBlockedLabelsForDay(date: Date): string[] {
    const d = format(date, "yyyy-MM-dd");
    const out: string[] = [];
    for (const b of blockedPeriods) {
      if (b.parentType !== "together" && isDateInBlock(d, b.startDate, b.endDate)) {
        const initial = PARENT_LABELS[b.parentType].charAt(0);
        if (!out.includes(initial)) out.push(initial);
      }
    }
    return out.sort();
  }

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-700">
        <button
          type="button"
          onClick={() => onMonthChange(addDays(currentDate, -30))}
          className="p-2 -m-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 touch-manipulation"
          aria-label="Luna anterioară"
        >
          <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 capitalize">
          {format(currentDate, "MMMM yyyy", { locale: ro })}
        </h2>
        <button
          type="button"
          onClick={() => onMonthChange(addDays(currentDate, 30))}
          className="p-2 -m-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 touch-manipulation"
          aria-label="Luna următoare"
        >
          <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      {selectedRange && (
        <div className="px-4 py-2 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2 bg-amber-50/50 dark:bg-amber-950/20">
          <span className="text-sm text-stone-600 dark:text-stone-400">
            {isSameDay(selectedRange.start, selectedRange.end)
              ? format(selectedRange.start, "d MMM yyyy", { locale: ro })
              : `${format(selectedRange.start, "d MMM", { locale: ro })} – ${format(selectedRange.end, "d MMM yyyy", { locale: ro })}`}
          </span>
          <button
            type="button"
            onClick={onDeselectRange}
            className="text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline touch-manipulation"
          >
            Deselectează
          </button>
        </div>
      )}
      <div className="p-2">
        <div className="grid grid-cols-7 gap-0.5 text-center text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">
          {["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {weeks.flatMap((week) =>
            week.map((date) => {
              const dayEvents = getEventsForDay(date);
              const inMonth = isSameMonth(date, currentDate);
              const inRange = isInRange(date);
              const today = isToday(date);
              const blockedLabels = getBlockedLabelsForDay(date);
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => onSelectDate(date)}
                  className={`
                    min-h-[44px] sm:min-h-[52px] rounded-xl flex flex-col items-center justify-center gap-0.5
                    touch-manipulation active:scale-95 transition
                    ${!inMonth ? "text-stone-300 dark:text-stone-600" : "text-stone-800 dark:text-stone-200"}
                    ${inRange ? "ring-2 ring-amber-500 bg-amber-100 dark:bg-amber-900/40" : "hover:bg-stone-100 dark:hover:bg-stone-800"}
                    ${today && !inRange ? "bg-amber-100/50 dark:bg-amber-900/20 font-semibold" : ""}
                  `}
                >
                  <span className="text-sm">{format(date, "d")}</span>
                  <div className="flex gap-0.5 flex-wrap justify-center max-w-full items-center">
                    {dayEvents.slice(0, 2).map((e) => (
                      <span
                        key={e.id}
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: getEventColor(e) }}
                        title={e.title || getEventDisplayLabel(e)}
                      />
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[10px] text-stone-400">+{dayEvents.length - 2}</span>
                    )}
                    {blockedLabels.length > 0 && (
                      <span
                        className="text-[10px] font-medium text-stone-400 dark:text-stone-500 px-1"
                        title={`Blocat: ${blockedLabels.join(", ")}`}
                      >
                        🔒 {blockedLabels.join("")}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
