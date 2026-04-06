"use client";

import Link from "next/link";
import { AnimateOnScroll } from "./AnimateOnScroll";

export function LandingFinalCTA() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <AnimateOnScroll>
          <div className="relative overflow-hidden rounded-[2.8rem] bg-[#1f3a36] px-6 py-12 text-white shadow-[0_30px_80px_rgba(31,58,54,0.22)] sm:px-10 sm:py-14">
            <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-white/8 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-52 w-52 rounded-full bg-[#f6b28b]/18 blur-3xl" />

            <div className="relative z-10 text-center">
              <span className="inline-flex rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                Ultimul pas
              </span>
              <h2 className="landing-display mt-6 text-4xl leading-tight sm:text-5xl">
                Începe cu o săptămână mai clară. Restul vine natural.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/78">
                Creezi contul, inviți celălalt părinte dacă e cazul, pui programul de bază și lași produsul să scoată zgomotul din coordonarea zilnică.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/register?plan=pro"
                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#1f3a36] transition hover:bg-[#fff4e8]"
                >
                  Încearcă Pro 14 zile
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-full border border-white/16 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/8"
                >
                  Începe pe Free
                </Link>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
