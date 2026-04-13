"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import type { BlogArticleWithCategory } from "@/content/blog";
import { formatBlogDate } from "@/content/blog";

interface Props {
  articleRo: BlogArticleWithCategory;
  articleEn: BlogArticleWithCategory | null;
  relatedRo: BlogArticleWithCategory[];
  relatedEn: BlogArticleWithCategory[];
}

export function BlogArticleContent({ articleRo, articleEn, relatedRo, relatedEn }: Props) {
  const { lang, t } = useLanguage();

  const article = lang === "en" && articleEn ? articleEn : articleRo;
  const related = lang === "en" ? relatedEn : relatedRo;
  const hasEnglish = Boolean(articleEn);

  return (
    <>
      {/* Language unavailability notice */}
      {lang === "en" && !hasEnglish && (
        <div className="mx-auto mb-4 max-w-6xl px-4 sm:px-6">
          <div className="flex items-center gap-2 rounded-[1rem] border border-[#ead9c8] bg-[#fffcf8] px-4 py-2.5 text-sm text-stone-600">
            <span className="rounded-full bg-[#f6eee5] px-2 py-0.5 text-[11px] font-bold text-[#8a4b2d]">RO</span>
            This article is currently available in Romanian only.
          </div>
        </div>
      )}

      <section className="px-4 pb-16 pt-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Link href={lang === "en" ? "/en/blog" : "/blog"} className="text-sm font-semibold text-[#1f3a36] hover:text-[#172c2a]">
            {t.blog.backToBlog}
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <article className="overflow-hidden rounded-[2.25rem] border border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(28,25,23,0.08)] backdrop-blur">
              <div className={`bg-gradient-to-br ${article.category.surfaceClassName} px-6 py-8 sm:px-8 sm:py-10`}>
                <Link
                  href={`/blog/categorie/${article.category.slug}`}
                  className={`inline-flex rounded-full px-4 py-1.5 text-sm font-semibold ${article.category.badgeClassName}`}
                >
                  {article.category.title}
                </Link>
                <h1 className="landing-display mt-5 max-w-4xl text-balance text-4xl text-stone-900 sm:text-5xl">
                  {article.title}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-stone-600 sm:text-lg">{article.summary}</p>
                <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                  <span>{formatBlogDate(article.publishedAt, lang)}</span>
                  <span>{article.readingTimeMinutes} {t.blog.readingTime}</span>
                </div>
              </div>

              {article.image ? (
                <div className="border-y border-[#efe3d6] bg-[#fcf8f2] p-4 sm:p-6">
                  <div className="overflow-hidden rounded-[1.75rem]">
                    <Image
                      src={article.image.src}
                      alt={article.image.alt}
                      width={1200}
                      height={720}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                </div>
              ) : null}

              <div className="px-6 py-8 sm:px-8">
                <p className="text-base leading-8 text-stone-700">{article.intro}</p>

                <div className="mt-10 space-y-10">
                  {article.sections.map((section) => (
                    <section key={section.title}>
                      <h2 className="landing-display text-3xl text-stone-900">{section.title}</h2>
                      <div className="mt-4 space-y-4">
                        {section.paragraphs.map((paragraph, i) => (
                          <p key={i} className="text-base leading-8 text-stone-700">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                      {section.bullets?.length ? (
                        <ul className="mt-5 space-y-3">
                          {section.bullets.map((bullet, i) => (
                            <li key={i} className="flex gap-3 text-base leading-8 text-stone-700">
                              <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-[#1f3a36]" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </section>
                  ))}
                </div>
              </div>
            </article>

            <aside className="space-y-6 lg:sticky lg:top-28">
              <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_44px_rgba(28,25,23,0.06)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">{t.blog.summaryLabel}</p>
                <ul className="mt-4 space-y-3">
                  {article.takeaways.map((takeaway, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-7 text-stone-700">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#1f3a36]" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_44px_rgba(28,25,23,0.06)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">{t.blog.sourcesLabel}</p>
                <ul className="mt-4 space-y-4">
                  {/* Sources are always in the original language (URLs/publishers don't change) */}
                  {articleRo.sources.map((source) => (
                    <li key={source.url}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-[#1f3a36] hover:text-[#172c2a]"
                      >
                        {source.title}
                      </a>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-400">{source.publisher}</p>
                      <p className="mt-2 text-sm leading-7 text-stone-600">{source.note}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-[2rem] border border-[#ead7c5] bg-[#fcf5ed] p-6">
                <p className="text-sm leading-7 text-stone-700">{t.blog.disclaimer}</p>
              </section>
            </aside>
          </div>
        </div>
      </section>

      {related.length ? (
        <section className="px-4 pb-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">{t.blog.relatedLabel}</p>
              <h2 className="landing-display mt-2 text-3xl text-stone-900">{t.blog.relatedTitle}</h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {related.map((a) => (
                <RelatedCard key={a.slug} article={a} readLabel={lang === "en" ? "Read article" : "Citește articolul"} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function RelatedCard({ article, readLabel }: { article: BlogArticleWithCategory; readLabel: string }) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(28,25,23,0.08)] backdrop-blur">
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${article.category.badgeClassName}`}>
        {article.category.title}
      </span>
      <h3 className="landing-display mt-4 text-balance text-2xl text-stone-900">
        <Link href={`/blog/${article.slug}`}>{article.title}</Link>
      </h3>
      <p className="mt-3 text-sm leading-7 text-pretty text-stone-600">{article.summary}</p>
      <Link
        href={`/blog/${article.slug}`}
        className="mt-5 inline-flex items-center rounded-full bg-[#1f3a36] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#172c2a]"
      >
        {readLabel}
      </Link>
    </article>
  );
}
