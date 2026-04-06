import type { Metadata } from "next";
import Link from "next/link";
import {
  blogCategories,
  blogDescription,
  blogTitle,
  getAllBlogArticles,
  getFeaturedBlogArticle,
} from "@/content/blog";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard";
import { BlogShell } from "@/components/blog/BlogShell";
import { brandName, ogImage, siteUrl } from "@/lib/seo";

const canonicalPath = "/blog";

export const metadata: Metadata = {
  title: blogTitle,
  description: blogDescription,
  alternates: { canonical: canonicalPath },
  openGraph: {
    type: "website",
    url: `${siteUrl}${canonicalPath}`,
    title: `${blogTitle} | ${brandName}`,
    description: blogDescription,
    images: [{ url: ogImage, width: 512, height: 512, alt: "Blog HomeSplit" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${blogTitle} | ${brandName}`,
    description: blogDescription,
    images: [ogImage],
  },
};

export default function BlogIndexPage() {
  const articles = getAllBlogArticles();
  const featured = getFeaturedBlogArticle();
  const recentWithoutFeatured = featured
    ? articles.filter((article) => article.slug !== featured.slug)
    : articles;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${siteUrl}${canonicalPath}#blog`,
    name: blogTitle,
    url: `${siteUrl}${canonicalPath}`,
    description: blogDescription,
    inLanguage: "ro-RO",
    publisher: {
      "@type": "Organization",
      name: brandName,
      url: siteUrl,
    },
    blogPost: articles.map((article) => ({
      "@type": "BlogPosting",
      headline: article.title,
      datePublished: article.publishedAt,
      url: `${siteUrl}/blog/${article.slug}`,
      articleSection: article.category.title,
      description: article.summary,
    })),
  };

  return (
    <BlogShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-4 pb-12 pt-14 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <span className="inline-flex rounded-full border border-[#d8c7b6] bg-white/75 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-stone-600">
                Blog HomeSplit
              </span>
              <h1 className="landing-display mt-6 max-w-3xl text-balance text-5xl text-stone-900 sm:text-6xl">
                Articole utile pentru familii care au nevoie de mai mult calm și mai puțin haos
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-600">
                Publicăm articole scurte și aplicate despre co-parenting, emoțiile copilului, rutine între două case
                și activități de conectare. Fiecare text pornește din surse psihologice, pediatrice sau educaționale
                credibile și rămâne orientat pe ce poți face concret acasă.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_20px_60px_rgba(28,25,23,0.08)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Busolă editorială</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-600">
                <li>Scriem în română și traducem ideile importante în pași aplicabili pentru părinți.</li>
                <li>Ne bazăm pe surse precum AAP, CDC, Harvard, UNICEF, Child Mind sau Raising Children Network.</li>
                <li>Articolele sunt informative și nu înlocuiesc evaluarea psihologică ori medicală atunci când există risc.</li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                {blogCategories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/blog/categorie/${category.slug}`}
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold ${category.badgeClassName}`}
                  >
                    {category.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {featured ? (
        <section className="px-4 pb-12 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Articol recomandat</p>
                <h2 className="landing-display mt-2 text-3xl text-stone-900">Începe de aici</h2>
              </div>
              <Link href={`/blog/${featured.slug}`} className="text-sm font-semibold text-[#1f3a36] hover:text-[#172c2a]">
                Deschide articolul
              </Link>
            </div>
            <BlogArticleCard article={featured} large />
          </div>
        </section>
      ) : null}

      <section className="px-4 pb-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Categorii</p>
            <h2 className="landing-display mt-2 text-3xl text-stone-900">Zonele pe care le acoperim</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {blogCategories.map((category) => {
              const count = articles.filter((article) => article.category.slug === category.slug).length;
              return (
                <Link
                  key={category.slug}
                  href={`/blog/categorie/${category.slug}`}
                  className={`rounded-[2rem] border border-white/70 bg-gradient-to-br ${category.surfaceClassName} p-6 shadow-[0_16px_40px_rgba(28,25,23,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(28,25,23,0.08)]`}
                >
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${category.badgeClassName}`}>
                    {category.title}
                  </span>
                  <p className="mt-4 text-base font-semibold text-stone-900">{count} articole disponibile</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600">{category.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Articole recente</p>
            <h2 className="landing-display mt-2 text-3xl text-stone-900">Publicate recent</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {recentWithoutFeatured.map((article) => (
              <BlogArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>
    </BlogShell>
  );
}
