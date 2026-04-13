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

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang ?? DEFAULT_LANG);

  // Hydrate from localStorage once mounted and sync html[lang]
  useEffect(() => {
    const active = initialLang ?? getLangSafe(localStorage.getItem(LANG_STORAGE_KEY));
    if (active !== lang) setLangState(active);
    if (typeof document !== "undefined") {
      document.documentElement.lang = active === "en" ? "en" : "ro";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // ignore
    }
    // Update the html[lang] attribute for screen readers and crawlers
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
