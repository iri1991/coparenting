"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Globe } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Lang } from "@/lib/i18n";

export function LandingHeader() {
  const { t, lang, setLang } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /**
   * Navigate to the equivalent URL in the target language.
   * /en/... → /... (Romanian) and /... → /en/... (English).
   * The middleware will set the cookie on the next request.
   * We also call setLang() so the current page updates instantly.
   */
  function switchLang(next: Lang) {
    setLang(next);
    // Derive the base path (strip /en prefix if present)
    const base = pathname.startsWith("/en/")
      ? pathname.slice(3) // keep leading /
      : pathname === "/en"
        ? "/"
        : pathname;
    const target = next === "en" ? (base === "/" ? "/en" : `/en${base}`) : base;
    router.push(target);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/#functionalitati", label: t.nav.features },
    { href: "/#cum-functioneaza", label: t.nav.howItWorks },
    { href: "/#scenarii", label: t.nav.scenarios },
    { href: "/blog", label: t.nav.blog },
    { href: "/#web-app", label: t.nav.webApp },
    { href: "/#preturi", label: t.nav.pricing },
    { href: "/#intrebari", label: t.nav.faq },
  ];

  return (
    <>
      {/* Spacer so page content doesn't start under the floating header */}
      <div className="h-[4.5rem] sm:h-20" aria-hidden />

      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between rounded-[1.8rem] px-3 py-2.5 sm:px-4 transition-all duration-300 ${
            scrolled
              ? "border border-white/80 bg-[#fffaf5]/88 shadow-[0_16px_48px_rgba(28,25,23,0.12)] backdrop-blur-2xl"
              : "border border-white/50 bg-[#fffaf5]/72 shadow-[0_8px_28px_rgba(28,25,23,0.07)] backdrop-blur-xl"
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5 rounded-xl transition-opacity hover:opacity-90">
            <Image src="/logo.png" alt="HomeSplit" width={38} height={38} className="rounded-2xl object-contain" />
            <div className="hidden sm:block">
              <span className="landing-display block text-base font-semibold text-stone-900 leading-tight">HomeSplit</span>
              <span className="block text-[10px] uppercase tracking-[0.22em] text-stone-500 leading-none">
                calm pentru familie
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-1.5 text-sm font-semibold text-stone-600 transition-colors hover:bg-[#f6ede3] hover:text-stone-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <LanguageSwitcher lang={lang} setLang={switchLang} />

            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-white/70 sm:inline-flex"
            >
              {t.common.login}
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-[#1f3a36] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(31,58,54,0.22)] transition hover:bg-[#172c2a] active:scale-[0.98]"
            >
              {t.common.startFree}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="rounded-full p-2 text-stone-700 hover:bg-white/60 md:hidden"
              aria-label="Meniu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-[1.6rem] border border-white/70 bg-[#fffaf5]/96 px-4 py-4 shadow-[0_20px_48px_rgba(28,25,23,0.12)] backdrop-blur-2xl md:hidden">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-[#f4ebdf]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-2 border-t border-[#ead9c8] pt-3">
              <Link
                href="/register"
                className="block rounded-2xl bg-[#1f3a36] px-4 py-3 text-center text-sm font-semibold text-white"
                onClick={() => setMobileOpen(false)}
              >
                {t.common.startFree}
              </Link>
              <Link
                href="/login"
                className="block rounded-2xl px-4 py-3 text-center text-sm font-semibold text-stone-700"
                onClick={() => setMobileOpen(false)}
              >
                {t.common.login}
              </Link>
              {/* Mobile language switcher */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <Globe className="h-3.5 w-3.5 text-stone-400" />
                {(["ro", "en"] as Lang[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => { switchLang(l); setMobileOpen(false); }}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      lang === l
                        ? "bg-[#1f3a36] text-white"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

function LanguageSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="hidden items-center gap-0.5 rounded-full border border-stone-200/80 bg-white/60 p-0.5 sm:flex">
      <Globe className="ml-2 h-3.5 w-3.5 shrink-0 text-stone-400" />
      {(["ro", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide transition-all ${
            lang === l
              ? "bg-[#1f3a36] text-white shadow-sm"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
