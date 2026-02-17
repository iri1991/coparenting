"use client";

import Link from "next/link";
import { AnimateOnScroll } from "./AnimateOnScroll";

const PLANS = [
  {
    name: "Free",
    price: "0 lei",
    period: "lună",
    badge: null,
    features: [
      "1 copil",
      "Calendar săptămânal (program & handover basic)",
      "Activități recurente: până la 3",
      "Zile blocate: până la 5 / lună",
      "1 locație implicită de predare",
    ],
    limits: ["Fără propunerea automată de duminică", "Fără documente & reminders expirare", "Istoric limitat"],
    cta: "Începe gratuit",
    ctaPrimary: false,
  },
  {
    name: "Pro",
    price: "39 lei",
    period: "lună",
    priceAlt: "sau 299 lei / an (~25 lei/lună)",
    badge: "Cel mai bun raport preț/valoare",
    features: [
      "1–3 copii",
      "Activități recurente nelimitat + „cine duce / cine ia”",
      "Zile blocate nelimitat",
      "Locații multiple + note handover",
      "Propunerea automată de duminică",
      "Profil copil: alergii/medicație/contacte",
      "Documente + reminders expirare",
      "Istoric schimbări (trasabilitate)",
    ],
    limits: [],
    cta: "Încearcă Pro 14 zile",
    ctaPrimary: true,
  },
  {
    name: "Family+",
    price: "59 lei",
    period: "lună",
    priceAlt: "sau 449 lei / an",
    badge: null,
    features: [
      "Copii nelimitat",
      "Acces îngrijitori (bonă/bunici) cu roluri",
      "Export / share program (PDF)",
      "Suport prioritar",
    ],
    limits: [],
    cta: "Alege Family+",
    ctaPrimary: false,
  },
];

export function LandingPricing() {
  return (
    <section id="preturi" className="bg-stone-50/50 dark:bg-stone-900/30 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <h2 className="text-center text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
            Preț simplu. Un abonament pe familie.
          </h2>
        </AnimateOnScroll>
        <AnimateOnScroll delay={100}>
          <p className="mx-auto mt-4 max-w-xl text-center text-stone-600 dark:text-stone-400">
            Include ambii părinți. Începi gratuit și poți face upgrade oricând.
          </p>
        </AnimateOnScroll>
        <AnimateOnScroll delay={150}>
          <p className="mt-2 text-center font-medium text-amber-700 dark:text-amber-300">
            14 zile Pro gratuit, fără card.
          </p>
        </AnimateOnScroll>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <AnimateOnScroll key={plan.name} delay={200 + i * 100}>
              <div
                className={`relative flex flex-col rounded-3xl border p-6 sm:p-8 ${
                  plan.ctaPrimary
                    ? "border-amber-300 dark:border-amber-600 bg-amber-50/50 dark:bg-stone-900 shadow-lg ring-2 ring-amber-200/50 dark:ring-amber-800/30"
                    : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-white">
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{plan.name}</h3>
                <p className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">{plan.price}</span>
                  <span className="text-stone-500 dark:text-stone-400">/ {plan.period}</span>
                </p>
                {plan.priceAlt && <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">{plan.priceAlt}</p>}
                <ul className="mt-6 flex-1 space-y-2 text-sm text-stone-600 dark:text-stone-400">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-amber-500">✓</span>
                      {f}
                    </li>
                  ))}
                  {plan.limits.map((l) => (
                    <li key={l} className="flex gap-2 text-stone-400 dark:text-stone-500">
                      <span aria-hidden>·</span>
                      {l}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.name === "Free" ? "/login" : plan.name === "Pro" ? "/login?plan=pro" : "/login?plan=family"}
                  className={`mt-6 block w-full rounded-xl py-3 text-center font-medium transition ${
                    plan.ctaPrimary
                      ? "bg-amber-500 text-white hover:bg-amber-600"
                      : "border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
        <AnimateOnScroll delay={600}>
          <p className="mt-8 text-center text-sm text-stone-500 dark:text-stone-400">
            Un singur abonament pe familie (include ambii părinți). Trial fără card. Schimbi planul oricând.
          </p>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
