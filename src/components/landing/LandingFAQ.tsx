"use client";

import { useState } from "react";
import { AnimateOnScroll } from "./AnimateOnScroll";

const FAQ_ITEMS = [
  {
    q: "Trebuie instalată aplicația?",
    a: "Nu. E o web app: o folosești direct din browser. Dacă vrei, o poți salva pe ecran ca icon.",
  },
  {
    q: "Trial-ul cere card?",
    a: "Nu. Ai 14 zile Pro gratuit, fără card.",
  },
  {
    q: "Ce se întâmplă după trial?",
    a: "Dacă nu activezi abonamentul, rămâi pe Free.",
  },
  {
    q: "Plătește fiecare părinte?",
    a: "Nu. Un singur abonament acoperă ambii părinți.",
  },
  {
    q: "Cum funcționează „propunerea de duminică”?",
    a: "Aplicația generează automat programul săptămânii viitoare din zile blocate + activități recurente (și reguli, dacă sunt setate).",
  },
  {
    q: "Pot gestiona mai mulți copii?",
    a: "Da. Pro acoperă 1–3 copii, iar Family+ nelimitat.",
  },
  {
    q: "Documentele sunt în siguranță?",
    a: "Da, acces doar pe invitație. Datele sunt stocate în siguranță și nu sunt partajate cu terți.",
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
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="intrebari" className="py-16 sm:py-24" aria-labelledby="faq-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <AnimateOnScroll>
          <h2 id="faq-heading" className="text-center text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
            Întrebări frecvente
          </h2>
        </AnimateOnScroll>
        <div className="mt-10 space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <AnimateOnScroll key={item.q} delay={i * 50}>
              <div
                className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-stone-900 dark:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                >
                  <span>{item.q}</span>
                  <span
                    className={`ml-2 shrink-0 text-stone-400 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {openIndex === i && (
                  <div className="border-t border-stone-100 dark:border-stone-800 px-5 py-4 text-sm text-stone-600 dark:text-stone-400">
                    {item.a}
                  </div>
                )}
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
