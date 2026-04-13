import { ReactNode } from "react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { landingDisplay, landingSans } from "@/components/landing/landingFonts";
import { LanguageProvider } from "@/contexts/LanguageContext";

export function BlogShell({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
    <div
      className={`${landingDisplay.variable} ${landingSans.variable} landing-sans relative min-h-screen overflow-hidden bg-[#fffaf5] text-stone-900`}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="landing-orb absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[#f6b28b]/35 blur-3xl" />
        <div className="landing-orb absolute right-[-5rem] top-[8rem] h-80 w-80 rounded-full bg-[#99c6be]/25 blur-3xl [animation-delay:2s]" />
        <div className="landing-orb absolute bottom-[18rem] left-[18%] h-64 w-64 rounded-full bg-[#f6dcc0]/40 blur-3xl [animation-delay:4s]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,245,0.92)_0%,rgba(248,239,230,0.86)_36%,rgba(255,253,249,0.98)_100%)]" />
      </div>

      <LandingHeader />
      <main>{children}</main>
      <LandingFooter />
    </div>
    </LanguageProvider>
  );
}
