import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatBlogDate,
  getAllBlogArticles,
  getArticlesForCategory,
  getBlogArticleBySlug,
} from "@/content/blog";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard";
import { BlogShell } from "@/components/blog/BlogShell";
import { brandName, ogImage, siteUrl } from "@/lib/seo";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllBlogArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);

  if (!article) {
    return {};
  }

  const canonicalPath = `/blog/${article.slug}`;

  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "article",
      url: `${siteUrl}${canonicalPath}`,
      title: article.title,
      description: article.summary,
      images: [
        {
          url: `${siteUrl}${article.image?.src ?? ogImage}`,
          width: 1200,
          height: 720,
          alt: article.image?.alt ?? article.title,
        },
      ],
      publishedTime: article.publishedAt,
      authors: [brandName],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: [`${siteUrl}${article.image?.src ?? ogImage}`],
    },
  };
}

export default async function BlogArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = getArticlesForCategory(article.category.slug)
    .filter((item) => item.slug !== article.slug)
    .slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    inLanguage: "ro-RO",
    author: {
      "@type": "Organization",
      name: brandName,
    },
    publisher: {
      "@type": "Organization",
      name: brandName,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}${ogImage}`,
      },
    },
    articleSection: article.category.title,
    url: `${siteUrl}/blog/${article.slug}`,
    image: `${siteUrl}${article.image?.src ?? ogImage}`,
    citation: article.sources.map((source) => source.url),
    isAccessibleForFree: true,
  };

  return (
    <BlogShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <Link href="/blog" className="text-sm font-semibold text-[#1f3a36] hover:text-[#172c2a]">
            ← Înapoi la blog
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
                  <span>{formatBlogDate(article.publishedAt)}</span>
                  <span>{article.readingTimeMinutes} min de citit</span>
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
                        {section.paragraphs.map((paragraph) => (
                          <p key={paragraph} className="text-base leading-8 text-stone-700">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                      {section.bullets?.length ? (
                        <ul className="mt-5 space-y-3">
                          {section.bullets.map((bullet) => (
                            <li key={bullet} className="flex gap-3 text-base leading-8 text-stone-700">
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
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Pe scurt</p>
                <ul className="mt-4 space-y-3">
                  {article.takeaways.map((takeaway) => (
                    <li key={takeaway} className="flex gap-3 text-sm leading-7 text-stone-700">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#1f3a36]" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_44px_rgba(28,25,23,0.06)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Surse folosite</p>
                <ul className="mt-4 space-y-4">
                  {article.sources.map((source) => (
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
                <p className="text-sm leading-7 text-stone-700">
                  Articol informativ. Dacă apar semne persistente de regres, anxietate, izolare, agresivitate sau
                  conflict sever în jurul copilului, merită discutat cu un psiholog de copii sau cu medicul pediatru.
                </p>
              </section>
            </aside>
          </div>
        </div>
      </section>

      {relatedArticles.length ? (
        <section className="px-4 pb-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Mai departe</p>
              <h2 className="landing-display mt-2 text-3xl text-stone-900">Articole din aceeași categorie</h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {relatedArticles.map((relatedArticle) => (
                <BlogArticleCard key={relatedArticle.slug} article={relatedArticle} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </BlogShell>
  );
}
