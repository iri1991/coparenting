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
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-[50] px-4 pb-[max(0.7rem,env(safe-area-inset-bottom))] pt-2">
      <div className="mx-auto max-w-md">
        <div className="app-native-glass overflow-hidden rounded-[30px] px-2 py-2 shadow-[0_22px_50px_rgba(28,25,23,0.16)]">
          <div className="relative grid grid-cols-3 gap-1">
            {ITEMS.map(({ href, label, Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex flex-col items-center justify-center gap-1.5 rounded-[22px] px-2 py-2.5 transition-all duration-200 active:scale-95 ${
                    active
                      ? "bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-white shadow-[0_16px_30px_rgba(191,106,75,0.22)]"
                      : "text-stone-600 hover:bg-white/55"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span className="text-[11px] font-semibold leading-none">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
