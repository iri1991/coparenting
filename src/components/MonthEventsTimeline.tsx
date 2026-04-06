"use client";

import { useMemo, useState } from "react";
import { format, addDays, startOfMonth, endOfMonth, isToday, isBefore, isAfter } from "date-fns";
import { ro } from "date-fns/locale";
import type { ScheduleEvent } from "@/types/events";
import { ParentIcon } from "@/components/ParentIcon";
import { useFamilyLabels, getEventDisplayLabelWithLabels } from "@/contexts/FamilyLabelsContext";

interface MonthEventsTimelineProps {
  events: ScheduleEvent[];
  currentDate: Date;
  onView?: (event: ScheduleEvent) => void;
  onEdit?: (event: ScheduleEvent) => void;
  onDelete?: (event: ScheduleEvent) => void;
  canEditEvent?: (event: ScheduleEvent) => boolean;
  onSelectDate?: (date: Date) => void;
  emptyMessage?: string;
}

function EventCard({
  event,
  isTodayRow,
  onView,
  onEdit,
  onDelete,
  canEdit,
  getDisplayLabel,
}: {
  event: ScheduleEvent;
  isTodayRow: boolean;
  onView?: (event: ScheduleEvent) => void;
  onEdit?: (event: ScheduleEvent) => void;
  onDelete?: (event: ScheduleEvent) => void;
  canEdit?: boolean;
  getDisplayLabel: (e: ScheduleEvent) => string;
}) {
  return (
    <li
      role={onView ? "button" : undefined}
      tabIndex={onView ? 0 : undefined}
      onClick={onView ? () => onView(event) : undefined}
      onKeyDown={onView ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onView(event); } } : undefined}
      className={`
        group flex items-center gap-3 rounded-[1.5rem] border p-3 backdrop-blur-[1px]
        ${onView ? "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.995] touch-manipulation" : ""}
        ${
          isTodayRow
            ? "border-[#efcfb6] bg-gradient-to-r from-[#fff5eb] to-white"
            : "border-white/70 bg-white/78 shadow-[0_12px_26px_rgba(28,25,23,0.05)]"
        }
      `}
    >
      <span
        className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-xl ${
          isTodayRow ? "bg-[#fff1df] ring-1 ring-[#efcfb6]" : "bg-[#f6eee5]"
        }`}
      >
        <ParentIcon parent={event.parent} size={18} aria-label={getDisplayLabel(event)} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold tracking-tight text-stone-900">
          {event.title || getDisplayLabel(event)}
        </p>
        <p className="text-xs text-stone-500">
          {(event.startTime || event.endTime) && (
            <span className="font-medium text-stone-700">
              {event.startTime && event.endTime ? `${event.startTime} – ${event.endTime}` : event.startTime || event.endTime || ""}
            </span>
          )}
          {event.notes?.trim() && <span className="ml-1 line-clamp-1">{event.notes.trim()}</span>}
        </p>
      </div>
      {(onEdit || onDelete) && canEdit !== false && (
        <div className="shrink-0 flex gap-1 opacity-90 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(event)}
              className="app-native-icon-button rounded-xl p-1.5 transition"
              aria-label="Editează"
            >
              <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
          )}
          {onDelete && (
            <button type="button" onClick={() => onDelete(event)} className="rounded-xl border border-red-100 bg-white/80 p-1.5" aria-label="Șterge">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          )}
        </div>
      )}
    </li>
  );
}

export function MonthEventsTimeline({
  events,
  currentDate,
  onView,
  onEdit,
  onDelete,
  canEditEvent,
  onSelectDate,
  emptyMessage = "Niciun eveniment în această lună.",
}: MonthEventsTimelineProps) {
  const labels = useFamilyLabels();
  const getDisplayLabel = (event: ScheduleEvent) => getEventDisplayLabelWithLabels(event, labels);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const focusDates = useMemo(() => {
    const out: Date[] = [];
    for (const offset of [-1, 0, 1]) {
      const d = addDays(today, offset);
      if (!isBefore(d, monthStart) && !isAfter(d, monthEnd)) out.push(d);
    }
    return out;
  }, [today, monthStart, monthEnd]);

  const daysInMonth = useMemo(() => {
    const days: Date[] = [];
    let d = monthStart;
    while (d <= monthEnd) {
      days.push(d);
      d = addDays(d, 1);
    }
    return days;
  }, [monthStart, monthEnd]);

  const firstFocus = focusDates[0];
  const lastFocus = focusDates[focusDates.length - 1];

  const daysBeforeFocus = useMemo(
    () => (firstFocus ? daysInMonth.filter((d) => isBefore(d, firstFocus)) : []),
    [daysInMonth, firstFocus]
  );
  const daysAfterFocus = useMemo(
    () => (lastFocus ? daysInMonth.filter((d) => isAfter(d, lastFocus)) : daysInMonth),
    [daysInMonth, lastFocus]
  );

  const [expandedBefore, setExpandedBefore] = useState(false);
  const [expandedAfter, setExpandedAfter] = useState(false);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>();
    for (const e of events) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
    }
    return map;
  }, [events]);

  if (daysInMonth.length === 0) {
    return <p className="rounded-[1.6rem] border border-dashed border-[#ddc9b4] bg-white/55 px-4 py-8 text-center text-sm text-stone-500">{emptyMessage}</p>;
  }

  function renderDayRow(day: Date) {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayEvents = eventsByDate.get(dateStr) ?? [];
    const isTodayRow = isToday(day);
    return (
      <div
        key={dateStr}
        className={`relative flex min-h-[52px] gap-3 py-3 sm:gap-4 ${
          isTodayRow
            ? "rounded-[1.8rem] bg-gradient-to-r from-[#fff5eb] to-[#fffaf5] ring-2 ring-[#efcfb6] ring-offset-2 ring-offset-[#f7f1e9] -mx-1 px-3 shadow-[0_16px_34px_rgba(184,92,62,0.08)] sm:px-4"
            : ""
        }`}
      >
        <div className="w-12 shrink-0 pt-0.5 sm:w-14">
          <button
            type="button"
            onClick={() => onSelectDate?.(day)}
            className={`flex h-11 w-11 flex-col items-center justify-center rounded-full border-2 transition sm:h-12 sm:w-12 ${
              isTodayRow
                ? "border-[#b85c3e] bg-gradient-to-b from-[#c87a5c] to-[#b85c3e] font-bold text-white shadow-md"
                : "border-white/70 bg-white/82 hover:border-[#ddc9b4]"
            }`}
          >
            <span className={`text-xs font-medium uppercase tracking-wider leading-tight ${isTodayRow ? "text-amber-100" : "text-stone-500"}`}>
              {format(day, "EEE", { locale: ro })}
            </span>
            <span className={`text-sm font-semibold tabular-nums ${isTodayRow ? "text-white" : "text-stone-800"}`}>{format(day, "d")}</span>
          </button>
          {isTodayRow && <span className="mt-1 block text-center text-[10px] font-semibold uppercase tracking-wider text-[#b85c3e]">Azi</span>}
        </div>
        <div className="min-w-0 flex-1 pt-1">
          {dayEvents.length === 0 ? (
            <div className="py-1 text-sm text-stone-400">—</div>
          ) : (
            <ul className="space-y-2">
              {dayEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isTodayRow={isTodayRow}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  canEdit={canEditEvent ? canEditEvent(event) : true}
                  getDisplayLabel={getDisplayLabel}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  function renderCollapsedBlock(label: string, onClick: () => void, expanded: boolean) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="relative flex w-full items-center gap-3 rounded-[1.6rem] border border-white/70 bg-white/72 py-3 text-left shadow-[0_10px_24px_rgba(28,25,23,0.04)] transition"
      >
        <div className="flex w-12 shrink-0 items-center justify-center sm:w-14">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-[#ddc9b4] text-stone-400">
            <svg className={`w-5 h-5 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium text-stone-600">{label}</span>
        </div>
      </button>
    );
  }

  const labelBefore =
    daysBeforeFocus.length > 0
      ? `${format(daysBeforeFocus[0], "d MMM", { locale: ro })} – ${format(daysBeforeFocus[daysBeforeFocus.length - 1], "d MMM", { locale: ro })} · ${daysBeforeFocus.length} zile`
      : "";
  const labelAfter =
    daysAfterFocus.length > 0
      ? `${format(daysAfterFocus[0], "d MMM", { locale: ro })} – ${format(daysAfterFocus[daysAfterFocus.length - 1], "d MMM", { locale: ro })} · ${daysAfterFocus.length} zile`
      : "";

  return (
    <div className="relative">
      <div
        className="absolute bottom-0 left-6 top-0 w-px bg-gradient-to-b from-[#e6d4c2] via-[#e6d4c2] to-[#d8c1ab]"
        aria-hidden
      />
      <div className="space-y-0">
        {daysBeforeFocus.length > 0 && (
          <>
            {renderCollapsedBlock(labelBefore, () => setExpandedBefore((b) => !b), expandedBefore)}
            {expandedBefore && daysBeforeFocus.map((day) => renderDayRow(day))}
          </>
        )}
        {focusDates.map((day) => renderDayRow(day))}
        {daysAfterFocus.length > 0 && (
          <>
            {renderCollapsedBlock(labelAfter, () => setExpandedAfter((b) => !b), expandedAfter)}
            {expandedAfter && daysAfterFocus.map((day) => renderDayRow(day))}
          </>
        )}
      </div>
    </div>
  );
}
