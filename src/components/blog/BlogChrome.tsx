"use client";

import type { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { MobileAppTopBar } from "@/components/MobileAppTopBar";
import { MobileQuickNav } from "@/components/MobileQuickNav";
import { useIsStandalone } from "@/lib/use-standalone";

/**
 * Blogul e static (SEO), dar pentru utilizatorii logați / aplicația instalată arată pe mobil
 * ca un ecran din aplicație: header-ul și bara de jos ale aplicației în locul celor publice.
 * Pe desktop rămâne layout-ul public.
 */
export function BlogChrome({ header, footer, children }: { header: ReactNode; footer: ReactNode; children: ReactNode }) {
  const { status } = useSession();
  const standalone = useIsStandalone();
  const inApp = standalone || status === "authenticated";

  if (!inApp) {
    return (
      <>
        {header}
        <main>{children}</main>
        {footer}
      </>
    );
  }

  return (
    <>
      <MobileAppTopBar />
      <div className="hidden sm:block">{header}</div>
      <main className="pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-[calc(4.5rem+env(safe-area-inset-top))] sm:pb-0 sm:pt-0">{children}</main>
      <div className="hidden sm:block">{footer}</div>
      <MobileQuickNav />
    </>
  );
}
