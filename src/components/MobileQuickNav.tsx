"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileQuickNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const baseItem =
    "flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium rounded-lg transition";

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 dark:border-stone-700 bg-white/95 dark:bg-stone-900/95 backdrop-blur px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1">
      <div className="max-w-md mx-auto flex gap-1">
        <Link
          href="/"
          className={`${baseItem} ${
            isActive("/")
              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
              : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
          }`}
        >
          Acasă
        </Link>
        <Link
          href="/chat"
          className={`${baseItem} ${
            isActive("/chat")
              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
              : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
          }`}
        >
          Chat
        </Link>
        <Link
          href="/account"
          className={`${baseItem} ${
            isActive("/account")
              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
              : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
          }`}
        >
          Cont
        </Link>
      </div>
    </nav>
  );
}

