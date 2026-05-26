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
import { getSeoLinksForCategory } from "@/lib/blog-seo-links";

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
    keywords: isEn
      ? [titleBase, "co-parenting", "parenting after separation", "HomeSplit blog"]
      : [titleBase, "co-parenting", "separare", "blog HomeSplit", "doi părinți"],
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${siteUrl}${canonicalPath}`,
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
  const seoLinks = getSeoLinksForCategory(category.slug);

  const categoryUrl = `${siteUrl}/blog/categorie/${category.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "HomeSplit", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
        { "@type": "ListItem", position: 3, name: category.title, item: categoryUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${categoryUrl}#collection`,
      name: `${category.title} | ${brandName}`,
      url: categoryUrl,
      description: category.description,
      inLanguage: ["ro-RO", "en"],
      publisher: {
        "@type": "Organization",
        name: brandName,
        url: siteUrl,
        logo: { "@type": "ImageObject", url: `${siteUrl}${ogImage}` },
      },
      hasPart: articlesRo.map((article) => ({
        "@type": "BlogPosting",
        headline: article.title,
        url: `${siteUrl}/blog/${article.slug}`,
        datePublished: article.publishedAt,
        description: article.summary,
      })),
    },
  ];

  return (
    <BlogShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogCategoryContent
        category={categoryWithTranslation}
        articles={articlesRo}
        seoLinks={seoLinks}
      />
    </BlogShell>
  );
}
