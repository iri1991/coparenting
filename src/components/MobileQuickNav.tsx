"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, MessageCircle, UserRound } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Acasă", Icon: House },
  { href: "/chat", label: "Chat", Icon: MessageCircle },
  { href: "/account", label: "Cont", Icon: UserRound },
] as const;

export function MobileQuickNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2">
      <div className="mx-auto max-w-md">
        <div className="relative overflow-hidden rounded-[28px] border border-white/50 dark:border-white/10 bg-white/55 dark:bg-stone-900/45 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
          {/* liquid sheen */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-3 top-1 h-7 rounded-full bg-gradient-to-r from-white/55 via-white/15 to-white/45 dark:from-white/10 dark:via-white/5 dark:to-white/10 blur-md"
          />
          <div className="relative grid grid-cols-3 p-1.5">
            {ITEMS.map(({ href, label, Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 transition-all duration-200 active:scale-95 ${
                    active
                      ? "bg-white/80 dark:bg-white/10 text-amber-700 dark:text-amber-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_8px_22px_rgba(245,158,11,0.28)]"
                      : "text-stone-600 dark:text-stone-300 hover:bg-white/40 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className={`h-[18px] w-[18px] ${active ? "drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)]" : ""}`} />
                  <span className="text-[11px] font-medium leading-none">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

