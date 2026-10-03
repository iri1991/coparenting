"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LayoutDashboard, Users, House, Wrench, ShieldCheck } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Prezentare", Icon: LayoutDashboard },
  { href: "/admin/users", label: "Utilizatori", Icon: Users },
  { href: "/admin/families", label: "Familii", Icon: House },
  { href: "/admin/tools", label: "Unelte", Icon: Wrench },
] as const;

export function AdminNav({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur dark:border-stone-800 dark:bg-stone-900/90">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 pt-3 sm:px-6">
        <Link
          href="/app"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
          aria-label="Înapoi la aplicație"
          title="Înapoi la aplicație"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <ShieldCheck className="h-5 w-5 shrink-0 text-amber-600" />
          <span className="truncate font-semibold">Admin HomeSplit</span>
        </div>
        <span className="hidden truncate text-xs text-stone-500 sm:block">{adminEmail}</span>
      </div>
      <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 pt-2 sm:px-6" aria-label="Secțiuni admin">
        {LINKS.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
