"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, min, max, format } from "date-fns";
import { Calendar, type DateRange } from "@/components/Calendar";
import { EventList } from "@/components/EventList";
import { AddEventModal } from "@/components/AddEventModal";
import { WeekSummary } from "@/components/WeekSummary";
import { BlockedPeriodsSection } from "@/components/BlockedPeriodsSection";
import { AddBlockedPeriodModal } from "@/components/AddBlockedPeriodModal";
import type { ScheduleEvent } from "@/types/events";
import { PARENT_LABELS } from "@/types/events";
import type { BlockedPeriod } from "@/types/blocked";
import { Bell, BellOff } from "lucide-react";

const POLL_INTERVAL_MS = 15000;

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

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
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function DashboardClient({ initialEvents, currentUserId, userName }: DashboardClientProps) {
  const [events, setEvents] = useState<ScheduleEvent[]>(initialEvents);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<ScheduleEvent | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [pushStatus, setPushStatus] = useState<"idle" | "loading" | "enabled" | "unsupported" | "denied" | "error">("idle");
  const [pushMessage, setPushMessage] = useState<string | null>(null);
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockListRefreshKey, setBlockListRefreshKey] = useState(0);

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

  // Stare inițială notificări (fără popup – popup-ul se afișează doar la click)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setPushStatus("unsupported");
      return;
    }
    if (Notification.permission === "granted") {
      setPushStatus("enabled");
    } else if (Notification.permission === "denied") {
      setPushStatus("denied");
    } else {
      setPushStatus("idle");
    }
  }, []);

  const enablePush = useCallback(async () => {
    if (!currentUserId) return;
    setPushStatus("loading");
    setPushMessage(null);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushStatus(permission === "denied" ? "denied" : "idle");
        if (permission === "denied") setPushMessage("Ai refuzat notificările.");
        return;
      }
      const keyRes = await fetch("/api/push/vapid-public");
      if (!keyRes.ok) {
        setPushStatus("error");
        setPushMessage("Notificările nu sunt configurate pe server.");
        return;
      }
      const { publicKey } = await keyRes.json();
      if (!publicKey) {
        setPushStatus("error");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
      const subscribeRes = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!subscribeRes.ok) {
        setPushStatus("error");
        setPushMessage("Nu s-a putut salva abonamentul.");
        return;
      }
      // Trimite o notificare de test imediat ca să confirme că merge
      await fetch("/api/push/test", { method: "POST" });
      setPushStatus("enabled");
      setPushMessage("Notificări activate.");
    } catch (e) {
      setPushStatus("error");
      setPushMessage(e instanceof Error ? e.message : "Eroare la activare.");
    }
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
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          await fetchEvents();
        } else if (data.error) {
          alert(data.error);
        }
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
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          await fetchEvents();
        } else if (data.error) {
          alert(data.error);
        }
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
    parentType != null ? PARENT_LABELS[parentType] : capitalize(userName || "acolo");
  const daysLabel = daysThisWeekWithEvents === 1 ? "zi" : "zile";
  const greeting =
    !profileLoading && parentType != null
      ? `Salut ${greetingName}, săptămâna asta petreci ${daysThisWeekWithEvents} ${daysLabel} cu Eva.`
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
    <div className="space-y-6">
      {/* Zonă notificări – vizibilă și cu buton la click (user gesture) pentru popup */}
      {pushStatus !== "unsupported" && (
        <div className="rounded-2xl bg-stone-100 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 p-4">
          <div className="flex items-center gap-3">
            {pushStatus === "enabled" ? (
              <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" aria-hidden />
            ) : (
              <BellOff className="w-5 h-5 text-stone-400 dark:text-stone-500 flex-shrink-0" aria-hidden />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                {pushStatus === "enabled" && "Notificări activate"}
                {pushStatus === "idle" && "Primești alerte pentru evenimente noi și reminder seara."}
                {pushStatus === "loading" && "Se activează notificările…"}
                {pushStatus === "denied" && "Notificări dezactivate. Poți permite în setările browserului."}
                {pushStatus === "error" && (pushMessage || "Notificări indisponibile.")}
              </p>
              {pushMessage && pushStatus === "enabled" && (
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{pushMessage}</p>
              )}
            </div>
            {pushStatus === "idle" && (
              <button
                type="button"
                onClick={enablePush}
                className="flex-shrink-0 py-2 px-4 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 active:scale-[0.98] touch-manipulation"
              >
                Activează notificări
              </button>
            )}
            {pushStatus === "denied" && (
              <span className="text-xs text-stone-400 dark:text-stone-500 flex-shrink-0">
                Setări → Site-uri → Notificări
              </span>
            )}
            {pushStatus === "error" && (
              <button
                type="button"
                onClick={enablePush}
                className="flex-shrink-0 py-2 px-4 rounded-xl border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800 touch-manipulation"
              >
                Încearcă din nou
              </button>
            )}
            {pushStatus === "enabled" && (
              <span className="text-xs text-amber-600 dark:text-amber-400 flex-shrink-0">✓</span>
            )}
          </div>
        </div>
      )}

      {!profileLoading && !parentType && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
          <p className="text-sm font-medium text-stone-800 dark:text-stone-200 mb-3">
            Ești Irinel sau Andreea?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setParentType("tata")}
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 active:scale-[0.98] touch-manipulation"
            >
              Irinel
            </button>
            <button
              type="button"
              onClick={() => setParentType("mama")}
              className="flex-1 py-2.5 px-4 rounded-xl bg-pink-500 text-white font-medium hover:bg-pink-600 active:scale-[0.98] touch-manipulation"
            >
              Andreea
            </button>
          </div>
        </div>
      )}
      {greeting && (
        <p className="text-stone-700 dark:text-stone-300 text-base font-medium leading-snug">
          {greeting}
        </p>
      )}
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
        blockedPeriods={blockedPeriods}
      />
      <BlockedPeriodsSection
        key={blockListRefreshKey}
        onAddClick={() => setBlockModalOpen(true)}
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
      <AddBlockedPeriodModal
        isOpen={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        onSaved={() => {
          setBlockListRefreshKey((k) => k + 1);
          fetchBlockedPeriods();
        }}
      />
    </div>
  );
}
