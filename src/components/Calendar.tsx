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
} from "date-fns";
import { ro } from "date-fns/locale";
import type { ScheduleEvent } from "@/types/events";
import { getEventColor } from "@/types/events";
import type { BlockedPeriod } from "@/types/blocked";
import { useFamilyLabels, getEventDisplayLabelWithLabels } from "@/contexts/FamilyLabelsContext";
import type { ProposalDay } from "@/types/proposal";

function isDateInBlock(dateStr: string, start: string, end: string): boolean {
  return dateStr >= start && dateStr <= end;
}

interface CalendarProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
  events: ScheduleEvent[];
  onSelectDate: (date: Date) => void;
  selectedDate: Date | null;
  blockedPeriods?: BlockedPeriod[];
  proposalPreviewDays?: ProposalDay[];
}

export function Calendar({
  currentDate,
  onMonthChange,
  events,
  onSelectDate,
  selectedDate,
  blockedPeriods = [],
  proposalPreviewDays = [],
}: CalendarProps) {
  const labels = useFamilyLabels();
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

  function getProposalForDay(date: Date): ProposalDay | null {
    const d = format(date, "yyyy-MM-dd");
    return proposalPreviewDays.find((p) => p.date === d) ?? null;
  }

  function getProposalBadge(proposal: ProposalDay): { label: string; cls: string } {
    if (proposal.parent === "tata") {
      return {
        label: (labels.parent1Name || "P1").charAt(0).toUpperCase(),
        cls: "bg-[#f6ddd2] text-[#b66347]",
      };
    }
    if (proposal.parent === "mama") {
      return {
        label: (labels.parent2Name || "P2").charAt(0).toUpperCase(),
        cls: "bg-[#fde9d6] text-[#a56a3d]",
      };
    }
    return {
      label: "Î",
      cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    };
  }

  const isSelected = selectedDate ? (date: Date) => isSameDay(date, selectedDate) : () => false;

  /** Pentru o zi, returnează inițialele părinților care au blocat (ex. ["I"], ["A"], ["I","A"]) */
  function getBlockedLabelsForDay(date: Date): string[] {
    const d = format(date, "yyyy-MM-dd");
    const out: string[] = [];
    for (const b of blockedPeriods) {
      if (b.parentType !== "together" && isDateInBlock(d, b.startDate, b.endDate)) {
        const name = labels.parentLabels[b.parentType];
        const initial = name.charAt(0).toUpperCase();
        if (!out.includes(initial)) out.push(initial);
      }
    }
    return out.sort();
  }

  return (
    <div className="px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex items-center justify-between gap-3 border-b border-[#ead9c8] pb-4">
        <button
          type="button"
          onClick={() => onMonthChange(addDays(currentDate, -30))}
          className="app-native-icon-button flex h-11 w-11 items-center justify-center rounded-2xl text-stone-600 active:scale-95 touch-manipulation"
          aria-label="Luna anterioară"
        >
          <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Calendar</p>
          <h2 className="truncate text-lg font-semibold capitalize tracking-tight text-stone-900">
            {format(currentDate, "MMMM yyyy", { locale: ro })}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => onMonthChange(addDays(currentDate, 30))}
          className="app-native-icon-button flex h-11 w-11 items-center justify-center rounded-2xl text-stone-600 active:scale-95 touch-manipulation"
          aria-label="Luna următoare"
        >
          <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="mt-4">
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
          {["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {weeks.flatMap((week) =>
            week.map((date) => {
              const dayEvents = getEventsForDay(date);
              const inMonth = isSameMonth(date, currentDate);
              const selected = isSelected(date);
              const today = isToday(date);
              const blockedLabels = getBlockedLabelsForDay(date);
              const proposal = getProposalForDay(date);
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => onSelectDate(date)}
                  className={`
                    min-h-[64px] rounded-[1.25rem] border px-1 py-2
                    flex flex-col items-center justify-center gap-1 touch-manipulation transition active:scale-[0.97]
                    ${!inMonth ? "border-transparent bg-white/28 text-stone-300" : "border-white/70 bg-white/74 text-stone-800 shadow-[0_10px_22px_rgba(28,25,23,0.05)]"}
                    ${selected ? "border-[#c87a5c] bg-[linear-gradient(180deg,rgba(255,243,231,0.96)_0%,rgba(255,251,247,0.92)_100%)] shadow-[0_16px_34px_rgba(184,92,62,0.12)]" : ""}
                    ${today && !selected ? "ring-2 ring-[#d9b89d]/60" : ""}
                    ${!selected && inMonth ? "hover:bg-white/88" : ""}
                  `}
                >
                  <span className={`text-sm font-semibold ${today ? "text-[#b85c3e]" : ""}`}>{format(date, "d")}</span>
                  <div className="flex max-w-full flex-wrap items-center justify-center gap-0.5">
                    {dayEvents.slice(0, 2).map((e) => (
                      <span
                        key={e.id}
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: getEventColor(e) }}
                        title={e.title || getEventDisplayLabelWithLabels(e, labels)}
                      />
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[10px] font-semibold text-stone-400">+{dayEvents.length - 2}</span>
                    )}
                    {proposal && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${getProposalBadge(proposal).cls}`}
                        title={`Propunere: ${labels.parentLabels[proposal.parent] ?? proposal.parent} · ${labels.locationLabels[proposal.location] ?? proposal.location}`}
                      >
                        {getProposalBadge(proposal).label}
                      </span>
                    )}
                    {blockedLabels.length > 0 && (
                      <span
                        className="px-1 text-[10px] font-medium text-stone-400"
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
