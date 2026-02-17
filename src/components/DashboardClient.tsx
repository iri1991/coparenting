"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, format, addDays, isBefore, isSameDay } from "date-fns";
import { ro } from "date-fns/locale";
import { Calendar } from "@/components/Calendar";
import { EventList } from "@/components/EventList";
import { MonthEventsTimeline } from "@/components/MonthEventsTimeline";
import { AddEventModal } from "@/components/AddEventModal";
import { EventViewModal } from "@/components/EventViewModal";
import { WeekSummary } from "@/components/WeekSummary";
import { BlockedDaysModal } from "@/components/BlockedDaysModal";
import { WeeklyProposalCard } from "@/components/WeeklyProposalCard";
import type { ScheduleEvent } from "@/types/events";
import type { BlockedPeriod } from "@/types/blocked";
import { FamilyLabelsProvider } from "@/contexts/FamilyLabelsContext";
import { UpgradeCta } from "@/components/UpgradeCta";

const POLL_INTERVAL_MS = 15000;

type ParentRole = "tata" | "mama";

interface UserProfile {
  name: string | null;
  email: string | null;
  parentType: ParentRole | null;
}

interface DashboardClientProps {
  initialEvents: ScheduleEvent[];
  currentUserId?: string;
  userName?: string;
  parent1Name?: string;
  parent2Name?: string;
  childName?: string;
  residenceNames?: string[];
  /** When provided (e.g. from header), modals are controlled by parent */
  modalOpen?: boolean;
  setModalOpen?: (open: boolean) => void;
  blockedDaysModalOpen?: boolean;
  setBlockedDaysModalOpen?: (open: boolean) => void;
  registerOpenAddModal?: (fn: (() => void) | null) => void;
  plan?: "free" | "pro" | "family";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function DashboardClient({
  initialEvents,
  currentUserId,
  userName,
  parent1Name = "Părinte 1",
  parent2Name = "Părinte 2",
  childName = "copilul",
  residenceNames = ["Tunari", "Otopeni"],
  modalOpen: modalOpenProp,
  setModalOpen: setModalOpenProp,
  blockedDaysModalOpen: blockedDaysModalOpenProp,
  setBlockedDaysModalOpen: setBlockedDaysModalOpenProp,
  registerOpenAddModal,
  plan = "free",
}: DashboardClientProps) {
  const [events, setEvents] = useState<ScheduleEvent[]>(initialEvents);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<ScheduleEvent | null>(null);
  const [viewEvent, setViewEvent] = useState<ScheduleEvent | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);
  const [internalBlockedDaysModalOpen, setInternalBlockedDaysModalOpen] = useState(false);
  const [calendarExpanded, setCalendarExpanded] = useState(false);

  const modalOpen = modalOpenProp ?? internalModalOpen;
  const setModalOpen = setModalOpenProp ?? setInternalModalOpen;
  const blockedDaysModalOpen = blockedDaysModalOpenProp ?? internalBlockedDaysModalOpen;
  const setBlockedDaysModalOpen = setBlockedDaysModalOpenProp ?? setInternalBlockedDaysModalOpen;

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const canEditEvent = useCallback((e: ScheduleEvent) => e.date >= todayStr, [todayStr]);

  // La montare, asigură-te că modalul de adăugare e închis (evită deschidere la navigare/încărcare).
  useEffect(() => {
    setModalOpen(false);
  }, []);

  useEffect(() => {
    registerOpenAddModal?.(() => {
      setViewEvent(null);
      setEditEvent(null);
      setModalOpen(true);
    });
    return () => registerOpenAddModal?.(null);
  }, [registerOpenAddModal, setModalOpen]);

  const fetchProfile = useCallback(async () => {
    const res = await fetch("/api/user/me");
    if (res.ok) {
      const data = await res.json();
      setProfile({ name: data.name, email: data.email, parentType: data.parentType ?? null });
    } else {
      setProfile(null);
    }
    setProfileLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const fetchEvents = useCallback(async () => {
    const res = await fetch("/api/events");
    if (res.ok) {
      const data = await res.json();
      setEvents(data);
    }
  }, []);

  useEffect(() => {
    const t = setInterval(fetchEvents, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [fetchEvents]);

  useEffect(() => {
    const onFocus = () => fetchEvents();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchEvents]);

  const fetchBlockedPeriods = useCallback(async () => {
    const res = await fetch("/api/blocked-days");
    if (res.ok) {
      const data = await res.json();
      setBlockedPeriods(data);
    }
  }, []);

  useEffect(() => {
    fetchBlockedPeriods();
  }, [fetchBlockedPeriods]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const handleSelectDate = useCallback(
    (date: Date) => {
      const isDeselecting = selectedDate && isSameDay(selectedDate, date);
      if (isDeselecting) {
        setViewEvent(null);
        setSelectedDate(null);
        return;
      }
      setSelectedDate(date);
      const dateStr = format(date, "yyyy-MM-dd");
      const onThatDay = events
        .filter((e) => e.date === dateStr)
        .sort((a, b) => {
          const aTime = a.startTime ?? "";
          const bTime = b.startTime ?? "";
          return aTime.localeCompare(bTime);
        });
      if (onThatDay.length > 0) {
        setViewEvent(onThatDay[0]);
        setEditEvent(null);
      }
    },
    [events, selectedDate]
  );

  const eventsForRangeOrMonth = selectedDate
    ? events.filter((e) => e.date === format(selectedDate, "yyyy-MM-dd"))
    : events.filter((e) => {
        const d = parseISO(e.date);
        return isWithinInterval(d, { start: monthStart, end: monthEnd });
      });

  const listTitle = selectedDate
    ? `Evenimente – ${format(selectedDate, "d MMM yyyy")}`
    : "Evenimente luna curentă";

  const handleSave = useCallback(
    async (
      payload: Omit<ScheduleEvent, "id" | "created_at"> & { created_by: string; endDate?: string },
      existingId?: string
    ) => {
      if (existingId) {
        const res = await fetch("/api/events", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: existingId,
            date: payload.date,
            parent: payload.parent,
            location: payload.location,
            locationLabel: payload.locationLabel ?? null,
            title: payload.title ?? null,
            notes: payload.notes ?? null,
            startTime: payload.startTime ?? null,
            endTime: payload.endTime ?? null,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          await fetchEvents();
        } else if (data.error) {
          alert(data.error);
        }
      } else {
        const start = payload.date;
        const end = payload.endDate;
        const days: string[] = [];
        if (end && end >= start) {
          let d = parseISO(start);
          const endDateParsed = parseISO(end);
          while (isBefore(d, endDateParsed) || isSameDay(d, endDateParsed)) {
            days.push(format(d, "yyyy-MM-dd"));
            d = addDays(d, 1);
            if (days.length > 365) break;
          }
        }
        if (days.length === 0) days.push(start);

        let lastError: string | null = null;
        for (const dateStr of days) {
          const res = await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date: dateStr,
              parent: payload.parent,
              location: payload.location,
              locationLabel: payload.locationLabel ?? null,
              title: payload.title ?? null,
              notes: payload.notes ?? null,
              startTime: payload.startTime ?? null,
              endTime: payload.endTime ?? null,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok && data.error) lastError = data.error;
        }
        await fetchEvents();
        if (lastError) alert(lastError);
      }
      setEditEvent(null);
    },
    [fetchEvents]
  );

  const handleDelete = useCallback(
    async (event: ScheduleEvent) => {
      if (!confirm("Ștergi acest eveniment?")) return;
      const res = await fetch(`/api/events?id=${encodeURIComponent(event.id)}`, {
        method: "DELETE",
      });
      if (res.ok) await fetchEvents();
    },
    [fetchEvents]
  );

  const selectedDateForWeek = selectedDate;

  const parentType = profile?.parentType ?? null;

  const daysThisWeekWithEvents = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const startStr = format(weekStart, "yyyy-MM-dd");
    const endStr = format(weekEnd, "yyyy-MM-dd");
    const inWeek = events.filter((e) => {
      if (e.date < startStr || e.date > endStr) return false;
      if (!parentType) return true;
      return e.parent === parentType || e.parent === "together";
    });
    return new Set(inWeek.map((e) => e.date)).size;
  }, [events, parentType]);

  const greetingName =
    parentType === "tata" ? parent1Name : parentType === "mama" ? parent2Name : capitalize(userName || "acolo");
  const daysLabel = daysThisWeekWithEvents === 1 ? "zi" : "zile";
  const greeting =
    !profileLoading && parentType != null
      ? `Salut ${greetingName}, săptămâna asta petreci ${daysThisWeekWithEvents} ${daysLabel} cu ${childName}.`
      : null;

  const setParentType = useCallback(
    async (role: ParentRole) => {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentType: role }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile((p) => (p ? { ...p, parentType: data.parentType } : { name: null, email: null, parentType: data.parentType }));
      }
    },
    []
  );

  return (
    <FamilyLabelsProvider
      parent1Name={parent1Name}
      parent2Name={parent2Name}
      childName={childName}
      residenceNames={residenceNames}
    >
    <div className="space-y-6">
      {plan === "free" && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-stone-700 dark:text-stone-300">
            Deblochează Pro: propunere automată, documente, mai mulți copii și locații.
          </p>
          <UpgradeCta variant="button" />
        </div>
      )}
      <WeeklyProposalCard onApplied={fetchEvents} />
      {!profileLoading && !parentType && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
          <p className="text-sm font-medium text-stone-800 dark:text-stone-200 mb-3">
            Ești {parent1Name} sau {parent2Name}?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setParentType("tata")}
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 active:scale-[0.98] touch-manipulation"
            >
              {parent1Name}
            </button>
            <button
              type="button"
              onClick={() => setParentType("mama")}
              className="flex-1 py-2.5 px-4 rounded-xl bg-pink-500 text-white font-medium hover:bg-pink-600 active:scale-[0.98] touch-manipulation"
            >
              {parent2Name}
            </button>
          </div>
        </div>
      )}
      {greeting && (
        <p className="text-stone-700 dark:text-stone-300 text-base font-medium leading-snug">
          {greeting}
        </p>
      )}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden">
        <button
          type="button"
          onClick={() => setCalendarExpanded((e) => !e)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-stone-50 dark:hover:bg-stone-800/50 touch-manipulation"
          aria-expanded={calendarExpanded}
        >
          <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">
            Calendar – {format(currentDate, "MMMM yyyy", { locale: ro })}
          </span>
          <svg
            className={`w-5 h-5 text-stone-500 transition-transform ${calendarExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {calendarExpanded && (
          <div className="border-t border-stone-200 dark:border-stone-700">
            <Calendar
              currentDate={currentDate}
              onMonthChange={setCurrentDate}
              events={events}
              onSelectDate={handleSelectDate}
              selectedDate={selectedDate}
              blockedPeriods={blockedPeriods}
            />
          </div>
        )}
      </div>
      <WeekSummary
        events={events}
        onSelectDay={handleSelectDate}
        selectedDate={selectedDateForWeek}
      />
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">
            {listTitle}
          </h2>
          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline touch-manipulation"
            >
              Arată luna
            </button>
          )}
        </div>
        {selectedDate ? (
          <EventList
            key={selectedDate.toISOString()}
            events={eventsForRangeOrMonth}
            onView={(e) => {
              setViewEvent(e);
              setEditEvent(null);
            }}
            onEdit={(e) => {
              setEditEvent(e);
              setViewEvent(null);
              setModalOpen(true);
            }}
            onDelete={handleDelete}
            canEditEvent={canEditEvent}
            emptyMessage="Niciun eveniment în această zi. Apasă Adaugă pentru a crea unul."
          />
        ) : (
          <MonthEventsTimeline
            key={format(currentDate, "yyyy-MM")}
            events={eventsForRangeOrMonth}
            currentDate={currentDate}
            onView={(e) => {
              setViewEvent(e);
              setEditEvent(null);
            }}
            onEdit={(e) => {
              setEditEvent(e);
              setViewEvent(null);
              setModalOpen(true);
            }}
            onDelete={handleDelete}
            canEditEvent={canEditEvent}
            onSelectDate={handleSelectDate}
            emptyMessage="Niciun eveniment în această lună."
          />
        )}
      </div>
      <EventViewModal
        isOpen={!!viewEvent}
        onClose={() => setViewEvent(null)}
        event={viewEvent}
        canEdit={viewEvent != null && viewEvent.date >= todayStr}
        blockedPeriods={blockedPeriods}
        onEdit={(e) => {
          setEditEvent(e);
          setViewEvent(null);
          setModalOpen(true);
        }}
      />
      <AddEventModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditEvent(null);
        }}
        onSave={handleSave}
        initialDate={selectedDate ?? undefined}
        editEvent={editEvent}
        currentUserId={currentUserId}
      />
      <BlockedDaysModal
        isOpen={blockedDaysModalOpen}
        onClose={() => setBlockedDaysModalOpen(false)}
        currentUserId={currentUserId}
        parentType={profile?.parentType ?? null}
        onBlockedChanged={fetchBlockedPeriods}
        plan={plan}
      />
    </div>
    </FamilyLabelsProvider>
  );
}
