"use client";

import { useEffect, useRef, useMemo, useState } from "react";
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
  /** Dacă e fals pentru un eveniment, butoanele Editează/Șterge sunt ascunse (evenimente din trecut). */
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
        flex items-center gap-3 p-2.5 rounded-xl border
        ${onView ? "cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 active:scale-[0.99] touch-manipulation" : ""}
        ${isTodayRow ? "border-amber-200/80 dark:border-amber-800/50 bg-white/80 dark:bg-stone-900/80" : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-sm"}
      `}
    >
      <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800">
        <ParentIcon parent={event.parent} size={18} aria-label={getDisplayLabel(event)} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-stone-800 dark:text-stone-100 truncate text-sm">{event.title || getDisplayLabel(event)}</p>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {(event.startTime || event.endTime) && (
            <span className="font-medium text-stone-600 dark:text-stone-300">
              {event.startTime && event.endTime ? `${event.startTime} – ${event.endTime}` : event.startTime || event.endTime || ""}
            </span>
          )}
          {event.notes?.trim() && <span className="ml-1 line-clamp-1">{event.notes.trim()}</span>}
        </p>
      </div>
      {(onEdit || onDelete) && canEdit !== false && (
        <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <button type="button" onClick={() => onEdit(event)} className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800" aria-label="Editează">
              <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
          )}
          {onDelete && (
            <button type="button" onClick={() => onDelete(event)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30" aria-label="Șterge">
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
  const todayRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const el = todayRef.current;
    if (!el) return;
    const t = setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    return () => clearTimeout(t);
  }, [currentDate]);

  if (daysInMonth.length === 0) {
    return <p className="text-stone-500 dark:text-stone-400 text-center py-8 text-sm">{emptyMessage}</p>;
  }

  function renderDayRow(day: Date, isFocus: boolean) {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayEvents = eventsByDate.get(dateStr) ?? [];
    const isTodayRow = isToday(day);
    return (
      <div
        key={dateStr}
        ref={isTodayRow ? todayRef : null}
        className={`relative flex gap-3 sm:gap-4 py-3 min-h-[52px] ${
          isTodayRow
            ? "rounded-xl bg-amber-50/80 dark:bg-amber-950/30 ring-2 ring-amber-300/60 dark:ring-amber-500/40 ring-offset-2 ring-offset-white dark:ring-offset-stone-900 -mx-1 px-3 sm:px-4"
            : ""
        }`}
      >
        <div className="shrink-0 flex flex-col items-center w-12 sm:w-14 pt-0.5">
          <button
            type="button"
            onClick={() => onSelectDate?.(day)}
            className={`flex flex-col items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 transition ${
              isTodayRow ? "border-amber-500 bg-amber-500 text-white font-bold shadow-md" : "border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 hover:border-stone-300 dark:hover:border-stone-500"
            }`}
          >
            <span className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 leading-tight">{format(day, "EEE", { locale: ro })}</span>
            <span className={`text-sm font-semibold tabular-nums ${isTodayRow ? "text-white" : "text-stone-800 dark:text-stone-200"}`}>{format(day, "d")}</span>
          </button>
          {isTodayRow && <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Azi</span>}
        </div>
        <div className="flex-1 min-w-0 pt-1">
          {dayEvents.length === 0 ? (
            <div className="text-stone-400 dark:text-stone-500 text-sm py-1">—</div>
          ) : (
            <ul className="space-y-2">
              {dayEvents.map((event) => (
                <EventCard key={event.id} event={event} isTodayRow={isTodayRow} onView={onView} onEdit={onEdit} onDelete={onDelete} canEdit={canEditEvent ? canEditEvent(event) : true} getDisplayLabel={getDisplayLabel} />
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
        className="relative flex gap-3 sm:gap-4 py-3 w-full text-left items-center rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
      >
        <div className="shrink-0 flex items-center justify-center w-12 sm:w-14">
          <span className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-dashed border-stone-300 dark:border-stone-600 text-stone-400 dark:text-stone-500">
            <svg className={`w-5 h-5 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-stone-600 dark:text-stone-400">{label}</span>
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
      <div className="absolute left-6 top-0 bottom-0 w-px bg-stone-200 dark:bg-stone-700" aria-hidden />
      <div className="space-y-0">
        {daysBeforeFocus.length > 0 && (
          <>
            {renderCollapsedBlock(labelBefore, () => setExpandedBefore((b) => !b), expandedBefore)}
            {expandedBefore && daysBeforeFocus.map((day) => renderDayRow(day, false))}
          </>
        )}
        {focusDates.map((day) => renderDayRow(day, true))}
        {daysAfterFocus.length > 0 && (
          <>
            {renderCollapsedBlock(labelAfter, () => setExpandedAfter((b) => !b), expandedAfter)}
            {expandedAfter && daysAfterFocus.map((day) => renderDayRow(day, false))}
          </>
        )}
      </div>
    </div>
  );
}
