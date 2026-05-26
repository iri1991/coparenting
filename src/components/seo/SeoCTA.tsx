import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SeoCTAProps {
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  note?: string;
}

/**
 * Server component: final CTA block for SEO pages.
 */
export function SeoCTA({
  heading = "Începe să organizezi co-parentingul mai simplu",
  subheading = "Creează cont gratuit și încearcă HomeSplit 14 zile Pro, fără card.",
  ctaLabel = "Creează cont gratuit",
  ctaHref = "/register",
  note = "14 zile Pro gratuit · fără card · un abonament pentru amândoi",
}: SeoCTAProps) {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="rounded-[2.2rem] bg-[linear-gradient(135deg,#2f4b46_0%,#1f3a36_100%)] px-8 py-14 text-center shadow-[0_30px_80px_rgba(31,58,54,0.22)] sm:py-20">
          <h2 className="landing-display text-4xl leading-tight text-white sm:text-5xl">
            {heading}
          </h2>
          {subheading && (
            <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-white/80">
              {subheading}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] px-8 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(191,106,75,0.32)] transition hover:brightness-[1.04] active:scale-[0.98]"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {note && (
            <p className="mt-5 text-sm text-white/55">{note}</p>
          )}
        </div>
      </div>
    </section>
  );
}
