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
import { EndOfPeriodActivitiesModal } from "@/components/EndOfPeriodActivitiesModal";
import { ActivityRecommendationsTab } from "@/components/ActivityRecommendationsTab";
import type { ChildActivityEntry, UsefulLinkEntry } from "@/types/child-activity";
import type { WeekProposal } from "@/types/proposal";
import { SharedRitualsCard } from "@/components/SharedRitualsCard";
import type { HomeDashboardTab } from "@/lib/deep-links";
import { CalendarRange, LockKeyhole, Sparkles } from "lucide-react";

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
  /** Din URL `/?add=1` sau `/?blocked=1` */
  openAddModalOnMount?: boolean;
  openBlockedModalOnMount?: boolean;
  /** Oraș din familie pentru sugestii AI (fallback fără GPS). */
  activityCity?: string;
  /** Din `/?tab=` (deep link notificări). */
  initialDashboardTab?: HomeDashboardTab;
  /** Din `/?date=` — focalizare calendar pe acea zi. */
  initialCalendarDate?: string;
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
  openAddModalOnMount = false,
  openBlockedModalOnMount = false,
  activityCity,
  initialDashboardTab,
  initialCalendarDate,
}: DashboardClientProps) {
  function parseYmdLocal(ymd: string | undefined): Date | null {
    if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const initialCalDate = parseYmdLocal(initialCalendarDate);
  const resolvedInitialTab = initialDashboardTab ?? "program";

  const [events, setEvents] = useState<ScheduleEvent[]>(initialEvents);
  const [currentDate, setCurrentDate] = useState(() => initialCalDate ?? new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => initialCalDate);
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<ScheduleEvent | null>(null);
  const [viewEvent, setViewEvent] = useState<ScheduleEvent | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);
  const [internalBlockedDaysModalOpen, setInternalBlockedDaysModalOpen] = useState(false);
  const [calendarExpanded, setCalendarExpanded] = useState(
    () => Boolean(initialCalDate && resolvedInitialTab === "program")
  );
  const [activities, setActivities] = useState<ChildActivityEntry[]>([]);
  const [activityCatalog, setActivityCatalog] = useState<string[]>([]);
  const [usefulLinks, setUsefulLinks] = useState<UsefulLinkEntry[]>([]);
  const [showEndPeriodModal, setShowEndPeriodModal] = useState(false);
  const [activityModalDate, setActivityModalDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [retroActivityDate, setRetroActivityDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkCategory, setNewLinkCategory] = useState("");
  const [linksSaving, setLinksSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<HomeDashboardTab>(resolvedInitialTab);
  const [interruptModalOpen, setInterruptModalOpen] = useState(false);
  const [interruptTarget, setInterruptTarget] = useState<"otherParent" | "someoneElse">("otherParent");
  const [interruptCaretaker, setInterruptCaretaker] = useState("");
  const [interruptUntilDate, setInterruptUntilDate] = useState("");
  const [interruptSaving, setInterruptSaving] = useState(false);
  const [proposalPreviewDays, setProposalPreviewDays] = useState<WeekProposal["days"]>([]);
  const [proposalWeekLabel, setProposalWeekLabel] = useState<string | null>(null);
  const [showProposalPreview, setShowProposalPreview] = useState(true);

  const modalOpen = modalOpenProp ?? internalModalOpen;
  const setModalOpen = setModalOpenProp ?? setInternalModalOpen;
  const blockedDaysModalOpen = blockedDaysModalOpenProp ?? internalBlockedDaysModalOpen;
  const setBlockedDaysModalOpen = setBlockedDaysModalOpenProp ?? setInternalBlockedDaysModalOpen;

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const canEditEvent = useCallback((e: ScheduleEvent) => e.date >= todayStr, [todayStr]);

  // La montare: închide modalele dacă nu vin din URL (?add=1 / ?blocked=1).
  useEffect(() => {
    if (!openAddModalOnMount && !openBlockedModalOnMount) {
      setModalOpen(false);
    }
  }, [openAddModalOnMount, openBlockedModalOnMount]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (openAddModalOnMount) {
      setModalOpen(true);
      window.history.replaceState({}, "", "/");
      return;
    }
    if (openBlockedModalOnMount) {
      setBlockedDaysModalOpen(true);
      window.history.replaceState({}, "", "/");
    }
  }, [openAddModalOnMount, openBlockedModalOnMount]);

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

  const fetchActivities = useCallback(async () => {
    const res = await fetch("/api/child-activities");
    if (!res.ok) return;
    const data = await res.json().catch(() => ({}));
    setActivities(Array.isArray(data.entries) ? data.entries : []);
    setActivityCatalog(Array.isArray(data.activityCatalog) ? data.activityCatalog : []);
  }, []);

  const fetchUsefulLinks = useCallback(async () => {
    const res = await fetch("/api/useful-links");
    if (!res.ok) return;
    const data = await res.json().catch(() => ({}));
    setUsefulLinks(Array.isArray(data.links) ? data.links : []);
  }, []);

  useEffect(() => {
    const onOnline = () => {
      fetchEvents();
      fetchBlockedPeriods();
      fetchActivities();
      fetchUsefulLinks();
    };
    window.addEventListener("homesplit:online", onOnline as EventListener);
    return () => window.removeEventListener("homesplit:online", onOnline as EventListener);
  }, [fetchEvents, fetchBlockedPeriods, fetchActivities, fetchUsefulLinks]);

  useEffect(() => {
    fetchBlockedPeriods();
  }, [fetchBlockedPeriods]);

  useEffect(() => {
    fetchActivities();
    fetchUsefulLinks();
  }, [fetchActivities, fetchUsefulLinks]);

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
      payload: Omit<ScheduleEvent, "id" | "created_at"> & {
        created_by: string;
        endDate?: string;
        allowPastEdit?: boolean;
        pastEditReason?: string;
      },
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
            allowPastEdit: payload.allowPastEdit ?? false,
            pastEditReason: payload.pastEditReason ?? null,
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

  const parentTimeReport = useMemo(() => {
    const monthStartStr = format(startOfMonth(currentDate), "yyyy-MM-dd");
    const monthEndStr = format(endOfMonth(currentDate), "yyyy-MM-dd");

    const dayOwner = new Map<string, "tata" | "mama" | "together">();
    const sorted = [...events].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.startTime ?? "").localeCompare(b.startTime ?? "");
    });
    for (const e of sorted) {
      if (e.date < monthStartStr || e.date > monthEndStr) continue;
      if (!dayOwner.has(e.date)) dayOwner.set(e.date, e.parent);
    }

    let tataDays = 0;
    let mamaDays = 0;
    let togetherDays = 0;
    for (const owner of dayOwner.values()) {
      if (owner === "tata") tataDays += 1;
      else if (owner === "mama") mamaDays += 1;
      else togetherDays += 1;
    }

    const totalTrackedDays = tataDays + mamaDays + togetherDays;
    const tataWeighted = tataDays + togetherDays * 0.5;
    const mamaWeighted = mamaDays + togetherDays * 0.5;
    const tataPct = totalTrackedDays > 0 ? Math.round((tataWeighted / totalTrackedDays) * 100) : 0;
    const mamaPct = totalTrackedDays > 0 ? Math.round((mamaWeighted / totalTrackedDays) * 100) : 0;

    return {
      monthLabel: format(currentDate, "MMMM yyyy", { locale: ro }),
      tataDays,
      mamaDays,
      togetherDays,
      totalTrackedDays,
      tataPct,
      mamaPct,
    };
  }, [events, currentDate]);

  const greetingName =
    parentType === "tata" ? parent1Name : parentType === "mama" ? parent2Name : capitalize(userName || "acolo");
  const daysLabel = daysThisWeekWithEvents === 1 ? "zi" : "zile";
  const greeting =
    !profileLoading && parentType != null
      ? `Salut ${greetingName}, săptămâna asta petreci ${daysThisWeekWithEvents} ${daysLabel} cu ${childName}.`
      : null;

  const todayEventForLoggedParent = useMemo(() => {
    if (!parentType) return null;
    const todayEvent = events.find((e) => e.date === todayStr);
    if (!todayEvent) return null;
    if (todayEvent.parent !== parentType) return null;
    return todayEvent;
  }, [events, parentType, todayStr]);

  const currentParentPeriod = useMemo(() => {
    if (!todayEventForLoggedParent) return null;
    const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
    const todayIdx = sorted.findIndex((e) => e.date === todayStr && e.parent === todayEventForLoggedParent.parent);
    if (todayIdx === -1) return null;
    let endIdx = todayIdx;
    while (endIdx + 1 < sorted.length && sorted[endIdx + 1].parent === todayEventForLoggedParent.parent) {
      endIdx += 1;
    }
    return {
      startDate: sorted[todayIdx].date,
      endDate: sorted[endIdx].date,
      sourceParent: todayEventForLoggedParent.parent,
      eventIds: sorted
        .slice(todayIdx, endIdx + 1)
        .filter((e) => e.parent === todayEventForLoggedParent.parent)
        .map((e) => e.id),
    };
  }, [events, todayEventForLoggedParent, todayStr]);

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

  const handoverEndedYesterday = useMemo(() => {
    if (!parentType || events.length === 0) return null;
    const today = new Date();
    const yesterday = addDays(today, -1);
    const todayStrLocal = format(today, "yyyy-MM-dd");
    const yesterdayStr = format(yesterday, "yyyy-MM-dd");
    const todayEvent = events.find((e) => e.date === todayStrLocal);
    const yesterdayEvent = events.find((e) => e.date === yesterdayStr);
    if (!todayEvent || !yesterdayEvent) return null;
    if (yesterdayEvent.parent === parentType && todayEvent.parent !== parentType) {
      return yesterdayStr;
    }
    return null;
  }, [events, parentType]);

  useEffect(() => {
    if (!handoverEndedYesterday || !parentType) return;
    const key = `end-period-logged:${parentType}:${handoverEndedYesterday}`;
    if (localStorage.getItem(key) === "1") return;
    setActivityModalDate(handoverEndedYesterday);
    setShowEndPeriodModal(true);
  }, [handoverEndedYesterday, parentType]);

  const activitiesSummary = useMemo(() => {
    const m = new Map<string, { count: number; lastDate: string }>();
    for (const a of activities) {
      const key = a.activityName.toLowerCase().trim();
      const prev = m.get(key);
      if (!prev) m.set(key, { count: 1, lastDate: a.periodEndDate });
      else m.set(key, { count: prev.count + 1, lastDate: prev.lastDate > a.periodEndDate ? prev.lastDate : a.periodEndDate });
    }
    return Array.from(m.entries())
      .map(([k, v]) => ({ name: k, count: v.count, lastDate: v.lastDate }))
      .sort((a, b) => b.lastDate.localeCompare(a.lastDate));
  }, [activities]);

  async function handleSaveLink() {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    setLinksSaving(true);
    try {
      const res = await fetch("/api/useful-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newLinkTitle.trim(),
          url: newLinkUrl.trim(),
          category: newLinkCategory.trim(),
        }),
      });
      if (res.ok) {
        setNewLinkTitle("");
        setNewLinkUrl("");
        setNewLinkCategory("");
        await fetchUsefulLinks();
      }
    } finally {
      setLinksSaving(false);
    }
  }

  async function handleDeleteLink(id: string) {
    if (!confirm("Ștergi acest link?")) return;
    const res = await fetch(`/api/useful-links?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) fetchUsefulLinks();
  }

  function openRetroActivityModal() {
    if (!retroActivityDate) return;
    setActivityModalDate(retroActivityDate);
    setShowEndPeriodModal(true);
  }

  function openInterruptModal() {
    if (!currentParentPeriod) return;
    setInterruptTarget("otherParent");
    setInterruptCaretaker("");
    setInterruptUntilDate(currentParentPeriod.endDate);
    setInterruptModalOpen(true);
  }

  async function handleInterruptPeriod() {
    if (!currentParentPeriod || !parentType || !interruptUntilDate) return;
    if (interruptTarget === "someoneElse" && !interruptCaretaker.trim()) {
      alert("Completează cine preia copilul.");
      return;
    }
    setInterruptSaving(true);
    try {
      const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
      const toUpdate = sorted.filter(
        (e) =>
          currentParentPeriod.eventIds.includes(e.id) &&
          e.date >= currentParentPeriod.startDate &&
          e.date <= interruptUntilDate
      );
      for (const ev of toUpdate) {
        const payload =
          interruptTarget === "otherParent"
            ? {
                id: ev.id,
                date: ev.date,
                parent: parentType === "tata" ? "mama" : "tata",
                location: parentType === "tata" ? "otopeni" : "tunari",
                locationLabel: null,
                title: ev.title ?? null,
                notes: ev.notes ?? null,
                startTime: ev.startTime ?? null,
                endTime: ev.endTime ?? null,
              }
            : {
                id: ev.id,
                date: ev.date,
                parent: "together",
                location: "other",
                locationLabel: interruptCaretaker.trim(),
                title: ev.title ?? null,
                notes: ev.notes ?? null,
                startTime: ev.startTime ?? null,
                endTime: ev.endTime ?? null,
              };
        const res = await fetch("/api/events", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(data.error || "Nu s-a putut întrerupe perioada.");
          return;
        }
      }
      await fetchEvents();
      setInterruptModalOpen(false);
    } finally {
      setInterruptSaving(false);
    }
  }

  return (
    <FamilyLabelsProvider
      parent1Name={parent1Name}
      parent2Name={parent2Name}
      childName={childName}
      residenceNames={residenceNames}
    >
    <div className="space-y-5">
      {plan === "free" && (
        <div className="app-native-surface rounded-[2rem] border-[#ecd8c5] bg-[linear-gradient(135deg,rgba(255,243,231,0.92)_0%,rgba(255,251,247,0.82)_100%)] px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b85c3e]">Plan Free</p>
            <p className="mt-1 text-sm text-stone-700">
            Deblochează Pro: propunere automată, documente, mai mulți copii și locații.
            </p>
          </div>
          <UpgradeCta variant="button" />
        </div>
      )}
      {!profileLoading && parentType && activeTab === "program" && (
        <div className="app-native-surface-strong overflow-hidden rounded-[2.3rem] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/72 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                <Sparkles className="h-3.5 w-3.5 text-[#b85c3e]" />
                experiență nativă pentru programul familiei
              </div>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-stone-900 sm:text-[2rem]">
                {greeting ?? `Salut ${greetingName}.`}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-7 text-stone-600">
                Ai într-un singur loc programul, schimbările, rutinele și semnalele importante pentru {childName}.
              </p>
            </div>
            {todayEventForLoggedParent && currentParentPeriod && (
              <button
                type="button"
                onClick={openInterruptModal}
                className="inline-flex items-center rounded-full bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(191,106,75,0.22)]"
              >
                Întrerupe perioada
              </button>
            )}
          </div>
        </div>
      )}
      <div
        className="app-native-surface rounded-[2rem] p-1.5 grid grid-cols-4 gap-1"
        role="tablist"
        aria-label="Secțiuni acasă"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "program"}
          onClick={() => setActiveTab("program")}
          className={`rounded-[1.1rem] py-2.5 px-1 text-[11px] sm:text-sm font-semibold transition ${
            activeTab === "program"
              ? "bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-white shadow-[0_12px_22px_rgba(191,106,75,0.2)]"
              : "text-stone-600 hover:bg-white/80"
          }`}
        >
          Program
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "rutine"}
          onClick={() => setActiveTab("rutine")}
          className={`rounded-[1.1rem] py-2.5 px-1 text-[11px] sm:text-sm font-semibold transition ${
            activeTab === "rutine"
              ? "bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-white shadow-[0_12px_22px_rgba(191,106,75,0.2)]"
              : "text-stone-600 hover:bg-white/80"
          }`}
          title="Ritualuri comune și raport"
        >
          Rutine
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "hub"}
          onClick={() => setActiveTab("hub")}
          className={`rounded-[1.1rem] py-2.5 px-1 text-[11px] sm:text-sm font-semibold transition ${
            activeTab === "hub"
              ? "bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-white shadow-[0_12px_22px_rgba(191,106,75,0.2)]"
              : "text-stone-600 hover:bg-white/80"
          }`}
          title="Rapoarte și resurse"
        >
          <span className="sm:hidden">Rapoarte</span>
          <span className="hidden sm:inline">Rapoarte & resurse</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "idei"}
          onClick={() => setActiveTab("idei")}
          className={`rounded-[1.1rem] py-2.5 px-1 text-[11px] sm:text-sm font-semibold transition ${
            activeTab === "idei"
              ? "bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-white shadow-[0_12px_22px_rgba(191,106,75,0.2)]"
              : "text-stone-600 hover:bg-white/80"
          }`}
          title="Recomandări AI"
        >
          Idei
        </button>
      </div>
      {activeTab === "hub" && (
        <WeeklyProposalCard
          onApplied={fetchEvents}
          onProposalLoaded={(proposal, weekLabel) => {
            setProposalPreviewDays(proposal?.days ?? []);
            setProposalWeekLabel(weekLabel ?? null);
            if (!proposal) setShowProposalPreview(false);
            if (proposal) setShowProposalPreview(true);
          }}
        />
      )}
      {activeTab === "hub" && !profileLoading && parentType && (
      <section className="app-native-surface rounded-[2rem] p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Panou rapid</p>
            <h2 className="text-base font-semibold text-stone-800">Indicatori utili</h2>
          </div>
          <span className="text-xs text-stone-500">mutați din ecranul principal</span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-3">
          <div className="rounded-[1.35rem] bg-white/80 px-3 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#fff3e7] text-[#b85c3e]">
                <CalendarRange className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Săptămâna ta</p>
                <p className="text-lg font-semibold text-stone-900">{daysThisWeekWithEvents}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-stone-600">{daysLabel} cu timp programat</p>
          </div>
          <div className="rounded-[1.35rem] bg-white/80 px-3 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#f8e4da] text-[#b96a4b]">
                <Sparkles className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Memorie comună</p>
                <p className="text-lg font-semibold text-stone-900">{activitiesSummary.length}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-stone-600">activități distincte deja în jurnal</p>
          </div>
          <div className="rounded-[1.35rem] bg-white/80 px-3 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#f7f0e7] text-[#8a6330]">
                <LockKeyhole className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">Disponibilitate</p>
                <p className="text-lg font-semibold text-stone-900">{blockedPeriods.length}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-stone-600">intervale blocate configurate</p>
          </div>
        </div>
      </section>
      )}
      {!profileLoading && !parentType && (
        <div className="app-native-surface rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,243,231,0.92)_0%,rgba(255,251,247,0.82)_100%)] p-4">
          <p className="text-sm font-semibold text-stone-800 mb-3">
            Ești {parent1Name} sau {parent2Name}?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setParentType("tata")}
              className="flex-1 rounded-[1.2rem] bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_26px_rgba(191,106,75,0.2)]"
            >
              {parent1Name}
            </button>
            <button
              type="button"
              onClick={() => setParentType("mama")}
              className="flex-1 rounded-[1.2rem] bg-white px-4 py-3 text-sm font-semibold text-stone-800 shadow-[0_12px_24px_rgba(28,25,23,0.08)]"
            >
              {parent2Name}
            </button>
          </div>
        </div>
      )}
      {activeTab === "rutine" && (
        <SharedRitualsCard parent1Name={parent1Name} parent2Name={parent2Name} />
      )}
      {activeTab === "idei" && !profileLoading && parentType && (
        <ActivityRecommendationsTab activityCity={activityCity} onActivityLogged={fetchActivities} />
      )}
      {activeTab === "hub" && (
      <section className="app-native-surface rounded-[2rem] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 className="text-base font-semibold text-stone-800">Raport timp între părinți</h2>
          <span className="text-xs text-stone-500 capitalize">{parentTimeReport.monthLabel}</span>
        </div>
        {parentTimeReport.totalTrackedDays === 0 ? (
          <p className="text-sm text-stone-500">
            Nu există încă zile planificate în luna selectată.
          </p>
        ) : (
          <>
            <div className="mb-3 h-3 w-full overflow-hidden rounded-full bg-stone-100">
              <div className="float-left h-full bg-[#cb7757]" style={{ width: `${parentTimeReport.tataPct}%` }} />
              <div className="float-left h-full bg-[#e5b18d]" style={{ width: `${parentTimeReport.mamaPct}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-[1.3rem] bg-white/82 px-3 py-3">
                <p className="text-stone-500">Timp {parent1Name}</p>
                <p className="font-semibold text-stone-800">
                  {parentTimeReport.tataDays} zile
                  <span className="font-medium text-stone-500"> · {parentTimeReport.tataPct}%</span>
                </p>
              </div>
              <div className="rounded-[1.3rem] bg-white/82 px-3 py-3">
                <p className="text-stone-500">Timp {parent2Name}</p>
                <p className="font-semibold text-stone-800">
                  {parentTimeReport.mamaDays} zile
                  <span className="font-medium text-stone-500"> · {parentTimeReport.mamaPct}%</span>
                </p>
              </div>
            </div>
            {parentTimeReport.togetherDays > 0 && (
              <p className="mt-2 text-xs text-stone-500">
                Zile „cu toții”: {parentTimeReport.togetherDays} (împărțite 50/50 în procente).
              </p>
            )}
          </>
        )}
      </section>
      )}
      {activeTab === "program" && (
      <div className="app-native-surface overflow-hidden rounded-[2rem]">
        {proposalPreviewDays.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ecd8c5] bg-[#fff5eb] px-4 py-3">
            <div>
              <p className="text-xs font-medium text-[#9f5a40]">
                Preview propunere în calendar
              </p>
              {proposalWeekLabel && (
                <p className="text-[11px] text-[#b86a4b]">{proposalWeekLabel}</p>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 rounded bg-[#f6ddd2] px-1.5 py-0.5 text-[#b66347]">
                  {parent1Name.charAt(0).toUpperCase()} · {parent1Name}
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-[#fde9d6] px-1.5 py-0.5 text-[#a56a3d]">
                  {parent2Name.charAt(0).toUpperCase()} · {parent2Name}
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-amber-700">
                  Î · Cu toții
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowProposalPreview((v) => !v)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                showProposalPreview
                  ? "bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-white border-[#bf6a4b]"
                  : "bg-white text-stone-700 border-[#d7c3af]"
              }`}
            >
              {showProposalPreview ? "Ascunde preview" : "Arată preview"}
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCalendarExpanded((e) => !e)}
          className="w-full flex items-center justify-between gap-2 px-4 py-4 text-left hover:bg-white/40 touch-manipulation"
          aria-expanded={calendarExpanded}
        >
          <span className="text-sm font-semibold text-stone-800">
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
          <div className="border-t border-[#ead9c8]">
            <Calendar
              currentDate={currentDate}
              onMonthChange={setCurrentDate}
              events={events}
              onSelectDate={handleSelectDate}
              selectedDate={selectedDate}
              blockedPeriods={blockedPeriods}
              proposalPreviewDays={showProposalPreview ? proposalPreviewDays : []}
            />
          </div>
        )}
      </div>
      )}
      {activeTab === "program" && (
      <WeekSummary
        events={events}
        onSelectDay={handleSelectDate}
        selectedDate={selectedDateForWeek}
      />
      )}
      {activeTab === "hub" && (
      <section className="app-native-surface rounded-[2rem] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 className="text-base font-semibold text-stone-800">Activități făcute de copil</h2>
          {handoverEndedYesterday && (
            <button
              type="button"
              onClick={() => setShowEndPeriodModal(true)}
              className="text-sm text-amber-700 font-medium hover:underline"
            >
              Adaugă activitate
            </button>
          )}
        </div>
        <p className="text-xs text-stone-500 mb-3">
          Listă cumulată din perioadele anterioare, ca să evitați repetarea acelorași activități.
        </p>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <input
            type="date"
            max={todayStr}
            value={retroActivityDate}
            onChange={(e) => setRetroActivityDate(e.target.value)}
            className="app-native-input px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={openRetroActivityModal}
            className="app-native-secondary-button px-4 py-2.5 text-sm font-semibold text-stone-700"
          >
            Adaugă retroactiv
          </button>
        </div>
        {activitiesSummary.length === 0 ? (
          <p className="text-sm text-stone-500">Nu există activități înregistrate încă.</p>
        ) : (
          <ul className="space-y-2">
            {activitiesSummary.map((a) => (
              <li key={a.name} className="rounded-[1.3rem] bg-white/82 border border-white/70 px-3 py-3">
                <p className="text-sm font-medium text-stone-800 capitalize">{a.name}</p>
                <p className="text-xs text-stone-500">
                  de {a.count} ori · ultima dată: {new Date(a.lastDate + "T12:00:00").toLocaleDateString("ro-RO")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
      )}
      {activeTab === "hub" && (
      <section className="app-native-surface rounded-[2rem] p-4 sm:p-5">
        <h2 className="text-base font-semibold text-stone-800 mb-2">Materiale utile</h2>
        <p className="text-xs text-stone-500 mb-3">
          Link-uri utile pentru continuitate între părinți (melodii, clipuri, cărți etc.).
        </p>
        <div className="grid gap-2 sm:grid-cols-3 mb-3">
          <input
            type="text"
            value={newLinkTitle}
            onChange={(e) => setNewLinkTitle(e.target.value)}
            placeholder="Titlu"
            className="app-native-input px-3 py-2 text-sm"
          />
          <input
            type="url"
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            placeholder="https://..."
            className="app-native-input px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={newLinkCategory}
            onChange={(e) => setNewLinkCategory(e.target.value)}
            placeholder="Categorie (opțional)"
            className="app-native-input px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={handleSaveLink}
          disabled={linksSaving || !newLinkTitle.trim() || !newLinkUrl.trim()}
          className="app-native-primary-button mb-3 px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {linksSaving ? "Se salvează..." : "Adaugă link"}
        </button>
        {usefulLinks.length === 0 ? (
          <p className="text-sm text-stone-500">Nu există materiale utile încă.</p>
        ) : (
          <ul className="space-y-2">
            {usefulLinks.map((l) => (
              <li key={l.id} className="rounded-[1.3rem] bg-white/82 border border-white/70 px-3 py-3 flex items-start justify-between gap-2">
                <div>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#b66347] hover:underline">
                    {l.title}
                  </a>
                  {l.category && <p className="text-xs text-stone-500">{l.category}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteLink(l.id)}
                  className="text-xs text-stone-500 hover:text-red-600"
                >
                  Șterge
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      )}
      {activeTab === "program" && (
      <section className="app-native-surface rounded-[2rem] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Calendar extins</p>
            <h2 className="text-base font-semibold text-stone-800">
            {listTitle}
            </h2>
          </div>
          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="app-native-secondary-button px-4 py-2 text-sm font-semibold text-stone-700 touch-manipulation"
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
      </section>
      )}
      <EventViewModal
        isOpen={!!viewEvent}
        onClose={() => setViewEvent(null)}
        event={viewEvent}
        canEdit={viewEvent != null}
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
      <EndOfPeriodActivitiesModal
        isOpen={showEndPeriodModal}
        onClose={() => setShowEndPeriodModal(false)}
        periodEndDate={activityModalDate}
        activityCatalog={activityCatalog}
        onSaved={async () => {
          await fetchActivities();
          if (parentType && activityModalDate) {
            localStorage.setItem(`end-period-logged:${parentType}:${activityModalDate}`, "1");
          }
        }}
      />
      {interruptModalOpen && currentParentPeriod && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setInterruptModalOpen(false)}
        >
          <div
            className="app-native-surface-strong w-full max-w-md rounded-[2rem] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400 mb-1">Situație excepțională</p>
            <h3 className="text-base font-semibold text-stone-900 mb-1">
              Întrerupe perioada curentă
            </h3>
            <p className="text-sm text-stone-500 mb-3">
              Aplicăm schimbarea din {new Date(currentParentPeriod.startDate + "T12:00:00").toLocaleDateString("ro-RO")} până la:
            </p>
            <input
              type="date"
              value={interruptUntilDate}
              min={currentParentPeriod.startDate}
              max={currentParentPeriod.endDate}
              onChange={(e) => setInterruptUntilDate(e.target.value)}
              className="app-native-input mb-3 w-full px-3 py-2 text-sm"
            />

            <div className="space-y-2 mb-3">
              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input
                  type="radio"
                  name="interrupt-target"
                  checked={interruptTarget === "otherParent"}
                  onChange={() => setInterruptTarget("otherParent")}
                />
                Preia celălalt părinte
              </label>
              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input
                  type="radio"
                  name="interrupt-target"
                  checked={interruptTarget === "someoneElse"}
                  onChange={() => setInterruptTarget("someoneElse")}
                />
                Preia altcineva (ex. bunici / bonă)
              </label>
            </div>
            {interruptTarget === "someoneElse" && (
              <input
                type="text"
                value={interruptCaretaker}
                onChange={(e) => setInterruptCaretaker(e.target.value)}
                placeholder="Cine preia copilul?"
                className="app-native-input mb-3 w-full px-3 py-2 text-sm"
              />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setInterruptModalOpen(false)}
                className="app-native-secondary-button flex-1 px-4 py-2.5 text-sm font-semibold text-stone-700"
              >
                Renunță
              </button>
              <button
                type="button"
                onClick={handleInterruptPeriod}
                disabled={interruptSaving}
                className="app-native-primary-button flex-1 px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                {interruptSaving ? "Se aplică..." : "Aplică"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </FamilyLabelsProvider>
  );
}
