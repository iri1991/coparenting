"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { AppLogo } from "@/components/AppLogo";
import { DashboardClient } from "@/components/DashboardClient";
import { UpgradeCta } from "@/components/UpgradeCta";
import type { ScheduleEvent } from "@/types/events";

/** Modalul de adăugare se deschide doar după acest delay de la mount (evită deschidere la încărcare). */
const ADD_MODAL_OPEN_DELAY_MS = 1200;

const CHAT_UNREAD_POLL_MS = 25000;

interface LoggedInLayoutProps {
  initialEvents: ScheduleEvent[];
  currentUserId: string;
  userName: string;
  parent1Name?: string;
  parent2Name?: string;
  childName?: string;
  residenceNames?: string[];
  initialUnreadCount?: number;
  isAdmin?: boolean;
  /** Plan familie: free | pro | family. Pentru afișare link Upgrade în header. */
  plan?: "free" | "pro" | "family";
  /** După înregistrare + setup din landing cu plan plătit: deschide checkout. */
  pendingPlan?: "pro" | "family";
}

export function LoggedInLayout({
  initialEvents,
  currentUserId,
  userName,
  parent1Name = "Părinte 1",
  parent2Name = "Părinte 2",
  childName = "copilul",
  residenceNames = ["Tunari", "Otopeni"],
  initialUnreadCount = 0,
  isAdmin = false,
  plan = "free",
  pendingPlan,
}: LoggedInLayoutProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingPlanHandled, setPendingPlanHandled] = useState(false);
  const [blockedDaysModalOpen, setBlockedDaysModalOpen] = useState(false);
  const [openAddModalFn, setOpenAddModalFn] = useState<(() => void) | null>(null);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const addModalAllowedRef = useRef(false);

  useEffect(() => {
    setModalOpen(false);
    const t = setTimeout(() => {
      addModalAllowedRef.current = true;
    }, ADD_MODAL_OPEN_DELAY_MS);
    return () => clearTimeout(t);
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
        const res = await fetch("/api/chat/unread");
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data.unreadCount === "number") setUnreadCount(data.unreadCount);
      } catch {
        // ignore
      }
    };
    const interval = setInterval(poll, CHAT_UNREAD_POLL_MS);
    return () => clearInterval(interval);
  }, []);

  const registerOpenAddModal = useCallback((fn: (() => void) | null) => {
    setOpenAddModalFn(fn);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur border-b border-stone-200 dark:border-stone-800 safe-area-inset-top">
        <div className="flex items-center justify-between gap-2 px-4 py-3 max-w-2xl mx-auto">
          <AppLogo size={36} linkToHome className="h-9 w-9" />
          <div className="flex items-center gap-1 sm:gap-2">
            {plan === "free" && (
              <UpgradeCta variant="button" className="py-2 px-3 rounded-lg text-sm" children="Upgrade" />
            )}
            <button
              type="button"
              onClick={(e) => {
                if (!e.isTrusted || !addModalAllowedRef.current) return;
                e.preventDefault();
                e.stopPropagation();
                (openAddModalFn ?? (() => setModalOpen(true)))();
              }}
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 touch-manipulation"
              title="Adaugă eveniment"
              aria-label="Adaugă eveniment"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setBlockedDaysModalOpen(true)}
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 touch-manipulation"
              title="Zile blocate"
              aria-label="Zile blocate"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </button>
            <Link
              href="/chat"
              className="relative p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 touch-manipulation"
              title={unreadCount > 0 ? `Chat – ${unreadCount} mesaje necitite` : "Chat cu celălalt părinte"}
              aria-label={unreadCount > 0 ? `${unreadCount} mesaje necitite` : "Chat"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 touch-manipulation text-xs font-medium"
                title="Admin"
                aria-label="Admin"
              >
                Admin
              </Link>
            )}
            <Link
              href="/account"
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 touch-manipulation"
              title="Cont și date"
              aria-label="Cont și date"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            <a
              href="/api/auth/signout"
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 touch-manipulation"
              title="Ieșire"
              aria-label="Ieșire"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </a>
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full pb-safe">
        <DashboardClient
          initialEvents={initialEvents}
          currentUserId={currentUserId}
          userName={userName}
          parent1Name={parent1Name}
          parent2Name={parent2Name}
          childName={childName}
          residenceNames={residenceNames}
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          blockedDaysModalOpen={blockedDaysModalOpen}
          setBlockedDaysModalOpen={setBlockedDaysModalOpen}
          registerOpenAddModal={registerOpenAddModal}
          plan={plan}
        />
      </main>
    </>
  );
}
