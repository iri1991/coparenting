"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export function AuthSuspenseFallback() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-stone-950 dark:to-stone-900">
      <p className="text-stone-500 dark:text-stone-400 text-sm">{t.app.auth.loading}</p>
    </div>
  );
}
