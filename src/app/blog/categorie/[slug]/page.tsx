import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  blogCategories,
  blogDescription,
  getArticlesForCategory,
  getBlogCategoryBySlug,
  getBlogCategoriesWithTranslation,
} from "@/content/blog";
import { BlogShell } from "@/components/blog/BlogShell";
import { BlogCategoryContent } from "@/components/blog/BlogCategoryContent";
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
  if (!category) return {};

  const description = `${category.description} Articole HomeSplit documentate din surse credibile pentru părinți și co-parenting.`;
  const canonicalPath = `/blog/categorie/${category.slug}`;

  return {
    title: `${category.title} | Blog`,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: {
        ro: `${siteUrl}${canonicalPath}`,
        en: `${siteUrl}/en${canonicalPath}`,
        "x-default": `${siteUrl}${canonicalPath}`,
      },
    },
    openGraph: {
      type: "website",
      url: `${siteUrl}${canonicalPath}`,
      title: `${category.title} | ${blogDescription}`,
      description,
      locale: "ro_RO",
      alternateLocale: ["en_US"],
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
  if (!category) notFound();

  const articlesRo = getArticlesForCategory(category.slug, "ro");
  const categoriesWithTranslation = getBlogCategoriesWithTranslation();
  const categoryWithTranslation = categoriesWithTranslation.find((c) => c.slug === category.slug) ?? category;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.title} | ${brandName}`,
    url: `${siteUrl}/blog/categorie/${category.slug}`,
    description: category.description,
    inLanguage: ["ro-RO", "en"],
    hasPart: articlesRo.map((article) => ({
      "@type": "BlogPosting",
      headline: article.title,
      url: `${siteUrl}/blog/${article.slug}`,
      datePublished: article.publishedAt,
    })),
  };

  return (
    <BlogShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogCategoryContent category={categoryWithTranslation} articles={articlesRo} />
    </BlogShell>
  );
}
