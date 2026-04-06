import Image from "next/image";
import Link from "next/link";
import { BlogArticleWithCategory, formatBlogDate } from "@/content/blog";

type BlogArticleCardProps = {
  article: BlogArticleWithCategory;
  large?: boolean;
};

export function BlogArticleCard({ article, large = false }: BlogArticleCardProps) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_20px_60px_rgba(28,25,23,0.08)] backdrop-blur ${
        large ? "p-8 sm:p-10" : "p-6"
      }`}
    >
      {article.image ? (
        <div
          className={`relative overflow-hidden ${
            large ? "-mx-8 -mt-8 mb-8 sm:-mx-10 sm:-mt-10 sm:mb-10" : "-mx-6 -mt-6 mb-6"
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${article.category.surfaceClassName} opacity-70`} />
          <div className={`absolute inset-x-0 top-0 h-full bg-gradient-to-b ${article.category.surfaceClassName} opacity-60`} />
          <Image
            src={article.image.src}
            alt={article.image.alt}
            width={1200}
            height={720}
            className={`h-56 w-full object-cover ${large ? "sm:h-72" : ""}`}
          />
        </div>
      ) : (
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${article.category.surfaceClassName} opacity-90`}
        />
      )}
      <div className="relative">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${article.category.badgeClassName}`}>
            {article.category.title}
          </span>
          <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
            {formatBlogDate(article.publishedAt)}
          </span>
          <span className="text-xs uppercase tracking-[0.18em] text-stone-400">
            {article.readingTimeMinutes} min
          </span>
        </div>

        <h3
          className={`landing-display mt-5 text-balance text-stone-900 transition-colors group-hover:text-stone-700 ${
            large ? "text-3xl sm:text-4xl" : "text-2xl"
          }`}
        >
          <Link href={`/blog/${article.slug}`}>{article.title}</Link>
        </h3>

        <p className={`mt-4 max-w-2xl text-pretty text-stone-600 ${large ? "text-base leading-8" : "text-sm leading-7"}`}>
          {article.summary}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/blog/${article.slug}`}
            className="inline-flex items-center rounded-full bg-[#1f3a36] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#172c2a]"
          >
            Citește articolul
          </Link>
          <Link
            href={`/blog/categorie/${article.category.slug}`}
            className="inline-flex items-center rounded-full border border-[#dcc8b5] px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-[#f8f0e8]"
          >
            Vezi categoria
          </Link>
        </div>
      </div>
    </article>
  );
}
