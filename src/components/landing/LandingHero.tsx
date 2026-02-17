"use client";

import Link from "next/link";
import { AnimateOnScroll } from "./AnimateOnScroll";

const BULLETS = [
  "Propunere automată de program săptămânal (duminică)",
  "Zile blocate când un părinte nu poate acomoda",
  "Activități recurente + „cine duce / cine ia”",
  "Locații & ore pentru handover",
  "Profil copil: alergii, medicație, contacte utile",
  "Documente: pașaport, acord de călătorie, asigurare etc.",
];

const BADGES = [
  { label: "Web app", sub: "merge direct din browser" },
  { label: "Nu instalezi nimic", sub: "din App Store / Google Play" },
  { label: "Poți salva pe ecran", sub: "ca icon (ca o aplicație)" },
];

export function LandingHero() {
  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-amber-50/80 via-stone-50/90 to-white dark:from-stone-950 dark:via-stone-900/95 dark:to-stone-950 pt-8 pb-20 sm:pt-12 sm:pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div className="space-y-8">
            <AnimateOnScroll>
              <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-4xl lg:text-5xl leading-tight">
                Co-parenting fără stres: program, locații, activități și informații esențiale despre copil — într-un singur loc.
              </h1>
            </AnimateOnScroll>
            <AnimateOnScroll delay={100}>
              <p className="text-lg text-stone-600 dark:text-stone-400 max-w-xl">
                Gestionează timpul cu copilul, zilele blocate, predarea/primirea (handover), activități recurente (ex. balet miercuri la 16:00) și documente de călătorie.
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll delay={200}>
              <p className="text-stone-700 dark:text-stone-300 font-medium">
                În fiecare duminică, aplicația generează automat propunerea pentru săptămâna următoare, pe baza disponibilității ambilor părinți.
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
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3 text-base font-medium text-white shadow-lg hover:bg-amber-600 active:scale-[0.98] transition"
                >
                  Începe gratuit
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
                Fără card. Setare în 3 minute.
              </p>
              <p className="mt-1 text-sm font-medium text-stone-700 dark:text-stone-300">
                Date private. Acces doar pentru părinții invitați.
              </p>
            </AnimateOnScroll>
          </div>
          <AnimateOnScroll delay={300} className="relative">
            <div className="relative rounded-3xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-2xl shadow-stone-200/50 dark:shadow-black/20 p-6 lg:p-8">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                  <span className="font-medium text-stone-500 dark:text-stone-400">Săptămâna 3–9 Feb</span>
                  <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-amber-800 dark:text-amber-200 text-xs font-medium">Propus</span>
                </div>
                {["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"].map((day, i) => (
                  <div key={day} className="flex items-center justify-between py-1.5 text-stone-600 dark:text-stone-400">
                    <span>{day}</span>
                    <span className={i % 2 === 0 ? "text-amber-700 dark:text-amber-300 font-medium" : "text-stone-500 dark:text-stone-400"}>
                      {i % 2 === 0 ? "Tata · Tunari" : "Mama · Otopeni"}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-stone-400 dark:text-stone-500">Calendar + zile blocate + activități</p>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
