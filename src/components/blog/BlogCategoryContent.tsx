"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { inter } from "@/lib/i18n/interpolate";
import type { BlogArticleWithCategory, BlogCategoryWithTranslation } from "@/content/blog";
import { BlogArticleCard } from "./BlogArticleCard";
import type { BlogSeoLink } from "@/lib/blog-seo-links";

interface Props {
  category: BlogCategoryWithTranslation;
  articles: BlogArticleWithCategory[];
  seoLinks: BlogSeoLink[];
}

export function BlogCategoryContent({ category, articles, seoLinks }: Props) {
  const { lang, t } = useLanguage();
  const isEn = lang === "en";
  const cl = t.blog.categoryListing;

  const blogBase = isEn ? "/en/blog" : "/blog";
  const catTitle = isEn ? category.titleEn ?? category.title : category.title;
  const catDesc = isEn ? category.descriptionEn ?? category.description : category.description;
  const backLabel = t.blog.backToBlog;
  const articlesCountLabel = inter(cl.articlesPublished, { n: String(articles.length) });
  const inCategoryLabel = cl.inCategory;
  const availableLabel = cl.availableArticles;

  return (
    <>
      <section className="px-4 pb-14 pt-14 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-stone-500">
            <Link href={blogBase} className="font-semibold text-[#1f3a36] hover:text-[#172c2a]">
              {backLabel}
            </Link>
            <span aria-hidden>›</span>
            <span className="text-stone-600">{catTitle}</span>
          </nav>

          <div className={`mt-6 rounded-[2.25rem] border border-white/70 bg-gradient-to-br ${category.surfaceClassName} p-8 shadow-[0_24px_70px_rgba(28,25,23,0.08)]`}>
            <span className={`inline-flex rounded-full px-4 py-1.5 text-sm font-semibold ${category.badgeClassName}`}>
              {catTitle}
            </span>
            <h1 className="landing-display mt-5 max-w-3xl text-balance text-5xl text-stone-900 sm:text-6xl">
              {catTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">{catDesc}</p>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
              {articlesCountLabel}
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">{inCategoryLabel}</p>
            <h2 className="landing-display mt-2 text-3xl text-stone-900">{availableLabel}</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {articles.map((article) => (
              <BlogArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* Cross-links to SEO landing pages */}
      {seoLinks.length > 0 && (
        <section className="px-4 pb-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                {isEn ? "Related tools & guides" : "Instrumente și ghiduri conexe"}
              </p>
              <h2 className="landing-display mt-2 text-3xl text-stone-900">
                {isEn ? "Useful resources" : "Resurse utile pentru tine"}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {seoLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex flex-col gap-2 rounded-[1.75rem] border border-[#ead9c8] bg-white/80 p-5 shadow-[0_8px_24px_rgba(28,25,23,0.05)] transition hover:-translate-y-0.5 hover:border-[#d4b99c] hover:shadow-[0_12px_32px_rgba(28,25,23,0.08)] backdrop-blur"
                >
                  <span className="text-sm font-bold text-stone-900 group-hover:text-[#1f3a36]">
                    {link.label} →
                  </span>
                  <span className="text-sm leading-6 text-stone-600">{link.description}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
