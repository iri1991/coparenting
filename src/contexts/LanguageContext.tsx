"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ro, en, type Lang, type Translations, LANG_STORAGE_KEY, DEFAULT_LANG, getLangSafe } from "@/lib/i18n";

interface LanguageContextValue {
  lang: Lang;
  t: Translations;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: DEFAULT_LANG,
  t: ro,
  setLang: () => {},
});

const DICT: Record<Lang, Translations> = { ro, en };

/** Read hs-lang cookie synchronously (client only). */
function readCookieLang(): Lang | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)hs-lang=([^;]+)/);
  return match ? getLangSafe(match[1]) : null;
}

/** Write hs-lang cookie (client only). */
function writeCookieLang(lang: Lang) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `hs-lang=${lang}; max-age=${maxAge}; path=/; samesite=lax`;
}

/**
 * Resolve the initial language in priority order:
 * 1. Prop passed from server (e.g. from URL segment detection)
 * 2. Cookie `hs-lang` — set by the middleware when user visits /en/...
 * 3. localStorage (user's previous in-app preference)
 * 4. Default (Romanian)
 */
function resolveInitialLang(propLang: Lang | undefined): Lang {
  if (propLang) return propLang;
  // Read cookie synchronously — avoids flash on /en/... URLs
  const cookie = readCookieLang();
  if (cookie) return cookie;
  try {
    const ls = getLangSafe(localStorage.getItem(LANG_STORAGE_KEY));
    if (ls) return ls;
  } catch {
    // ignore (SSR / private browsing)
  }
  return DEFAULT_LANG;
}

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  // Initialise synchronously from cookie (set by middleware for /en/... URLs).
  // This avoids a flash because it runs before the first paint on the client.
  const [lang, setLangState] = useState<Lang>(() => resolveInitialLang(initialLang));

  // Sync html[lang] attribute whenever language changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang === "en" ? "en" : "ro";
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    // Persist in both cookie and localStorage
    writeCookieLang(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // ignore
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = next === "en" ? "en" : "ro";
    }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, t: DICT[lang], setLang }),
    [lang, setLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
