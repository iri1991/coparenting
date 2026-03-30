"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimateOnScroll } from "./AnimateOnScroll";

type HeroAudience = "two" | "together";

const HERO_COPY: Record<
  HeroAudience,
  { label: string; subtitle: string; bullets: string[] }
> = {
  two: {
    label: "Două adrese",
    subtitle: "Calendar, handover și propuneri automate — la un loc, vizibil pentru amândoi.",
    bullets: [
      "Știi din timp cine e cu copilul, unde și la ce oră",
      "Propunere săptămânală + aprobare în câțiva pași",
      "Jurnal scurt la handover; activitățile intră în istoric",
      "Zile blocate, activități recurente, responsabil clar",
      "Chat lângă calendar — fără mesaje pierdute",
    ],
  },
  together: {
    label: "O casă",
    subtitle: "Activități, idei AI, ritualuri și documente — același hub, fără liste risipite.",
    bullets: [
      "Idei AI pentru ieșit (vreme, oraș) — salvezi sau refuzi din tab Idei",
      "Ritualuri comune + reminder la ora setată",
      "Materiale utile: melodii, povești, link-uri la îndemână",
      "Alergii, documente și note importante centralizate",
      "Mai puțină încărcare mentală — un singur loc pentru amândoi",
    ],
  },
};

const BADGES = [
  { label: "Calm", sub: "mai puține fricțiuni zilnice" },
  { label: "Clar", sub: "plan vizibil pentru amândoi" },
  { label: "Sigur", sub: "date private, doar în familie" },
];

export function LandingHero() {
  const [audience, setAudience] = useState<HeroAudience>("two");
  const copy = HERO_COPY[audience];

  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-amber-50/80 via-stone-50/90 to-white dark:from-stone-950 dark:via-stone-900/95 dark:to-stone-950 pt-8 pb-20 sm:pt-12 sm:pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div className="space-y-8">
            <AnimateOnScroll>
              <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-4xl lg:text-5xl leading-tight">
                Co-parenting fără stres.
              </h1>
            </AnimateOnScroll>
            <AnimateOnScroll delay={80}>
              <div
                className="inline-flex rounded-xl border border-stone-200 dark:border-stone-600 bg-white/90 dark:bg-stone-900/90 p-1 shadow-sm"
                role="tablist"
                aria-label="Situația ta"
              >
                {(["two", "together"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={audience === key}
                    onClick={() => setAudience(key)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      audience === key
                        ? "bg-amber-500 text-white shadow-sm"
                        : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                    }`}
                  >
                    {HERO_COPY[key].label}
                  </button>
                ))}
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay={100}>
              <p className="text-lg text-stone-600 dark:text-stone-400 max-w-xl">{copy.subtitle}</p>
            </AnimateOnScroll>
            <ul className="space-y-2" key={audience}>
              {copy.bullets.map((text, i) => (
                <AnimateOnScroll key={text} delay={180 + i * 45} staggerIndex={i}>
                  <li className="flex items-start gap-2 text-stone-600 dark:text-stone-400">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden />
                    <span>{text}</span>
                  </li>
                </AnimateOnScroll>
              ))}
            </ul>
            <AnimateOnScroll delay={600}>
              <div className="flex flex-wrap gap-3 rounded-2xl bg-stone-100/80 dark:bg-stone-800/50 p-4">
                {BADGES.map((b) => (
                  <div key={b.label} className="flex flex-col">
                    <span className="font-medium text-stone-800 dark:text-stone-200 text-sm">{b.label}</span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">{b.sub}</span>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay={700}>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3 text-base font-medium text-white shadow-lg hover:bg-amber-600 active:scale-[0.98] transition"
                >
                  Creează cont gratuit
                </Link>
                <a
                  href="#cum-functioneaza"
                  className="inline-flex items-center justify-center rounded-xl border border-stone-300 dark:border-stone-600 px-6 py-3 text-base font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition"
                >
                  Vezi cum funcționează
                </a>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay={800}>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Fără card. Setare rapidă.
              </p>
              <p className="mt-1 text-sm font-medium text-stone-700 dark:text-stone-300">
                Mai puțin stres pentru voi, mai multă predictibilitate pentru copil.
              </p>
            </AnimateOnScroll>
          </div>
          <AnimateOnScroll delay={300} className="relative">
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-2xl shadow-stone-200/50 dark:shadow-black/20">
                <img
                  src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1400&q=80"
                  alt="Părinte și copil într-un moment liniștit acasă"
                  className="h-64 w-full object-cover sm:h-72"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <p className="text-white text-sm sm:text-base font-medium">
                    Plan clar = mai puține tensiuni, mai mult timp cu copilul.
                  </p>
                </div>
              </div>
              <div className="relative rounded-3xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-xl p-5">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                    <span className="font-medium text-stone-500 dark:text-stone-400">Săptămâna următoare</span>
                    <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-amber-800 dark:text-amber-200 text-xs font-medium">Clar și confirmat</span>
                  </div>
                  <div className="flex items-center justify-between py-1 text-stone-600 dark:text-stone-400">
                    <span>Luni - Marți</span>
                    <span className="text-amber-700 dark:text-amber-300 font-medium">Părinte 1</span>
                  </div>
                  <div className="flex items-center justify-between py-1 text-stone-600 dark:text-stone-400">
                    <span>Miercuri - Joi</span>
                    <span className="text-amber-700 dark:text-amber-300 font-medium">Părinte 2</span>
                  </div>
                  <div className="flex items-center justify-between py-1 text-stone-600 dark:text-stone-400">
                    <span>Vineri - Duminică</span>
                    <span className="text-amber-700 dark:text-amber-300 font-medium">Părinte 1</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">
                  Funcționalitățile sunt gândite ca să reducă fricțiunea, nu să adauge complexitate.
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
