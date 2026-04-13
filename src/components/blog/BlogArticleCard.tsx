"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import type { BlogArticleWithCategory } from "@/content/blog";
import { formatBlogDate, articleSlugForLang } from "@/content/blog";

type BlogArticleCardProps = {
  article: BlogArticleWithCategory;
  large?: boolean;
};

export function BlogArticleCard({ article, large = false }: BlogArticleCardProps) {
  const { lang, t } = useLanguage();

  // Apply English translation if available and English is active
  const display = lang === "en" && article.en ? { ...article, ...article.en } : article;
  const hasEnglish = Boolean(article.en);

  return (
    <article
      className={`group relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_20px_60px_rgba(28,25,23,0.08)] backdrop-blur ${
        large ? "p-8 sm:p-10" : "p-6"
      }`}
    >
      {display.image ? (
        <div
          className={`relative overflow-hidden ${
            large ? "-mx-8 -mt-8 mb-8 sm:-mx-10 sm:-mt-10 sm:mb-10" : "-mx-6 -mt-6 mb-6"
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${display.category.surfaceClassName} opacity-70`} />
          <div className={`absolute inset-x-0 top-0 h-full bg-gradient-to-b ${display.category.surfaceClassName} opacity-60`} />
          <Image
            src={display.image.src}
            alt={display.image.alt}
            width={1200}
            height={720}
            className={`h-56 w-full object-cover ${large ? "sm:h-72" : ""}`}
          />
        </div>
      ) : (
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${display.category.surfaceClassName} opacity-90`}
        />
      )}
      <div className="relative">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${display.category.badgeClassName}`}>
            {display.category.title}
          </span>
          <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
            {formatBlogDate(display.publishedAt, lang)}
          </span>
          <span className="text-xs uppercase tracking-[0.18em] text-stone-400">
            {display.readingTimeMinutes} {t.blog.readingTime}
          </span>
          {/* Badge for articles not yet translated */}
          {lang === "en" && !hasEnglish && (
            <span className="rounded-full bg-[#f6eee5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8a4b2d]">
              RO
            </span>
          )}
        </div>

        <h3
          className={`landing-display mt-5 text-balance text-stone-900 transition-colors group-hover:text-stone-700 ${
            large ? "text-3xl sm:text-4xl" : "text-2xl"
          }`}
        >
          <Link href={lang === "en" ? `/en/blog/${articleSlugForLang(article, "en")}` : `/blog/${article.slug}`}>
            {display.title}
          </Link>
        </h3>

        <p className={`mt-4 max-w-2xl text-pretty text-stone-600 ${large ? "text-base leading-8" : "text-sm leading-7"}`}>
          {display.summary}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={lang === "en" ? `/en/blog/${articleSlugForLang(article, "en")}` : `/blog/${article.slug}`}
            className="inline-flex items-center rounded-full bg-[#1f3a36] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#172c2a]"
          >
            {lang === "en" ? "Read article" : "Citește articolul"}
          </Link>
          <Link
            href={lang === "en" ? `/en/blog/categorie/${display.category.slug}` : `/blog/categorie/${display.category.slug}`}
            className="inline-flex items-center rounded-full border border-[#dcc8b5] px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-[#f8f0e8]"
          >
            {lang === "en" ? "View category" : "Vezi categoria"}
          </Link>
        </div>
      </div>
    </article>
  );
}
