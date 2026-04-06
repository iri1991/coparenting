"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CalendarHeart,
  HeartHandshake,
  MapPinned,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AnimateOnScroll } from "./AnimateOnScroll";

type HeroAudience = "two" | "together";

const HERO_COPY: Record<
  HeroAudience,
  {
    label: string;
    eyebrow: string;
    subtitle: string;
    chips: string[];
    quote: string;
    boardTitle: string;
    boardRows: { day: string; owner: string; tone: string }[];
    insightTitle: string;
    insightText: string;
    mainImage: string;
    secondaryImage: string;
    mainAlt: string;
    secondaryAlt: string;
    mainPosition?: string;
    secondaryPosition?: string;
  }
> = {
  two: {
    label: "Două adrese",
    eyebrow: "Pentru familii care coordonează între două locuințe",
    subtitle:
      "Calendarul, handover-ul, schimbările sensibile și notificările importante rămân într-un loc comun. Mai puțină tensiune, mai multă predictibilitate pentru copil.",
    chips: [
      "handover cu detalii clare",
      "istoric complet al schimbărilor",
      "notificări când se modifică ceva important",
    ],
    quote:
      "„Nu mai căutăm în conversații. Vedem exact ce s-a decis și când s-a schimbat.”",
    boardTitle: "Săptămâna copilului",
    boardRows: [
      { day: "Lun", owner: "acasă la mama", tone: "bg-[#f6d7bf] text-[#8a4b2d]" },
      { day: "Mie", owner: "balet + handover 18:30", tone: "bg-[#d6ebe5] text-[#1f5a4e]" },
      { day: "Vin", owner: "acasă la tata", tone: "bg-[#f6e7c7] text-[#7a5620]" },
    ],
    insightTitle: "Actualizare excepțională",
    insightText:
      "Dacă un eveniment din trecut se schimbă, amândoi vedeți ce s-a modificat, de ce și cine a făcut actualizarea.",
    mainImage:
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1600&q=80",
    secondaryImage:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80",
    mainAlt: "Părinte și copil într-un moment calm afară",
    secondaryAlt: "Părinte și copil într-un moment cald acasă",
    mainPosition: "object-center",
    secondaryPosition: "object-center",
  },
  together: {
    label: "O casă",
    eyebrow: "Pentru familii care vor mai puțină încărcare mentală acasă",
    subtitle:
      "Ritualuri, activități, idei, documente și notificări trăiesc într-un spațiu calm, gândit pentru viața reală de familie, nu pentru task-uri sterile.",
    chips: [
      "ritualuri comune care se repetă natural",
      "idei de ieșit și jurnal de activități",
      "documente și informații utile la îndemână",
    ],
    quote:
      "„Pare mai mult un spațiu de familie decât o aplicație. Exact asta aveam nevoie.”",
    boardTitle: "Săptămâna voastră",
    boardRows: [
      { day: "Mar", owner: "înot 17:00", tone: "bg-[#f6d7bf] text-[#8a4b2d]" },
      { day: "Joi", owner: "tema + pian", tone: "bg-[#d6ebe5] text-[#1f5a4e]" },
      { day: "Dum", owner: "parc + bunici", tone: "bg-[#f6e7c7] text-[#7a5620]" },
    ],
    insightTitle: "Ritual de seară",
    insightText:
      "Checklist simplu pentru duș, dinți, poveste și somn. Același ritm, fără să mai țineți totul în cap.",
    mainImage:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1600&q=80",
    secondaryImage:
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80",
    mainAlt: "Părinte și copil într-un moment liniștit acasă",
    secondaryAlt: "Copil într-un moment relaxat de joacă",
    mainPosition: "object-center",
    secondaryPosition: "object-center",
  },
};

const VALUE_POINTS = [
  { icon: CalendarHeart, label: "Calendar viu", sub: "programul e clar fără negocieri repetitive" },
  { icon: HeartHandshake, label: "Handover calm", sub: "predarea vine cu context, nu cu stres" },
  { icon: ShieldCheck, label: "Trasabilitate", sub: "schimbările importante rămân logate" },
];

export function LandingHero() {
  const [audience, setAudience] = useState<HeroAudience>("two");
  const copy = HERO_COPY[audience];

  return (
    <section id="hero" className="relative overflow-hidden pb-18 pt-6 sm:pb-24 sm:pt-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.03fr)_minmax(0,0.97fr)] lg:items-center">
          <div className="space-y-8">
            <AnimateOnScroll>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-600 shadow-[0_12px_30px_rgba(28,25,23,0.08)] backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-[#b85c3e]" />
                {copy.eyebrow}
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={80}>
              <div
                className="inline-flex rounded-full border border-[#ead9c8] bg-[#fff5eb]/90 p-1 shadow-[0_12px_30px_rgba(28,25,23,0.05)]"
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
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      audience === key
                        ? "bg-[#1f3a36] text-white shadow-[0_12px_26px_rgba(31,58,54,0.22)]"
                        : "text-stone-600 hover:bg-white"
                    }`}
                  >
                    {HERO_COPY[key].label}
                  </button>
                ))}
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={120}>
              <div className="max-w-2xl space-y-5">
                <h1 className="landing-display text-5xl leading-[0.95] text-stone-900 sm:text-6xl lg:text-7xl">
                  Face loc pentru copil.
                  <span className="mt-2 block text-[#b85c3e]">Nu pentru încă un șir de mesaje.</span>
                </h1>
                <p className="max-w-xl text-lg leading-8 text-stone-600">{copy.subtitle}</p>
              </div>
            </AnimateOnScroll>

            <div className="flex flex-wrap gap-3" key={audience}>
              {copy.chips.map((text, index) => (
                <AnimateOnScroll key={text} delay={180 + index * 55} staggerIndex={index}>
                  <div className="rounded-full border border-[#ead9c8] bg-white/80 px-4 py-2 text-sm font-semibold text-stone-700 shadow-[0_10px_24px_rgba(28,25,23,0.05)] backdrop-blur">
                    {text}
                  </div>
                </AnimateOnScroll>
              ))}
            </div>

            <AnimateOnScroll delay={320}>
              <div className="rounded-[2rem] border border-[#ead9c8] bg-white/72 p-5 shadow-[0_20px_50px_rgba(28,25,23,0.08)] backdrop-blur">
                <p className="text-sm leading-7 text-stone-600">{copy.quote}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {VALUE_POINTS.map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="rounded-[1.4rem] bg-[#fff7f0] p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f6dcc0] text-[#8a4b2d]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-3 text-sm font-extrabold text-stone-900">{label}</p>
                      <p className="mt-1 text-sm leading-6 text-stone-600">{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={480}>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1f3a36] px-7 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_rgba(31,58,54,0.22)] transition hover:bg-[#172c2a] active:scale-[0.98]"
                >
                  Începe gratuit
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#functionalitati"
                  className="inline-flex items-center justify-center rounded-full border border-[#d8c2ad] px-7 py-3.5 text-base font-semibold text-stone-700 transition hover:bg-white/70"
                >
                  Vezi experiența
                </a>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={600}>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-stone-500">
                <span>14 zile Pro gratuit</span>
                <span>fără card</span>
                <span>un singur abonament pe familie</span>
              </div>
            </AnimateOnScroll>
          </div>

          <AnimateOnScroll delay={260} className="relative">
            <div className="relative isolate mx-auto max-w-[38rem]">
              <div className="absolute -left-8 top-10 h-28 w-28 rounded-full bg-[#99c6be]/25 blur-3xl" />
              <div className="absolute -right-4 bottom-12 h-24 w-24 rounded-full bg-[#f6b28b]/35 blur-3xl" />

              <div className="grid gap-4 lg:grid-cols-[minmax(0,0.64fr)_minmax(0,0.36fr)]">
                <div className="overflow-hidden rounded-[2.4rem] border border-white/70 bg-white/72 p-3 shadow-[0_30px_80px_rgba(28,25,23,0.12)] backdrop-blur">
                  <div className="relative h-full overflow-hidden rounded-[2rem] bg-[#f2e5d8]">
                    <img
                      src={copy.mainImage}
                      alt={copy.mainAlt}
                      className={`h-[25rem] w-full object-cover sm:h-[34rem] ${copy.mainPosition ?? "object-center"}`}
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,12,10,0.02)_0%,rgba(14,12,10,0.45)_100%)]" />
                    <div className="absolute left-5 top-5 rounded-full bg-white/86 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700 backdrop-blur">
                      copilul simte claritatea
                    </div>
                    <div className="absolute bottom-5 left-5 right-5 rounded-[1.8rem] bg-[#1f3a36]/88 p-5 text-white shadow-[0_20px_36px_rgba(16,24,40,0.24)] backdrop-blur">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/65">spațiu comun</p>
                          <p className="landing-display mt-2 text-3xl leading-none">Program cu ritm.</p>
                        </div>
                        <BellRing className="mt-1 h-5 w-5 text-[#f8c89f]" />
                      </div>
                      <p className="mt-3 max-w-xs text-sm leading-6 text-white/80">
                        Schimbările importante nu se pierd. Sunt logate, explicate și văzute de amândoi.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[1.8rem] border border-white/70 bg-white/90 p-4 shadow-[0_20px_40px_rgba(28,25,23,0.12)] backdrop-blur">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                      <CalendarHeart className="h-4 w-4 text-[#b85c3e]" />
                      {copy.boardTitle}
                    </div>
                    <div className="mt-4 space-y-3">
                      {copy.boardRows.map((row) => (
                        <div key={row.day} className="flex items-center justify-between rounded-[1.1rem] bg-[#faf3ec] px-3 py-2.5">
                          <span className="text-sm font-semibold text-stone-500">{row.day}</span>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.tone}`}>
                            {row.owner}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/78 shadow-[0_20px_40px_rgba(28,25,23,0.1)] backdrop-blur">
                    <div className="relative">
                      <img
                        src={copy.secondaryImage}
                        alt={copy.secondaryAlt}
                        className={`h-52 w-full object-cover ${copy.secondaryPosition ?? "object-center"}`}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,12,10,0.02)_0%,rgba(14,12,10,0.35)_100%)]" />
                      <div className="absolute bottom-4 left-4 rounded-full bg-white/88 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-700 backdrop-blur">
                        mai puțin haos, mai multă prezență
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.8rem] border border-white/70 bg-white/92 p-4 shadow-[0_20px_40px_rgba(28,25,23,0.12)] backdrop-blur">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                      <MapPinned className="h-4 w-4 text-[#1f5a4e]" />
                      {copy.insightTitle}
                    </div>
                    <p className="mt-3 text-base font-semibold leading-6 text-stone-900">{copy.insightText}</p>
                    <div className="mt-4 rounded-[1.2rem] bg-[#eef5f3] px-3 py-2 text-sm font-medium text-[#1f5a4e]">
                      istoric vizibil + notificare către celălalt părinte
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
