"use client";

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
import { LandingPricing } from "./LandingPricing";
import { LandingFAQ } from "./LandingFAQ";
import { LandingFinalCTA } from "./LandingFinalCTA";
import { LandingFooter } from "./LandingFooter";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingSocialProof />
        <LandingProblemSolution />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingWebApp />
        <LandingUseCases />
        <LandingWhyUs />
        <LandingSecurity />
        <LandingPricing />
        <LandingFAQ />
        <LandingFinalCTA />
        <LandingFooter />
      </main>
    </div>
  );
}
