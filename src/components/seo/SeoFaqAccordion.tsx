"use client";

import { useState } from "react";
import { siteUrl } from "@/lib/seo";

export interface FaqItem {
  q: string;
  a: string;
}

interface SeoFaqAccordionProps {
  eyebrow?: string;
  heading?: string;
  items: FaqItem[];
  /** Page URL for FAQPage JSON-LD @id */
  pageUrl?: string;
}

/**
 * Client component: interactive FAQ accordion with FAQPage JSON-LD schema.
 */
export function SeoFaqAccordion({
  eyebrow = "Întrebări frecvente",
  heading = "Întrebări & răspunsuri",
  items,
  pageUrl,
}: SeoFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(pageUrl ? { "@id": `${siteUrl}${pageUrl}` } : {}),
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section className="py-16 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <span className="inline-flex rounded-full border border-[#ead9c8] bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            {eyebrow}
          </span>
          <h2 className="landing-display mt-5 text-4xl leading-tight text-stone-900 sm:text-5xl">
            {heading}
          </h2>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.q}
              className="overflow-hidden rounded-[1.8rem] border border-[#ead9c8] bg-white/88 shadow-[0_16px_36px_rgba(28,25,23,0.05)]"
            >
              <button
                type="button"
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                aria-expanded={openIndex === index}
              >
                <span className="text-base font-semibold leading-7 text-stone-900">
                  {item.q}
                </span>
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff3e7] text-stone-500 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </button>
              {openIndex === index && (
                <div className="border-t border-[#f0e3d7] px-5 py-5 text-sm leading-7 text-stone-600">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
