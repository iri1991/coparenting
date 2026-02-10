"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { HeaderNotificationIcon } from "@/components/HeaderNotificationIcon";
import { DashboardClient } from "@/components/DashboardClient";
import type { ScheduleEvent } from "@/types/events";

interface LoggedInLayoutProps {
  initialEvents: ScheduleEvent[];
  currentUserId: string;
  userName: string;
}

export function LoggedInLayout({
  initialEvents,
  currentUserId,
  userName,
}: LoggedInLayoutProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [blockedDaysModalOpen, setBlockedDaysModalOpen] = useState(false);
  const [openAddModalFn, setOpenAddModalFn] = useState<(() => void) | null>(null);
  const registerOpenAddModal = useCallback((fn: (() => void) | null) => {
    setOpenAddModalFn(fn);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur border-b border-stone-200 dark:border-stone-800 safe-area-inset-top">
        <div className="flex items-center justify-between gap-2 px-4 py-3 max-w-2xl mx-auto">
          <h1 className="flex items-center flex-shrink-0">
            <img
              src="/icon.svg"
              alt="Eva &amp; Coparenting"
              className="h-9 w-9"
              width={36}
              height={36}
            />
          </h1>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={(e) => {
                if (!e.isTrusted) return;
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
            <HeaderNotificationIcon currentUserId={currentUserId} />
            <Link
              href="/api/calendar/ics"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 touch-manipulation"
              title="Exportă calendar (.ics)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          blockedDaysModalOpen={blockedDaysModalOpen}
          setBlockedDaysModalOpen={setBlockedDaysModalOpen}
          registerOpenAddModal={registerOpenAddModal}
        />
      </main>
    </>
  );
}
