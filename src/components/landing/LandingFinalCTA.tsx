"use client";

import Link from "next/link";
import { AnimateOnScroll } from "./AnimateOnScroll";

export function LandingFinalCTA() {
  return (
    <section className="bg-gradient-to-b from-amber-50 to-stone-50 dark:from-stone-900 dark:to-stone-950 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <AnimateOnScroll>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
            Un program clar reduce tensiunea. Copilul simte diferența.
          </h2>
        </AnimateOnScroll>
        <AnimateOnScroll delay={100}>
          <p className="mt-4 text-stone-600 dark:text-stone-400">
            Începe gratuit, invită celălalt părinte și vezi propunerea automată pentru săptămâna viitoare.
          </p>
        </AnimateOnScroll>
        <AnimateOnScroll delay={200}>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-8 py-4 text-base font-medium text-white shadow-lg hover:bg-amber-600 active:scale-[0.98] transition"
            >
              Încearcă Pro 14 zile (fără card)
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border-2 border-stone-300 dark:border-stone-600 px-8 py-4 text-base font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              Începe pe Free
            </Link>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
