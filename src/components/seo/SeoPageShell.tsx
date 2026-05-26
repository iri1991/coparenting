import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { landingDisplay, landingSans } from "@/components/landing/landingFonts";

interface SeoPageShellProps {
  children: React.ReactNode;
}

/**
 * Shared wrapper for all SEO landing pages.
 * Uses the same design language as the main LandingPage:
 * - Fraunces display font + Manrope body font
 * - Warm cream background with soft orbs
 * - Floating LandingHeader + LandingFooter
 */
export function SeoPageShell({ children }: SeoPageShellProps) {
  return (
    <div
      className={`${landingDisplay.variable} ${landingSans.variable} landing-sans relative min-h-screen overflow-hidden bg-[#fffaf5] text-stone-900`}
    >
      {/* Ambient background orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[#f6b28b]/20 blur-3xl" />
        <div className="absolute right-[-5rem] top-[8rem] h-80 w-80 rounded-full bg-[#99c6be]/15 blur-3xl" />
        <div className="absolute bottom-[30rem] left-[18%] h-64 w-64 rounded-full bg-[#f6dcc0]/25 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,245,0.92)_0%,rgba(248,239,230,0.82)_40%,rgba(255,253,249,0.98)_100%)]" />
      </div>

      <LandingHeader />
      <main>{children}</main>
      <LandingFooter />
    </div>
  );
}
