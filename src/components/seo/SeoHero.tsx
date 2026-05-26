import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SeoHeroProps {
  eyebrow?: string;
  h1: string;
  h1Accent?: string;
  subtitle: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  trustPills?: string[];
}

/**
 * Server component: hero section for SEO landing pages.
 * Compact, focused, uses the same warm palette as the main landing.
 */
export function SeoHero({
  eyebrow,
  h1,
  h1Accent,
  subtitle,
  ctaLabel = "Încearcă HomeSplit",
  ctaHref = "/register",
  secondaryLabel,
  secondaryHref = "/#functionalitati",
  trustPills,
}: SeoHeroProps) {
  return (
    <section className="relative overflow-hidden pb-16 pt-8 sm:pb-20 sm:pt-12">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        {eyebrow && (
          <div className="mb-6 inline-flex rounded-full border border-[#ead9c8] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            {eyebrow}
          </div>
        )}
        <h1 className="landing-display text-4xl leading-[0.95] text-stone-900 sm:text-5xl lg:text-6xl">
          {h1}
          {h1Accent && (
            <span className="mt-1 block text-[#b85c3e]">{h1Accent}</span>
          )}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-stone-600">
          {subtitle}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] px-7 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_rgba(191,106,75,0.22)] transition hover:brightness-[1.02] active:scale-[0.98]"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          {secondaryLabel && (
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center rounded-full border border-[#d8c2ad] px-7 py-3.5 text-base font-semibold text-stone-700 transition hover:bg-white/70"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
        {trustPills && trustPills.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {trustPills.map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-[#ead9c8] bg-white/80 px-3.5 py-1.5 text-sm font-semibold text-stone-600"
              >
                {pill}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
