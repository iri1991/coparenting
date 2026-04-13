"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { AppLogo } from "@/components/AppLogo";
import { DashboardClient } from "@/components/DashboardClient";
import { UpgradeCta } from "@/components/UpgradeCta";
import { MobileAppTopBar } from "@/components/MobileAppTopBar";
import { MobileQuickNav } from "@/components/MobileQuickNav";
import type { ScheduleEvent } from "@/types/events";
import type { HomeDashboardTab } from "@/lib/deep-links";
import { useLanguage } from "@/contexts/LanguageContext";
import { inter } from "@/lib/i18n/interpolate";
const ADD_MODAL_OPEN_DELAY_MS = 1200;
const CHAT_UNREAD_POLL_MS = 25000;

interface LoggedInLayoutProps {
  initialEvents: ScheduleEvent[];
  currentUserId: string;
  userName: string;
  parent1Name?: string;
  parent2Name?: string;
  childName?: string;
  childId?: string;
  residenceNames?: string[];
  initialUnreadCount?: number;
  isAdmin?: boolean;
  plan?: "free" | "pro" | "family";
  pendingPlan?: "pro" | "family";
  openAddModalOnMount?: boolean;
  openBlockedModalOnMount?: boolean;
  activityCity?: string;
  initialDashboardTab?: HomeDashboardTab;
  initialCalendarDate?: string;
}

export function LoggedInLayout({
  initialEvents,
  currentUserId,
  userName,
  parent1Name,
  parent2Name,
  childName,
  childId,
  residenceNames = ["Tunari", "Otopeni"],
  initialUnreadCount = 0,
  isAdmin = false,
  plan = "free",
  pendingPlan,
  openAddModalOnMount = false,
  openBlockedModalOnMount = false,
  activityCity,
  initialDashboardTab,
  initialCalendarDate,
}: LoggedInLayoutProps) {
  const { t } = useLanguage();
  const sh = t.app.shell;
  const dash = t.app.dashboard;
  const resolvedParent1 = parent1Name?.trim() || dash.unknownParent1;
  const resolvedParent2 = parent2Name?.trim() || dash.unknownParent2;
  const resolvedChild = childName?.trim() || dash.childDefault;

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingPlanHandled, setPendingPlanHandled] = useState(false);
  const [blockedDaysModalOpen, setBlockedDaysModalOpen] = useState(false);
  const [openAddModalFn, setOpenAddModalFn] = useState<(() => void) | null>(null);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const addModalAllowedRef = useRef(false);

  useEffect(() => {
    setModalOpen(false);
    const timer = setTimeout(() => {
      addModalAllowedRef.current = true;
    }, ADD_MODAL_OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!pendingPlan || pendingPlanHandled) return;
    setPendingPlanHandled(true);
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/stripe/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: pendingPlan, interval: "month" }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data.url) {
          if (typeof window !== "undefined" && window.history?.replaceState) {
            window.history.replaceState({}, "", window.location.pathname);
          }
          window.location.href = data.url;
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pendingPlan, pendingPlanHandled]);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/chat/unread", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data.unreadCount === "number") setUnreadCount(data.unreadCount);
      } catch {
        // ignore
      }
    };
    const interval = setInterval(poll, CHAT_UNREAD_POLL_MS);
    const onOnline = () => {
      poll();
    };
    window.addEventListener("homesplit:online", onOnline as EventListener);
    return () => {
      clearInterval(interval);
      window.removeEventListener("homesplit:online", onOnline as EventListener);
    };
  }, []);

  const registerOpenAddModal = useCallback((fn: (() => void) | null) => {
    setOpenAddModalFn(fn);
  }, []);

  const triggerAdd = useCallback(() => {
    if (!addModalAllowedRef.current) return;
    (openAddModalFn ?? (() => setModalOpen(true)))();
  }, [openAddModalFn]);

  const triggerBlocked = useCallback(() => {
    setBlockedDaysModalOpen(true);
  }, []);

  return (
    <div className="app-native-shell">
      <MobileAppTopBar onAddClick={triggerAdd} onLockClick={triggerBlocked} />

      <header className="hidden sm:block sticky top-0 z-40 px-4 pt-4">
        <div className="mx-auto max-w-5xl">
          <div className="app-native-glass flex items-center justify-between gap-4 rounded-[30px] px-4 py-3">
            <div className="flex items-center gap-3">
              <AppLogo size={38} linkToHome className="h-10 w-10" />
              <div>
                <p className="text-[15px] font-semibold tracking-tight text-stone-900">HomeSplit</p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">{sh.familySpace}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {plan === "free" && (
                <UpgradeCta variant="button" className="rounded-full px-4 py-2 text-sm" children="Upgrade" />
              )}
              <button
                type="button"
                onClick={(e) => {
                  if (!e.isTrusted || !addModalAllowedRef.current) return;
                  e.preventDefault();
                  e.stopPropagation();
                  triggerAdd();
                }}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-white shadow-[0_14px_30px_rgba(191,106,75,0.22)]"
                title={sh.addEvent}
                aria-label={sh.addEvent}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setBlockedDaysModalOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/76 text-stone-700"
                title={sh.blockedDays}
                aria-label={sh.blockedDays}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </button>
              <Link
                href="/chat"
                className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/76 text-stone-700"
                title={
                  unreadCount > 0
                    ? inter(sh.chatUnreadTitle, { n: String(unreadCount) })
                    : sh.chatWithCoparent
                }
                aria-label={
                  unreadCount > 0 ? inter(sh.chatUnreadAria, { n: String(unreadCount) }) : sh.chatLinkAria
                }
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-[#b85c3e] px-1 text-[10px] font-semibold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-full bg-white/76 px-4 py-2 text-sm font-semibold text-stone-700"
                  title="Admin"
                  aria-label="Admin"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/account"
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/76 text-stone-700"
                title={sh.accountData}
                aria-label={sh.accountData}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
              <a
                href="/api/auth/signout"
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/76 text-stone-700"
                title={sh.signOut}
                aria-label={sh.signOut}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 pb-32 pt-24 sm:pt-6">
        <div className="w-full">
          <DashboardClient
            initialEvents={initialEvents}
            currentUserId={currentUserId}
            userName={userName}
            parent1Name={resolvedParent1}
            parent2Name={resolvedParent2}
            childName={resolvedChild}
            childId={childId}
            residenceNames={residenceNames}
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
            blockedDaysModalOpen={blockedDaysModalOpen}
            setBlockedDaysModalOpen={setBlockedDaysModalOpen}
            registerOpenAddModal={registerOpenAddModal}
            plan={plan}
            openAddModalOnMount={openAddModalOnMount}
            openBlockedModalOnMount={openBlockedModalOnMount}
            activityCity={activityCity}
            initialDashboardTab={initialDashboardTab}
            initialCalendarDate={initialCalendarDate}
          />
        </div>
      </main>

      <MobileQuickNav />
    </div>
  );
}
