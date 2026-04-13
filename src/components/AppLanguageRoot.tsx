"use client";

import { LanguageProvider } from "@/contexts/LanguageContext";

export function AppLanguageRoot({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
