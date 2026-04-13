"use client";

import { useState } from "react";
import { AnimateOnScroll } from "./AnimateOnScroll";
import { useLanguage } from "@/contexts/LanguageContext";

const FAQ_ITEMS = [
  {
    q: "Este doar pentru părinți separați sau divorțați?",
    a: "Nu. HomeSplit este util și pentru familii care locuiesc împreună și vor un loc clar pentru activități, ritualuri, idei și documente. Funcțiile de handover și coordonare între două locuințe devin esențiale când programul copilului se împarte.",
  },
  {
    q: "Trebuie instalată din App Store sau Google Play?",
    a: "Nu. Se folosește ca web app direct din browser și poate fi salvată pe ecran ca icon, dacă vrei acces rapid.",
  },
  {
    q: "Trial-ul cere card?",
    a: "Nu. Trial-ul Pro de 14 zile pornește fără card.",
  },
  {
    q: "Dacă nu plătim după trial, pierdem datele?",
    a: "Nu. Revii pe planul Free și păstrezi datele. Poți face upgrade ulterior.",
  },
  {
    q: "Cum funcționează modificările sensibile sau retroactive?",
    a: "Când există o schimbare importantă, produsul poate loga acțiunea și o poate face clară pentru celălalt părinte, astfel încât contextul să nu se piardă.",
  },
  {
    q: "Există și recomandări pentru activități cu copilul?",
    a: "Da. Tab-ul Idei oferă sugestii generate cu AI, ținând cont de context, iar jurnalul păstrează memoria activităților deja făcute.",
  },
  {
    q: "Putem avea ritualuri comune?",
    a: "Da. Puteți defini ritualuri repetitive, astfel încât copilul să simtă același ritm, indiferent unde se află.",
  },
  {
    q: "Avem și istoric medical + plan de tratament cu notificări?",
    a: "Da. În tab-ul dedicat copilului ai timeline de boli (dată început + dată sfârșit/încheiere), rapoarte medicale atașate pe boală, plan de tratament cu interval (zilnic sau la N zile), ore de administrare, reminder pentru părintele responsabil și istoric cu medicamentele administrate în trecut.",
  },
  {
    q: "Datele copilului sunt în siguranță?",
    a: "Accesul este controlat, iar produsul tratează datele sensibile ca informații care trebuie protejate, nu doar stocate.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export function LandingFAQ() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const items = t.faq.items;

  return (
    <section id="intrebari" className="py-16 sm:py-24" aria-labelledby="faq-heading">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <AnimateOnScroll>
          <div className="text-center">
            <span className="inline-flex rounded-full border border-[#ead9c8] bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              {t.faq.sectionLabel}
            </span>
            <h2 id="faq-heading" className="landing-display mt-5 text-4xl leading-tight text-stone-900 sm:text-5xl">
              {t.faq.heading}
            </h2>
          </div>
        </AnimateOnScroll>

        <div className="mt-12 space-y-3">
          {items.map((item, index) => (
            <AnimateOnScroll key={item.q} delay={index * 60}>
              <div className="overflow-hidden rounded-[1.8rem] border border-[#ead9c8] bg-white/88 shadow-[0_16px_36px_rgba(28,25,23,0.05)]">
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                >
                  <span className="text-base font-semibold leading-7 text-stone-900">{item.q}</span>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff3e7] text-stone-500 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {openIndex === index ? (
                  <div className="border-t border-[#f0e3d7] px-5 py-5 text-sm leading-7 text-stone-600">{item.a}</div>
                ) : null}
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
