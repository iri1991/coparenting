import { LandingHeader } from "./LandingHeader";
import { LandingHero } from "./LandingHero";
import {
  LandingSocialProof,
  LandingProblemSolution,
  LandingFeatures,
  LandingHowItWorks,
  LandingWebApp,
  LandingUseCases,
  LandingWhyUs,
  LandingSecurity,
} from "./LandingSections";
import { LandingGeoSection } from "./LandingGeoSection";
import { LandingPricing } from "./LandingPricing";
import { LandingBlogPreview } from "./LandingBlogPreview";
import { LandingFAQ } from "./LandingFAQ";
import { LandingFinalCTA } from "./LandingFinalCTA";
import { LandingFooter } from "./LandingFooter";
import { landingDisplay, landingSans } from "./landingFonts";

export function LandingPage() {
  return (
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
      <main>
        <LandingHero />
        <LandingSocialProof />
        <LandingProblemSolution />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingUseCases />
        <LandingWhyUs />
        <LandingWebApp />
        <LandingSecurity />
        <LandingBlogPreview />
        <LandingPricing />
        <LandingFAQ />
        <LandingGeoSection />
        <LandingFinalCTA />
        <LandingFooter />
      </main>
    </div>
  );
}
