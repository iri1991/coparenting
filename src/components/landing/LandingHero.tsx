"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CalendarHeart,
  MapPinned,
  Sparkles,
} from "lucide-react";
import { AnimateOnScroll } from "./AnimateOnScroll";
import { useLanguage } from "@/contexts/LanguageContext";

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
    visualTag: string;
    visualTitle: string;
    visualText: string;
    secondaryCaption: string;
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
    visualTag: "copilul simte claritatea",
    visualTitle: "Program clar, fără negocieri.",
    visualText:
      "Schimbările importante nu se pierd. Sunt explicate, logate și văzute de amândoi.",
    secondaryCaption: "mai puțin haos, mai multă prezență",
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
    visualTag: "casa are ritm",
    visualTitle: "Tot ce contează stă împreună.",
    visualText:
      "Rutinele, ideile și informațiile utile sunt ușor de găsit, fără liste pierdute și fără stres.",
    secondaryCaption: "mai puțină aglomerație mentală",
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

type HeroCopy = (typeof HERO_COPY)[HeroAudience];

function HeroVisual({ copy, compact = false, historicVisibilityLabel }: { copy: HeroCopy; compact?: boolean; historicVisibilityLabel: string }) {
  return (
    <div className="relative">
      <div className="absolute -left-4 top-10 h-28 w-28 rounded-full bg-[#99c6be]/20 blur-3xl" />
      <div className="absolute -right-6 bottom-16 h-24 w-24 rounded-full bg-[#f6b28b]/35 blur-3xl" />

      <div className={`grid gap-4 ${compact ? "" : "lg:grid-cols-[minmax(0,1fr)_18.5rem]"}`}>
        <div className="overflow-hidden rounded-[2.6rem] border border-white/70 bg-white/72 p-3 shadow-[0_30px_80px_rgba(28,25,23,0.12)] backdrop-blur">
          <div className="relative overflow-hidden rounded-[2.1rem] bg-[#f2e5d8]">
            <img
              src={copy.mainImage}
              alt={copy.mainAlt}
              className={`h-[22rem] w-full object-cover sm:h-[26rem] lg:h-[34rem] ${
                copy.mainPosition ?? "object-center"
              }`}
              loading="eager"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,12,10,0.03)_0%,rgba(14,12,10,0.48)_100%)]" />
            <div className="absolute left-4 top-4 rounded-full bg-white/88 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-700 backdrop-blur sm:left-5 sm:top-5 sm:text-xs">
              {copy.visualTag}
            </div>
            <div className="absolute bottom-4 left-4 right-4 max-w-[24rem] rounded-[1.7rem] bg-[#2f4b46]/88 p-4 text-white shadow-[0_20px_36px_rgba(16,24,40,0.24)] backdrop-blur sm:bottom-5 sm:left-5 sm:right-5 sm:p-5 lg:rounded-[1.9rem]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/65 sm:text-xs">
                    spațiu comun
                  </p>
                  <p className="landing-display mt-2 text-[1.9rem] leading-[0.95] sm:text-[2.1rem] lg:text-[2.2rem]">
                    {copy.visualTitle}
                  </p>
                </div>
                <BellRing className="mt-1 h-5 w-5 text-[#f8c89f]" />
              </div>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/82">{copy.visualText}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:pt-3">
          <div className="rounded-[1.9rem] border border-white/70 bg-white/90 p-4 shadow-[0_20px_40px_rgba(28,25,23,0.12)] backdrop-blur">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              <CalendarHeart className="h-4 w-4 text-[#b85c3e]" />
              {copy.boardTitle}
            </div>
            <div className="mt-4 space-y-3">
              {copy.boardRows.map((row) => (
                <div
                  key={row.day}
                  className="flex items-center justify-between rounded-[1.1rem] bg-[#faf3ec] px-3 py-2.5"
                >
                  <span className="text-sm font-semibold text-stone-500">{row.day}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.tone}`}>
                    {row.owner}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.9rem] border border-white/70 bg-white/82 shadow-[0_20px_40px_rgba(28,25,23,0.1)] backdrop-blur">
            <div className="relative">
              <img
                src={copy.secondaryImage}
                alt={copy.secondaryAlt}
                className={`h-44 w-full object-cover ${copy.secondaryPosition ?? "object-center"}`}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,12,10,0.03)_0%,rgba(14,12,10,0.35)_100%)]" />
              <div className="absolute bottom-4 left-4 rounded-full bg-white/88 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-700 backdrop-blur">
                {copy.secondaryCaption}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                <MapPinned className="h-4 w-4 text-[#b96a4b]" />
                {copy.insightTitle}
              </div>
              <p className="mt-3 text-base font-semibold leading-6 text-stone-900">
                {copy.insightText}
              </p>
              <div className="mt-4 rounded-[1.2rem] bg-[#eef5f3] px-3 py-2 text-sm font-medium text-[#1f5a4e]">
                {historicVisibilityLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingHero() {
  const { t } = useLanguage();
  const [audience, setAudience] = useState<HeroAudience>("two");

  // Build HERO_COPY from translations so it updates on language change
  const HERO_COPY_T: Record<HeroAudience, (typeof HERO_COPY)["two"]> = {
    two: {
      ...HERO_COPY.two,
      label: t.hero.twoHomes.label,
      eyebrow: t.hero.twoHomes.eyebrow,
      subtitle: t.hero.twoHomes.subtitle,
      chips: [...t.hero.twoHomes.chips] as [string, string, string],
      quote: t.hero.twoHomes.quote,
      boardTitle: t.hero.twoHomes.boardTitle,
      boardRows: t.hero.twoHomes.boardRows.map((r) => ({ ...r })) as typeof HERO_COPY.two.boardRows,
      insightTitle: t.hero.twoHomes.insightTitle,
      insightText: t.hero.twoHomes.insightText,
      visualTag: t.hero.twoHomes.visualTag,
      visualTitle: t.hero.twoHomes.visualTitle,
      visualText: t.hero.twoHomes.visualText,
      secondaryCaption: t.hero.twoHomes.secondaryCaption,
    },
    together: {
      ...HERO_COPY.together,
      label: t.hero.oneHome.label,
      eyebrow: t.hero.oneHome.eyebrow,
      subtitle: t.hero.oneHome.subtitle,
      chips: [...t.hero.oneHome.chips] as [string, string, string],
      quote: t.hero.oneHome.quote,
      boardTitle: t.hero.oneHome.boardTitle,
      boardRows: t.hero.oneHome.boardRows.map((r) => ({ ...r })) as typeof HERO_COPY.together.boardRows,
      insightTitle: t.hero.oneHome.insightTitle,
      insightText: t.hero.oneHome.insightText,
      visualTag: t.hero.oneHome.visualTag,
      visualTitle: t.hero.oneHome.visualTitle,
      visualText: t.hero.oneHome.visualText,
      secondaryCaption: t.hero.oneHome.secondaryCaption,
    },
  };
  const copy = HERO_COPY_T[audience];

  return (
    <section id="hero" className="relative overflow-hidden pb-18 pt-6 sm:pb-24 sm:pt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-center lg:gap-14">
          <div className="space-y-7 lg:max-w-xl">
            <AnimateOnScroll>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-600 shadow-[0_12px_30px_rgba(28,25,23,0.08)] backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-[#b85c3e]" />
                {copy.eyebrow}
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={70}>
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
                        ? "bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-white shadow-[0_12px_26px_rgba(191,106,75,0.22)]"
                        : "text-stone-600 hover:bg-white"
                    }`}
                  >
                    {HERO_COPY_T[key].label}
                  </button>
                ))}
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={120}>
              <div className="space-y-5">
                <h1 className="landing-display text-5xl leading-[0.94] text-stone-900 sm:text-6xl lg:text-[5.4rem]">
                  {t.hero.h1Line1}
                  <span className="mt-2 block text-[#b85c3e]">{t.hero.h1Line2}</span>
                </h1>
                <p className="max-w-xl text-lg leading-8 text-stone-600">{copy.subtitle}</p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={320}>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] px-7 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_rgba(191,106,75,0.22)] transition hover:brightness-[1.02] active:scale-[0.98]"
                >
                  {t.common.startFree}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#functionalitati"
                  className="inline-flex items-center justify-center rounded-full border border-[#d8c2ad] px-7 py-3.5 text-base font-semibold text-stone-700 transition hover:bg-white/70"
                >
                  {t.hero.seeExperience}
                </a>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={390}>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-stone-500">
                <span>14 zile Pro gratuit</span>
                <span>fără card</span>
                <span>un singur abonament pe familie</span>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={440} className="lg:hidden">
              <HeroVisual copy={copy} compact historicVisibilityLabel={t.hero.historicVisibility} />
            </AnimateOnScroll>

            <div className="flex flex-wrap gap-3">
              {copy.chips.map((text, index) => (
                <AnimateOnScroll key={text} delay={500 + index * 45} staggerIndex={index}>
                  <div className="rounded-full border border-[#ead9c8] bg-white/80 px-4 py-2 text-sm font-semibold text-stone-700 shadow-[0_10px_24px_rgba(28,25,23,0.05)] backdrop-blur">
                    {text}
                  </div>
                </AnimateOnScroll>
              ))}
            </div>

            <AnimateOnScroll delay={620}>
              <div className="max-w-xl rounded-[1.8rem] border border-[#ead9c8] bg-white/74 px-5 py-4 shadow-[0_18px_40px_rgba(28,25,23,0.06)] backdrop-blur">
                <p className="text-sm leading-7 text-stone-600">{copy.quote}</p>
              </div>
            </AnimateOnScroll>
          </div>

          <AnimateOnScroll delay={220} className="relative hidden lg:block">
            <HeroVisual copy={copy} historicVisibilityLabel={t.hero.historicVisibility} />
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
