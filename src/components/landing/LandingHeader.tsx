"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "#functionalitati", label: "Funcții" },
  { href: "#cum-functioneaza", label: "Cum merge" },
  { href: "#scenarii", label: "Scenarii" },
  { href: "#web-app", label: "Web app" },
  { href: "#preturi", label: "Prețuri" },
  { href: "#intrebari", label: "Întrebări" },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-white/60 bg-[#fffaf5]/80 shadow-[0_12px_40px_rgba(28,25,23,0.08)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 rounded-xl transition-opacity hover:opacity-90">
          <Image src="/logo.png" alt="HomeSplit" width={42} height={42} className="rounded-2xl object-contain" />
          <div className="hidden sm:block">
            <span className="landing-display block text-lg font-semibold text-stone-900">HomeSplit</span>
            <span className="block text-[11px] uppercase tracking-[0.24em] text-stone-500">
              calm pentru familie
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/70 bg-white/65 px-2 py-2 shadow-[0_10px_30px_rgba(28,25,23,0.08)] backdrop-blur md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-semibold text-stone-600 transition-colors hover:bg-[#f6ede3] hover:text-stone-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-white/70 sm:inline-flex"
          >
            Conectare
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full bg-[#1f3a36] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(31,58,54,0.24)] transition hover:bg-[#172c2a] active:scale-[0.98]"
          >
            Începe gratuit
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-full p-2 text-stone-700 hover:bg-white/70 md:hidden"
            aria-label="Meniu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#ead9c8] bg-[#fffaf5]/95 px-4 py-4 shadow-[0_18px_36px_rgba(28,25,23,0.08)] backdrop-blur md:hidden">
          <div className="space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-[#f4ebdf]"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-2 border-t border-[#ead9c8] pt-3">
            <Link
              href="/register"
              className="block rounded-2xl bg-[#1f3a36] px-4 py-3 text-center text-sm font-semibold text-white"
              onClick={() => setMobileOpen(false)}
            >
              Începe gratuit
            </Link>
            <Link
              href="/login"
              className="block rounded-2xl px-4 py-3 text-center text-sm font-semibold text-stone-700"
              onClick={() => setMobileOpen(false)}
            >
              Conectare
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
