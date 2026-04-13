"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import type { BlogArticleWithCategory, BlogCategoryWithTranslation } from "@/content/blog";
import { BlogArticleCard } from "./BlogArticleCard";
import { articleSlugForLang } from "@/content/blog";
import { inter } from "@/lib/i18n/interpolate";

interface Props {
  articles: BlogArticleWithCategory[];
  featured: BlogArticleWithCategory | null;
  recentWithoutFeatured: BlogArticleWithCategory[];
  categories: BlogCategoryWithTranslation[];
}

export function BlogIndexContent({ articles, featured, recentWithoutFeatured, categories }: Props) {
  const { lang, t } = useLanguage();
  const bl = t.blog;
  const ix = bl.index;

  const isEn = lang === "en";
  const blogBase = isEn ? "/en/blog" : "/blog";

  return (
    <>
      {/* Hero */}
      <section className="px-4 pb-12 pt-14 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <span className="inline-flex rounded-full border border-[#d8c7b6] bg-white/75 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-stone-600">
                {bl.title}
              </span>
              <h1 className="landing-display mt-6 max-w-3xl text-balance text-5xl text-stone-900 sm:text-6xl">
                {ix.heroTitle}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-600">{ix.heroIntro}</p>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_20px_60px_rgba(28,25,23,0.08)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">{ix.editorialLabel}</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-600">
                {ix.editorialItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`${blogBase}/categorie/${category.slug}`}
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold ${category.badgeClassName}`}
                  >
                    {isEn ? category.titleEn ?? category.title : category.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured ? (
        <section className="px-4 pb-12 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">{ix.featuredLabel}</p>
                <h2 className="landing-display mt-2 text-3xl text-stone-900">{ix.startHere}</h2>
              </div>
              <Link
                href={`${blogBase}/${articleSlugForLang(featured, lang)}`}
                className="text-sm font-semibold text-[#1f3a36] hover:text-[#172c2a]"
              >
                {ix.openArticle}
              </Link>
            </div>
            <BlogArticleCard article={featured} large />
          </div>
        </section>
      ) : null}

      {/* Category grid */}
      <section className="px-4 pb-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">{ix.categoriesLabel}</p>
            <h2 className="landing-display mt-2 text-3xl text-stone-900">{ix.categoriesSectionTitle}</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => {
              const count = articles.filter((a) => a.category.slug === category.slug).length;
              const catTitle = isEn ? category.titleEn ?? category.title : category.title;
              const catDesc = isEn ? category.descriptionEn ?? category.description : category.description;
              return (
                <Link
                  key={category.slug}
                  href={`${blogBase}/categorie/${category.slug}`}
                  className={`rounded-[2rem] border border-white/70 bg-gradient-to-br ${category.surfaceClassName} p-6 shadow-[0_16px_40px_rgba(28,25,23,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(28,25,23,0.08)]`}
                >
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${category.badgeClassName}`}>
                    {catTitle}
                  </span>
                  <p className="mt-4 text-base font-semibold text-stone-900">
                    {inter(ix.articlesAvailable, { n: String(count) })}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-stone-600">{catDesc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">{ix.recentLabel}</p>
              <h2 className="landing-display mt-2 text-3xl text-stone-900">{ix.publishedRecently}</h2>
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {recentWithoutFeatured.map((article) => (
              <BlogArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
