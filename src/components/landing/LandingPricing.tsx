"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { AnimateOnScroll } from "./AnimateOnScroll";

const PLANS = [
  {
    name: "Free",
    price: "0",
    period: "lună",
    badge: "intrare ușoară",
    summary: "Perfect ca să intri rapid în ritmul produsului.",
    features: [
      "1 copil",
      "calendar și handover basic",
      "tab Idei cu recomandări AI",
      "până la 3 activități recurente",
      "până la 5 zile blocate / lună",
    ],
    cta: "Începe gratuit",
    href: "/register",
    primary: false,
  },
  {
    name: "Pro",
    price: "39",
    period: "lună",
    priceAlt: "sau 299 lei / an",
    badge: "cel mai bun raport valoare",
    summary: "Experiența completă pentru familiile care vor claritate fără compromis.",
    features: [
      "1–3 copii",
      "activități recurente nelimitat",
      "ritualuri, jurnal și istoric complet",
      "documente, profil copil și remindere",
      "propunerea automată de duminică",
      "notificări și trasabilitate extinsă",
    ],
    cta: "Încearcă Pro 14 zile",
    href: "/register?plan=pro",
    primary: true,
  },
  {
    name: "Family+",
    price: "59",
    period: "lună",
    priceAlt: "sau 449 lei / an",
    badge: "pentru familii extinse",
    summary: "Pentru mai mulți copii și mai mulți oameni implicați în coordonare.",
    features: [
      "copii nelimitat",
      "acces îngrijitori și bunici",
      "export și share program",
      "jurnal + materiale utile",
      "suport prioritar",
    ],
    cta: "Alege Family+",
    href: "/register?plan=family",
    primary: false,
  },
];

export function LandingPricing() {
  return (
    <section id="preturi" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <div className="overflow-hidden rounded-[2.8rem] border border-[#ead9c8] bg-[linear-gradient(135deg,#fff3e7_0%,#fffdf9_58%,#edf6f3_100%)] p-6 shadow-[0_24px_60px_rgba(28,25,23,0.06)] sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
              <div>
                <span className="inline-flex rounded-full border border-[#ead9c8] bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Preț simplu
                </span>
                <h2 className="landing-display mt-5 text-4xl leading-tight text-stone-900 sm:text-5xl">
                  Un abonament pe familie. Fără surprize. Fără card la trial.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-8 text-stone-600">
                  Nu plătiți separat pentru fiecare părinte. Începeți cu Free sau intrați direct în Pro timp de 14 zile, fără card.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.8rem] bg-white/85 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400">trial</p>
                  <p className="mt-3 text-3xl font-extrabold text-stone-900">14 zile</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600">Pro complet, fără card, fără presiune.</p>
                </div>
                <div className="rounded-[1.8rem] bg-white/85 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400">familie</p>
                  <p className="mt-3 text-3xl font-extrabold text-stone-900">2 părinți</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600">Același abonament, aceeași sursă de adevăr.</p>
                </div>
                <div className="rounded-[1.8rem] bg-[#1f3a36] p-5 text-white">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">upgrade</p>
                  <p className="mt-3 text-3xl font-extrabold">oricând</p>
                  <p className="mt-2 text-sm leading-7 text-white/75">Treci la planul potrivit fără să pierzi datele.</p>
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan, index) => (
            <AnimateOnScroll key={plan.name} delay={140 + index * 90}>
              <div
                className={`relative flex h-full flex-col rounded-[2.2rem] border p-6 shadow-[0_20px_50px_rgba(28,25,23,0.06)] sm:p-7 ${
                  plan.primary
                    ? "border-[#d7b596] bg-[#1f3a36] text-white shadow-[0_26px_70px_rgba(31,58,54,0.18)]"
                    : "border-[#ead9c8] bg-white/85 text-stone-900"
                }`}
              >
                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                    plan.primary ? "bg-white/10 text-[#f8c89f]" : "bg-[#fff3e7] text-stone-600"
                  }`}
                >
                  {plan.badge}
                </span>
                <h3 className="mt-5 text-2xl font-extrabold">{plan.name}</h3>
                <div className="mt-3 flex items-end gap-1">
                  <span className="landing-display text-5xl leading-none">{plan.price}</span>
                  <span className={`${plan.primary ? "text-white/70" : "text-stone-500"} mb-1 text-sm font-semibold`}>
                    lei / {plan.period}
                  </span>
                </div>
                {plan.priceAlt ? (
                  <p className={`mt-2 text-sm ${plan.primary ? "text-white/68" : "text-stone-500"}`}>{plan.priceAlt}</p>
                ) : null}
                <p className={`mt-5 text-sm leading-7 ${plan.primary ? "text-white/78" : "text-stone-600"}`}>
                  {plan.summary}
                </p>

                <div className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div
                        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          plan.primary ? "bg-white/12 text-[#f8c89f]" : "bg-[#edf6f3] text-[#1f5a4e]"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className={`text-sm leading-7 ${plan.primary ? "text-white/82" : "text-stone-600"}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href={plan.href}
                  className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                    plan.primary
                      ? "bg-white text-[#1f3a36] hover:bg-[#fff4e8]"
                      : "border border-[#d8c2ad] text-stone-800 hover:bg-[#fff7f0]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
