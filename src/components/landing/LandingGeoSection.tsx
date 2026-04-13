"use client";

import { AnimateOnScroll } from "./AnimateOnScroll";
import { useLanguage } from "@/contexts/LanguageContext";

export function LandingGeoSection() {
  const { t } = useLanguage();
  return (
    <section id="ce-este-homesplit" className="pb-10 pt-4 sm:pb-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <AnimateOnScroll>
          <div className="rounded-[2.2rem] border border-[#ead9c8] bg-white/85 p-6 shadow-[0_18px_40px_rgba(28,25,23,0.05)] sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
              <div>
                <span className="inline-flex rounded-full border border-[#ead9c8] bg-[#fff7f0] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  {t.geo.eyebrow}
                </span>
                <h2 className="landing-display mt-5 text-3xl leading-tight text-stone-900 sm:text-4xl">
                  {t.geo.title}
                </h2>
              </div>
              <div className="grid gap-3">
                {t.geo.summary.map((sentence, index) => (
                  <AnimateOnScroll key={index} delay={index * 50}>
                    <div className="rounded-[1.4rem] bg-[#faf4ed] px-4 py-3 text-sm leading-7 text-stone-600">
                      {sentence}
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
