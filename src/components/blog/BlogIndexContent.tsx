"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import type { BlogArticleWithCategory, BlogCategoryWithTranslation } from "@/content/blog";
import { BlogArticleCard } from "./BlogArticleCard";
import { articleSlugForLang } from "@/content/blog";

interface Props {
  articles: BlogArticleWithCategory[];
  featured: BlogArticleWithCategory | null;
  recentWithoutFeatured: BlogArticleWithCategory[];
  categories: BlogCategoryWithTranslation[];
}

export function BlogIndexContent({ articles, featured, recentWithoutFeatured, categories }: Props) {
  const { lang, t } = useLanguage();
  const bl = t.blog;

  const isEn = lang === "en";
  const blogBase = isEn ? "/en/blog" : "/blog";

  const h1 = isEn
    ? "Practical articles for families who need more calm and less chaos"
    : "Articole utile pentru familii care au nevoie de mai mult calm și mai puțin haos";
  const intro = isEn
    ? "We publish short and applied articles about co-parenting, child emotions, routines between two homes and connection activities. Each text draws from credible psychological, paediatric or educational sources and stays focused on what you can do concretely at home."
    : "Publicăm articole scurte și aplicate despre co-parenting, emoțiile copilului, rutine între două case și activități de conectare. Fiecare text pornește din surse psihologice, pediatrice sau educaționale credibile și rămâne orientat pe ce poți face concret acasă.";
  const editorialLabel = isEn ? "Editorial compass" : "Busolă editorială";
  const editorialItems = isEn
    ? [
        "We write in Romanian and translate important ideas into actionable steps for parents.",
        "We draw on sources such as AAP, CDC, Harvard, UNICEF, Child Mind and Raising Children Network.",
        "Articles are informational and do not replace psychological or medical assessment when there is risk.",
      ]
    : [
        "Scriem în română și traducem ideile importante în pași aplicabili pentru părinți.",
        "Ne bazăm pe surse precum AAP, CDC, Harvard, UNICEF, Child Mind sau Raising Children Network.",
        "Articolele sunt informative și nu înlocuiesc evaluarea psihologică ori medicală atunci când există risc.",
      ];

  const featuredLabel = isEn ? "Recommended article" : "Articol recomandat";
  const startHereLabel = isEn ? "Start here" : "Începe de aici";
  const openArticleLabel = isEn ? "Open article" : "Deschide articolul";
  const categoriesLabel = isEn ? "Categories" : "Categorii";
  const categoriesSectionTitle = isEn ? "Areas we cover" : "Zonele pe care le acoperim";
  const articlesCount = (n: number) => isEn ? `${n} articles available` : `${n} articole disponibile`;
  const recentLabel = isEn ? "Recent articles" : "Articole recente";
  const publishedRecentlyLabel = isEn ? "Published recently" : "Publicate recent";

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
                {h1}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-600">{intro}</p>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_20px_60px_rgba(28,25,23,0.08)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">{editorialLabel}</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-600">
                {editorialItems.map((item, i) => <li key={i}>{item}</li>)}
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
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">{featuredLabel}</p>
                <h2 className="landing-display mt-2 text-3xl text-stone-900">{startHereLabel}</h2>
              </div>
              <Link
                href={`${blogBase}/${articleSlugForLang(featured, lang)}`}
                className="text-sm font-semibold text-[#1f3a36] hover:text-[#172c2a]"
              >
                {openArticleLabel}
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
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">{categoriesLabel}</p>
            <h2 className="landing-display mt-2 text-3xl text-stone-900">{categoriesSectionTitle}</h2>
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
                  <p className="mt-4 text-base font-semibold text-stone-900">{articlesCount(count)}</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600">{catDesc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent articles */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">{recentLabel}</p>
            <h2 className="landing-display mt-2 text-3xl text-stone-900">{publishedRecentlyLabel}</h2>
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
