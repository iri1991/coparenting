"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppLogo } from "@/components/AppLogo";
import { ArrowLeft, Lock, Plus } from "lucide-react";

interface MobileAppTopBarProps {
  onAddClick?: () => void;
  onLockClick?: () => void;
  hideOnScroll?: boolean;
}

function getTitle(pathname: string): { title: string; subtitle: string } {
  if (pathname === "/chat") return { title: "Chat", subtitle: "Conversația voastră" };
  if (pathname === "/account") return { title: "Cont", subtitle: "Date și configurare" };
  return { title: "HomeSplit", subtitle: "spațiul familiei" };
}

export function MobileAppTopBar({ onAddClick, onLockClick, hideOnScroll = true }: MobileAppTopBarProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [collapsed, setCollapsed] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const { title, subtitle } = getTitle(pathname);

  useEffect(() => {
    if (!hideOnScroll || !isHome) {
      setCollapsed(false);
      return;
    }

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastScrollY.current;
        const threshold = 56;

        if (y < threshold) {
          setCollapsed(false);
        } else if (delta > 6) {
          setCollapsed(true);
        } else if (delta < -6) {
          setCollapsed(false);
        }

        lastScrollY.current = y;
        ticking.current = false;
      });
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideOnScroll, isHome]);

  const addButton =
    isHome && onAddClick ? (
      <button
        type="button"
        onClick={onAddClick}
        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-white shadow-[0_14px_32px_rgba(191,106,75,0.22)] touch-manipulation"
        aria-label="Adaugă eveniment"
      >
        <Plus className="h-5 w-5 stroke-[2.6]" />
      </button>
    ) : null;

  const lockButton =
    isHome && onLockClick ? (
      <button
        type="button"
        onClick={onLockClick}
        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/76 text-stone-700 shadow-[0_12px_28px_rgba(28,25,23,0.08)] backdrop-blur touch-manipulation"
        aria-label="Zile blocate"
      >
        <Lock className="h-5 w-5 stroke-[2.4]" />
      </button>
    ) : null;

  return (
    <header
      className={`sm:hidden fixed inset-x-0 top-0 z-[45] px-4 pt-[max(0.75rem,env(safe-area-inset-top))] transition-transform duration-300 ease-out ${
        hideOnScroll && collapsed ? "-translate-y-full pointer-events-none" : "translate-y-0"
      }`}
    >
      <div className="mx-auto max-w-md">
        <div className="app-native-glass flex items-center justify-between gap-3 rounded-[28px] px-3 py-2.5">
          <div className="flex min-w-[2.75rem] justify-start">
            {isHome ? (
              lockButton ?? <div className="h-11 w-11" />
            ) : (
              <Link
                href="/"
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/76 text-stone-700 shadow-[0_12px_28px_rgba(28,25,23,0.08)] backdrop-blur touch-manipulation"
                aria-label="Înapoi acasă"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            )}
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-3">
            <AppLogo size={36} linkToHome={isHome} className="h-10 w-10 shrink-0" />
            <div className="min-w-0 text-center">
              <p className="truncate text-[15px] font-semibold tracking-tight text-stone-900">{title}</p>
              <p className="truncate text-[11px] uppercase tracking-[0.18em] text-stone-500">{subtitle}</p>
            </div>
          </div>

          <div className="flex min-w-[2.75rem] justify-end">
            {isHome ? addButton ?? <div className="h-11 w-11" /> : <div className="h-11 w-11" />}
          </div>
        </div>
      </div>
    </header>
  );
}
