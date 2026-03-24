"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppLogo } from "@/components/AppLogo";
import { Plus, Lock } from "lucide-react";

interface MobileAppTopBarProps {
  /** Pe `/` folosește butoane; în rest, link către `/?add=1` și `/?blocked=1`. */
  onAddClick?: () => void;
  onLockClick?: () => void;
  /** Implicit: ascunde bara la scroll în jos (ca Instagram). Dezactivat pe chat (scroll intern). */
  hideOnScroll?: boolean;
}

export function MobileAppTopBar({ onAddClick, onLockClick, hideOnScroll = true }: MobileAppTopBarProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [collapsed, setCollapsed] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    if (!hideOnScroll) {
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
  }, [hideOnScroll]);

  const addButton = isHome && onAddClick ? (
    <button
      type="button"
      onClick={onAddClick}
      className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-800 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 touch-manipulation"
      aria-label="Adaugă eveniment"
    >
      <Plus className="h-7 w-7 stroke-[2.5]" />
    </button>
  ) : (
    <Link
      href="/?add=1"
      className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-800 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 touch-manipulation"
      aria-label="Adaugă eveniment"
    >
      <Plus className="h-7 w-7 stroke-[2.5]" />
    </Link>
  );

  const lockButton = isHome && onLockClick ? (
    <button
      type="button"
      onClick={onLockClick}
      className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-800 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 touch-manipulation"
      aria-label="Zile blocate"
    >
      <Lock className="h-6 w-6 stroke-[2.5]" />
    </button>
  ) : (
    <Link
      href="/?blocked=1"
      className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-800 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 touch-manipulation"
      aria-label="Zile blocate"
    >
      <Lock className="h-6 w-6 stroke-[2.5]" />
    </Link>
  );

  return (
    <header
      className={`sm:hidden fixed left-0 right-0 top-0 z-[45] border-b border-stone-200/90 dark:border-stone-800/90 bg-white/92 dark:bg-stone-950/92 backdrop-blur-md safe-area-inset-top transition-transform duration-300 ease-out ${
        hideOnScroll && collapsed ? "-translate-y-full pointer-events-none" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex h-12 max-w-2xl items-center justify-between px-2">
        <div className="flex w-14 shrink-0 justify-start">{addButton}</div>
        <div className="flex flex-1 justify-center">
          <AppLogo size={36} linkToHome className="h-9 w-9" />
        </div>
        <div className="flex w-14 shrink-0 justify-end">{lockButton}</div>
      </div>
    </header>
  );
}
