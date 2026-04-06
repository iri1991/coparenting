import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  blogCategories,
  blogDescription,
  getArticlesForCategory,
  getBlogCategoryBySlug,
} from "@/content/blog";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard";
import { BlogShell } from "@/components/blog/BlogShell";
import { brandName, ogImage, siteUrl } from "@/lib/seo";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogCategories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getBlogCategoryBySlug(slug);

  if (!category) {
    return {};
  }

  const description = `${category.description} Articole HomeSplit documentate din surse credibile pentru părinți și co-parenting.`;
  const canonicalPath = `/blog/categorie/${category.slug}`;

  return {
    title: `${category.title} | Blog`,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "website",
      url: `${siteUrl}${canonicalPath}`,
      title: `${category.title} | ${blogDescription}`,
      description,
      images: [{ url: ogImage, width: 512, height: 512, alt: category.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.title} | Blog ${brandName}`,
      description,
      images: [ogImage],
    },
  };
}

export default async function BlogCategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getBlogCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const articles = getArticlesForCategory(category.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.title} | ${brandName}`,
    url: `${siteUrl}/blog/categorie/${category.slug}`,
    description: category.description,
    inLanguage: "ro-RO",
    hasPart: articles.map((article) => ({
      "@type": "BlogPosting",
      headline: article.title,
      url: `${siteUrl}/blog/${article.slug}`,
      datePublished: article.publishedAt,
    })),
  };

  return (
    <BlogShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-4 pb-14 pt-14 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <Link href="/blog" className="text-sm font-semibold text-[#1f3a36] hover:text-[#172c2a]">
            ← Înapoi la blog
          </Link>

          <div className={`mt-6 rounded-[2.25rem] border border-white/70 bg-gradient-to-br ${category.surfaceClassName} p-8 shadow-[0_24px_70px_rgba(28,25,23,0.08)]`}>
            <span className={`inline-flex rounded-full px-4 py-1.5 text-sm font-semibold ${category.badgeClassName}`}>
              {category.title}
            </span>
            <h1 className="landing-display mt-5 max-w-3xl text-balance text-5xl text-stone-900 sm:text-6xl">
              {category.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">{category.description}</p>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
              {articles.length} articole publicate
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">În această categorie</p>
            <h2 className="landing-display mt-2 text-3xl text-stone-900">Articole disponibile</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {articles.map((article) => (
              <BlogArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>
    </BlogShell>
  );
}
