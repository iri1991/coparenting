import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  blogCategories,
  blogDescription,
  blogDescriptionEn,
  getArticlesForCategory,
  getBlogCategoryBySlug,
  getBlogCategoriesWithTranslation,
} from "@/content/blog";
import { BlogShell } from "@/components/blog/BlogShell";
import { BlogCategoryContent } from "@/components/blog/BlogCategoryContent";
import { brandName, ogImage, siteUrl } from "@/lib/seo";
import { getSharePathMeta, ogPublicUrl } from "@/lib/share-meta";

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

  const { pathname, lang } = await getSharePathMeta();
  const isEn = lang === "en";
  const catTr = getBlogCategoriesWithTranslation().find((c) => c.slug === category.slug);
  const titleBase = isEn && catTr?.titleEn ? catTr.titleEn : category.title;
  const descBase = isEn && catTr?.descriptionEn ? catTr.descriptionEn : category.description;
  const description = isEn
    ? `${descBase} ${blogDescriptionEn}`
    : `${category.description} Articole HomeSplit documentate din surse credibile pentru părinți și co-parenting.`;
  const canonicalPath = `/blog/categorie/${category.slug}`;
  const ogUrl = ogPublicUrl(siteUrl, pathname);

  return {
    title: `${titleBase} | Blog`,
    description,
    alternates: {
      canonical: pathname,
      languages: {
        ro: `${siteUrl}${canonicalPath}`,
        en: `${siteUrl}/en${canonicalPath}`,
        "x-default": `${siteUrl}${canonicalPath}`,
      },
    },
    openGraph: {
      type: "website",
      url: ogUrl,
      title: `${titleBase} | ${isEn ? blogDescriptionEn : blogDescription}`,
      description,
      locale: isEn ? "en_US" : "ro_RO",
      alternateLocale: isEn ? ["ro_RO"] : ["en_US"],
      siteName: brandName,
      images: [{ url: ogImage, width: 512, height: 512, alt: titleBase }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${titleBase} | Blog ${brandName}`,
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
