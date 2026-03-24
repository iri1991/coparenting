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
            HomeSplit pe scurt (pentru părinți ocupați)
          </h2>
        </AnimateOnScroll>
        <AnimateOnScroll delay={40}>
          <p className="mt-3 text-stone-600 dark:text-stone-400">
            Dacă simți că programul copilului vă consumă energie și discuții, HomeSplit este construit să readucă ordine,
            calm și încredere între părinți.
          </p>
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
        <AnimateOnScroll delay={260}>
          <p className="mt-6 text-sm font-medium text-amber-700 dark:text-amber-300">
            Începi gratuit. În câteva minute aveți un plan comun, clar și ușor de urmat.
          </p>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
