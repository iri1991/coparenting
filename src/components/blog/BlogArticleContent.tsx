"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import type { BlogArticleWithCategory } from "@/content/blog";
import { formatBlogDate, articleSlugForLang } from "@/content/blog";
import type { BlogSeoLink } from "@/lib/blog-seo-links";

interface Props {
  articleRo: BlogArticleWithCategory;
  articleEn: BlogArticleWithCategory | null;
  relatedRo: BlogArticleWithCategory[];
  relatedEn: BlogArticleWithCategory[];
  seoLinks: BlogSeoLink[];
}

export function BlogArticleContent({ articleRo, articleEn, relatedRo, relatedEn, seoLinks }: Props) {
  const { lang, t } = useLanguage();

  const article = lang === "en" && articleEn ? articleEn : articleRo;
  const related = lang === "en" ? relatedEn : relatedRo;
  const hasEnglish = Boolean(articleEn);
  const isEn = lang === "en";

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
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-stone-500">
            <Link href={isEn ? "/en/blog" : "/blog"} className="font-semibold text-[#1f3a36] hover:text-[#172c2a]">
              {t.blog.backToBlog}
            </Link>
            <span aria-hidden>›</span>
            <Link
              href={`${isEn ? "/en" : ""}/blog/categorie/${articleRo.categorySlug}`}
              className="hover:text-stone-700"
            >
              {article.category.title}
            </Link>
          </nav>

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <article className="overflow-hidden rounded-[2.25rem] border border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(28,25,23,0.08)] backdrop-blur">
              <div className={`bg-gradient-to-br ${article.category.surfaceClassName} px-6 py-8 sm:px-8 sm:py-10`}>
                <Link
                  href={`${isEn ? "/en" : ""}/blog/categorie/${article.category.slug}`}
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
              {/* Takeaways */}
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

              {/* Cross-links to SEO pages — always visible in sidebar */}
              {seoLinks.length > 0 && (
                <section className="rounded-[2rem] border border-[#ead9c8] bg-[#fcf8f4] p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                    {isEn ? "Related guides" : "Ghiduri conexe"}
                  </p>
                  <ul className="mt-4 space-y-3">
                    {seoLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="block text-sm font-semibold text-[#1f3a36] hover:text-[#172c2a]"
                        >
                          {link.label} →
                        </Link>
                        <p className="mt-0.5 text-xs leading-5 text-stone-500">{link.description}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Sources */}
              <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_44px_rgba(28,25,23,0.06)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">{t.blog.sourcesLabel}</p>
                <ul className="mt-4 space-y-4">
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

      {/* Related articles */}
      {related.length ? (
        <section className="px-4 pb-12 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">{t.blog.relatedLabel}</p>
              <h2 className="landing-display mt-2 text-3xl text-stone-900">{t.blog.relatedTitle}</h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {related.map((a) => (
                <RelatedCard key={a.slug} article={a} readLabel={t.blog.readArticle} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Cross-links — full-width section below related (mobile-friendly alternative) */}
      {seoLinks.length > 0 && (
        <section className="px-4 pb-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                {isEn ? "Explore" : "Explorează"}
              </p>
              <h2 className="landing-display mt-2 text-3xl text-stone-900">
                {isEn ? "Guides & tools for your situation" : "Ghiduri și instrumente pentru situația ta"}
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

function RelatedCard({ article, readLabel, lang }: { article: BlogArticleWithCategory; readLabel: string; lang: "ro" | "en" }) {
  const href = lang === "en"
    ? `/en/blog/${articleSlugForLang(article, "en")}`
    : `/blog/${article.slug}`;
  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(28,25,23,0.08)] backdrop-blur">
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${article.category.badgeClassName}`}>
        {article.category.title}
      </span>
      <h3 className="landing-display mt-4 text-balance text-2xl text-stone-900">
        <Link href={href}>{article.title}</Link>
      </h3>
      <p className="mt-3 text-sm leading-7 text-pretty text-stone-600">{article.summary}</p>
      <Link href={href} className="mt-5 inline-flex items-center rounded-full bg-[#1f3a36] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#172c2a]">
        {readLabel}
      </Link>
    </article>
  );
}
