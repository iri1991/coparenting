import type { LucideIcon } from "lucide-react";

export interface SeoFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: string; // Tailwind bg + text tone class
}

interface SeoFeatureGridProps {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  features: SeoFeature[];
  columns?: 2 | 3;
}

/**
 * Server component: feature grid for SEO pages.
 * Matches the card design from the main landing.
 */
export function SeoFeatureGrid({
  eyebrow,
  heading,
  subheading,
  features,
  columns = 3,
}: SeoFeatureGridProps) {
  const gridCols =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          {eyebrow && (
            <span className="inline-flex rounded-full border border-[#ead9c8] bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              {eyebrow}
            </span>
          )}
          <h2 className="landing-display max-w-3xl text-4xl leading-tight text-stone-900 sm:text-5xl">
            {heading}
          </h2>
          {subheading && (
            <p className="max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">
              {subheading}
            </p>
          )}
        </div>

        <div className={`grid gap-5 ${gridCols}`}>
          {features.map((f) => {
            const Icon = f.icon;
            const accentClass = f.accent ?? "bg-[#f6dcc0] text-[#8a4b2d]";
            return (
              <div
                key={f.title}
                className="rounded-[1.8rem] border border-[#ead9c8] bg-white/88 p-6 shadow-[0_16px_36px_rgba(28,25,23,0.05)]"
              >
                <div
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${accentClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-stone-900">
                  {f.title}
                </h3>
                <p className="text-sm leading-7 text-stone-600">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
