"use client";

import Link from "next/link";
import { AnimateOnScroll } from "./AnimateOnScroll";

const BULLETS = [
  "Potrivit și pentru familii care locuiesc împreună: activități, idei AI, documente — fără mesaje risipite",
  "Știi din timp cine e cu copilul, unde și la ce oră (util și la două adrese)",
  "Mai puțină încărcare mentală, același plan vizibil pentru amândoi",
  "Tab Idei: recomandări AI pentru ieșit (vreme, oraș) — salvezi în activități sau refuzi",
  "Activitățile copilului centralizate; la handover, notițe rapide despre ce a mers bine",
  "Link-uri utile (melodii, povești, clipuri) la îndemână",
  "Alergii, documente de familie și informații importante într-un loc sigur",
];

const BADGES = [
  { label: "Calm", sub: "mai puține fricțiuni zilnice" },
  { label: "Clar", sub: "plan vizibil pentru amândoi" },
  { label: "Sigur", sub: "date private, doar în familie" },
];

export function LandingHero() {
  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-amber-50/80 via-stone-50/90 to-white dark:from-stone-950 dark:via-stone-900/95 dark:to-stone-950 pt-8 pb-20 sm:pt-12 sm:pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div className="space-y-8">
            <AnimateOnScroll>
              <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-4xl lg:text-5xl leading-tight">
                Organizare pentru familie — împreună acasă sau la două adrese.
              </h1>
            </AnimateOnScroll>
            <AnimateOnScroll delay={100}>
              <p className="text-lg text-stone-600 dark:text-stone-400 max-w-xl">
                Fie că vreți mai multă claritate și timp de calitate când stați în aceeași casă, fie că împărțiți programul copilului între două locuințe — HomeSplit pune calendarul, activitățile, ideile și documentele într-un singur loc, pentru amândoi părinții.
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll delay={200}>
              <p className="text-stone-700 dark:text-stone-300 font-medium">
                Propunere săptămânală automată, recomandări AI pentru ieșit și tot ce ține de copil la îndemână — fără să vă pierdeți în chat-uri și foi volante.
              </p>
            </AnimateOnScroll>
            <ul className="space-y-2">
              {BULLETS.map((text, i) => (
                <AnimateOnScroll key={text} delay={250 + i * 50} staggerIndex={i}>
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
                Mai puțin stres pentru voi. Mai multă liniște și predictibilitate pentru copil.
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
                    Un plan clar acasă înseamnă mai puține tensiuni și mai mult timp bun cu copilul.
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
