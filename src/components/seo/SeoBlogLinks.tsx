import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { getArticlesForCategory } from "@/content/blog";

interface SeoBlogLinksProps {
  /** Blog category slug to pull articles from */
  categorySlug: string;
  /** Label for the category badge */
  categoryLabel: string;
  /** Section heading */
  heading?: string;
  /** Max number of articles to show */
  limit?: number;
}

/**
 * Server component: pulls recent blog articles from a given category and
 * renders them as a cross-linking section inside SEO landing pages.
 * Strengthens the topical authority mesh between guides and blog content.
 */
export function SeoBlogLinks({
  categorySlug,
  categoryLabel,
  heading = "Din blog",
  limit = 3,
}: SeoBlogLinksProps) {
  const articles = getArticlesForCategory(categorySlug, "ro").slice(0, limit);

  if (!articles.length) return null;

  return (
    <section className="border-t border-[#ead9c8] py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              {heading}
            </p>
            <h2 className="landing-display mt-3 text-2xl text-stone-900 sm:text-3xl">
              Articole despre {categoryLabel.toLowerCase()}
            </h2>
          </div>
          <Link
            href={`/blog/categorie/${categorySlug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#dcc8b5] bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-[#f8f0e8]"
          >
            Toate articolele <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group flex flex-col gap-3 rounded-[1.75rem] border border-[#ead9c8] bg-white/80 p-5 shadow-[0_6px_18px_rgba(28,25,23,0.05)] transition hover:-translate-y-0.5 hover:border-[#d4b99c] hover:shadow-[0_12px_32px_rgba(28,25,23,0.08)]"
            >
              <span
                className={`inline-flex self-start rounded-full px-3 py-1 text-xs font-semibold ${article.category.badgeClassName}`}
              >
                {article.category.title}
              </span>
              <p className="text-sm font-semibold leading-6 text-stone-900 group-hover:text-[#1f3a36] transition-colors line-clamp-2">
                {article.title}
              </p>
              <p className="text-xs leading-5 text-stone-500 line-clamp-2">{article.summary}</p>
              <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-[#1f3a36]">
                Citește <ArrowRight className="h-3 w-3" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
