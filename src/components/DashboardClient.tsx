"use client";

import { useState, useEffect, useCallback } from "react";
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, min, max, format } from "date-fns";
import { Calendar, type DateRange } from "@/components/Calendar";
import { EventList } from "@/components/EventList";
import { AddEventModal } from "@/components/AddEventModal";
import { WeekSummary } from "@/components/WeekSummary";
import type { ScheduleEvent } from "@/types/events";

const POLL_INTERVAL_MS = 15000;

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

interface DashboardClientProps {
  initialEvents: ScheduleEvent[];
  currentUserId?: string;
}

export function DashboardClient({ initialEvents, currentUserId }: DashboardClientProps) {
  const [events, setEvents] = useState<ScheduleEvent[]>(initialEvents);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<ScheduleEvent | null>(null);

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

  // Înregistrare push: SW + abonare când e autentificat
  useEffect(() => {
    if (!currentUserId || typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    let cancelled = false;
    (async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        const permission = await Notification.requestPermission();
        if (cancelled || permission !== "granted") return;
        const keyRes = await fetch("/api/push/vapid-public");
        if (!keyRes.ok) return;
        const { publicKey } = await keyRes.json();
        if (!publicKey) return;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
        if (cancelled) return;
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub.toJSON()),
        });
      } catch (_) {
        // push indisponibil sau refuzat
      }
    })();
    return () => { cancelled = true; };
  }, [currentUserId]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedRange((prev) => {
      if (!prev) return { start: date, end: date };
      const start = min([prev.start, date]);
      const end = max([prev.end, date]);
      return { start, end };
    });
  }, []);

  const eventsForRangeOrMonth = selectedRange
    ? events.filter((e) => {
        const d = e.date;
        const startStr = format(selectedRange.start, "yyyy-MM-dd");
        const endStr = format(selectedRange.end, "yyyy-MM-dd");
        return d >= startStr && d <= endStr;
      })
    : events.filter((e) => {
        const d = parseISO(e.date);
        return isWithinInterval(d, { start: monthStart, end: monthEnd });
      });

  const listTitle = selectedRange
    ? selectedRange.start.getTime() === selectedRange.end.getTime()
      ? `Evenimente – ${format(selectedRange.start, "d MMM yyyy")}`
      : `Evenimente – ${format(selectedRange.start, "d MMM")} – ${format(selectedRange.end, "d MMM yyyy")}`
    : "Evenimente luna curentă";

  const handleSave = useCallback(
    async (payload: Omit<ScheduleEvent, "id" | "created_at"> & { created_by: string }, existingId?: string) => {
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
        if (res.ok) await fetchEvents();
      } else {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
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
        if (res.ok) await fetchEvents();
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

  const selectedDateForWeek =
    selectedRange && selectedRange.start.getTime() === selectedRange.end.getTime()
      ? selectedRange.start
      : null;

  return (
    <div className="space-y-6">
      <WeekSummary
        events={events}
        onSelectDay={(date) => setSelectedRange({ start: date, end: date })}
        selectedDate={selectedDateForWeek}
      />
      <Calendar
        currentDate={currentDate}
        onMonthChange={setCurrentDate}
        events={events}
        onSelectDate={handleSelectDate}
        selectedRange={selectedRange}
        onDeselectRange={() => setSelectedRange(null)}
      />
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">
            {listTitle}
          </h2>
          <button
            type="button"
            onClick={() => {
              setEditEvent(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 active:scale-[0.98] touch-manipulation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adaugă
          </button>
        </div>
        <EventList
          events={eventsForRangeOrMonth}
          onEdit={(e) => {
            setEditEvent(e);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
          emptyMessage={
            selectedRange
              ? "Niciun eveniment în acest interval. Apasă Adaugă pentru a crea unul."
              : "Niciun eveniment în această lună."
          }
        />
      </div>
      <AddEventModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditEvent(null);
        }}
        onSave={handleSave}
        initialDate={selectedRange?.start ?? undefined}
        editEvent={editEvent}
        currentUserId={currentUserId}
      />
    </div>
  );
}
