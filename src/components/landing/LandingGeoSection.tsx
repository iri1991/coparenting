"use client";

import { AnimateOnScroll } from "./AnimateOnScroll";
import { geoSummary } from "@/lib/seo";

/**
 * Secțiune scurtă, citabilă de motoare de căutare și AI (GEO).
 * Propoziții clare, factuale, pentru indexare și răspunsuri generative.
 */
export function LandingGeoSection() {
  return (
    <section
      id="ce-este-homesplit"
      className="py-12 sm:py-16 border-y border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950"
      aria-labelledby="geo-heading"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <AnimateOnScroll>
          <h2
            id="geo-heading"
            className="text-xl font-bold text-stone-900 dark:text-stone-100 sm:text-2xl"
          >
            Ce este HomeSplit?
          </h2>
        </AnimateOnScroll>
        <ul className="mt-6 space-y-4" role="list">
          {geoSummary.map((sentence, i) => (
            <AnimateOnScroll key={i} delay={i * 60}>
              <li className="flex gap-3 text-stone-700 dark:text-stone-300 text-base leading-relaxed">
                <span className="shrink-0 mt-1.5 h-2 w-2 rounded-full bg-amber-500" aria-hidden />
                <span>{sentence}</span>
              </li>
            </AnimateOnScroll>
          ))}
        </ul>
      </div>
    </section>
  );
}
