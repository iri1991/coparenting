import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface InternalLink {
  href: string;
  label: string;
  description: string;
}

interface SeoInternalLinksProps {
  heading?: string;
  links: InternalLink[];
}

/**
 * Server component: semantic internal links section.
 * Strengthens topical authority and helps users navigate.
 */
export function SeoInternalLinks({
  heading = "Explorează mai mult",
  links,
}: SeoInternalLinksProps) {
  return (
    <section className="border-t border-[#ead9c8] py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="landing-display mb-8 text-2xl text-stone-900 sm:text-3xl">
          {heading}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-start justify-between gap-4 rounded-[1.4rem] border border-[#ead9c8] bg-white/80 p-5 transition hover:border-[#d4b49a] hover:bg-white hover:shadow-[0_10px_28px_rgba(28,25,23,0.07)]"
            >
              <div>
                <p className="font-semibold text-stone-900 group-hover:text-[#b85c3e] transition-colors">
                  {link.label}
                </p>
                <p className="mt-1 text-sm leading-6 text-stone-500">
                  {link.description}
                </p>
              </div>
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#b85c3e]" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
