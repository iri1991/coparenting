"use client";

import { format, startOfWeek, endOfWeek, addDays, isToday, isSameDay } from "date-fns";
import { ro } from "date-fns/locale";
import { MessageSquare } from "lucide-react";
import type { ScheduleEvent } from "@/types/events";
import { ParentIcon } from "@/components/ParentIcon";
import { useFamilyLabels, getEventShortLabelWithLabels } from "@/contexts/FamilyLabelsContext";

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
  const labels = useFamilyLabels();
  const getShortLabel = (e: ScheduleEvent) => getEventShortLabelWithLabels(e, labels);
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
    <section className="app-native-surface overflow-hidden rounded-[2rem] p-4 sm:p-5">
      <div className="flex items-end justify-between gap-3 border-b border-[#ead9c8] pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
            Snapshot
          </p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-stone-900">
          Săptămâna în curs
          </h2>
        </div>
        <p className="text-xs text-stone-500">
          {format(weekStart, "d MMM", { locale: ro })} – {format(weekEnd, "d MMM yyyy", { locale: ro })}
        </p>
      </div>
      <div className="mt-4 grid min-h-0 grid-cols-4 gap-2.5 sm:grid-cols-7">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const eventsWithNotes = getEventsWithNotes(day);
          const hasNotes = eventsWithNotes.length > 0;
          const first = dayEvents[0];
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const today = isToday(day);
          return (
            <div key={day.toISOString()} className="relative min-w-0">
              <button
                type="button"
                onClick={() => onSelectDay?.(day)}
                className={`
                  w-full min-h-[102px] rounded-[1.5rem] border px-2.5 transition touch-manipulation active:scale-[0.985]
                  ${isSelected ? "border-[#c87a5c] bg-[linear-gradient(180deg,rgba(255,245,236,0.95)_0%,rgba(255,251,246,0.9)_100%)] shadow-[0_18px_34px_rgba(184,92,62,0.12)]" : "border-white/70 bg-white/72 hover:bg-white/86"}
                  ${today && !isSelected ? "ring-2 ring-[#d9b89d]/60" : ""}
                  ${hasNotes ? "shadow-[0_12px_28px_rgba(28,25,23,0.08)]" : "shadow-[0_10px_24px_rgba(28,25,23,0.05)]"}
                `}
              >
                <div className="relative flex flex-col items-center gap-0.5 pb-1 pt-3">
                  {hasNotes && (
                    <span
                      className="absolute -right-1 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#fff1df] text-[#b85c3e]"
                      title="Are comentarii"
                    >
                      <MessageSquare size={10} strokeWidth={2.5} />
                    </span>
                  )}
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                    {WEEKDAY_LETTERS[day.getDay() === 0 ? 6 : day.getDay() - 1]}
                  </span>
                  <span
                    className={`
                      text-lg font-semibold tabular-nums
                      ${today ? "text-[#b85c3e]" : "text-stone-800"}
                    `}
                  >
                    {format(day, "d")}
                  </span>
                </div>
                <div className="flex min-h-[52px] w-full flex-1 flex-col items-center justify-center px-1.5 pb-3">
                  {first ? (
                    <>
                      <span className="mb-1 flex items-center justify-center rounded-2xl bg-[#f7f1e9] px-2 py-1">
                        <ParentIcon parent={first.parent} size={20} aria-label={getShortLabel(first)} />
                      </span>
                      <span className="line-clamp-2 w-full break-words px-0.5 text-center text-[11px] font-medium leading-snug text-stone-700">
                        {first.title ? (
                          first.title
                        ) : (
                          getShortLabel(first)
                        )}
                      </span>
                      {dayEvents.length > 1 && (
                        <span className="mt-1 rounded-full bg-[#f5eee6] px-2 py-0.5 text-[10px] font-semibold text-stone-500">
                          +{dayEvents.length - 1}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="rounded-full bg-[#f7f1e9] px-2 py-0.5 text-[11px] text-stone-400">liber</span>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
