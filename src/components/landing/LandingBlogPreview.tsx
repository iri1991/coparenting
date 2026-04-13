"use client";

import Link from "next/link";
import { getAllBlogArticlesLocalized } from "@/content/blog";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard";
import { useLanguage } from "@/contexts/LanguageContext";

export function LandingBlogPreview() {
  const { t, lang } = useLanguage();
  const latestArticles = getAllBlogArticlesLocalized(lang).slice(0, 3);

  const categoryLabels =
    lang === "en"
      ? ["Co-parenting", "Emotions & safety", "Routines & transitions", "Activities & connection"]
      : ["Co-parenting", "Emoții & siguranță", "Rutine & tranziții", "Activități & conectare"];

  const sectionTitle =
    lang === "en"
      ? "Practical resources for co-parenting, regulation and activities"
      : "Resurse zilnice pentru co-parenting, reglare și activități";

  const sectionText =
    lang === "en"
      ? "We build a public blog with articles relevant to families going through separation, handovers, routine changes or emotionally heavy days. Each article draws from credible psychological and paediatric sources, not generic marketing copy."
      : "Construim un blog public, în română, cu articole relevante pentru familii care trec prin separare, handover-uri, schimbări de rutină sau zile grele emoțional. Fiecare articol pornește din surse psihologice și pediatrice credibile, nu din texte generice de marketing.";

  const whatYouFindLabel = lang === "en" ? "What you'll find here" : "Ce vei găsi aici";
  const shortDesc =
    lang === "en"
      ? "We publish short, applied and clear articles designed for parents who need practical ideas, not useless theory."
      : "Publicăm articole scurte, aplicate și clare, gândite pentru părinți care au nevoie de idei practice, nu de teorie fără folos.";

  const allArticlesLabel = lang === "en" ? "See all articles" : "Vezi toate articolele";

  return (
    <section id="blog" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <span className="inline-flex rounded-full border border-[#d8c7b6] bg-white/75 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-stone-600">
              {t.blog.title}
            </span>
            <h2 className="landing-display mt-6 max-w-xl text-4xl text-stone-900 sm:text-5xl">
              {sectionTitle}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-stone-600">{sectionText}</p>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-[0_20px_60px_rgba(28,25,23,0.06)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">{whatYouFindLabel}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {categoryLabels.map((item) => (
                <span key={item} className="rounded-full border border-[#e5d4c4] bg-[#faf3eb] px-3 py-1.5 text-sm font-semibold text-stone-700">
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-stone-600">{shortDesc}</p>
            <Link href="/blog" className="mt-6 inline-flex items-center rounded-full bg-[#1f3a36] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#172c2a]">
              {allArticlesLabel}
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {latestArticles.map((article) => (
            <BlogArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
