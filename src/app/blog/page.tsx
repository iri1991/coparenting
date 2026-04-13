import type { Metadata } from "next";
import {
  blogDescription,
  blogTitle,
  getAllBlogArticles,
  getFeaturedBlogArticle,
  getBlogCategoriesWithTranslation,
} from "@/content/blog";
import { BlogShell } from "@/components/blog/BlogShell";
import { BlogIndexContent } from "@/components/blog/BlogIndexContent";
import { brandName, ogImage, siteUrl, defaultTitleEn, defaultDescriptionEn } from "@/lib/seo";

const canonicalPath = "/blog";

export const metadata: Metadata = {
  title: blogTitle,
  description: blogDescription,
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
    title: `${blogTitle} | ${brandName}`,
    description: blogDescription,
    locale: "ro_RO",
    alternateLocale: ["en_US"],
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
  const categories = getBlogCategoriesWithTranslation();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${siteUrl}${canonicalPath}#blog`,
    name: blogTitle,
    url: `${siteUrl}${canonicalPath}`,
    description: blogDescription,
    inLanguage: ["ro-RO", "en"],
    publisher: { "@type": "Organization", name: brandName, url: siteUrl },
    blogPost: articles.map((article) => ({
      "@type": "BlogPosting",
      headline: article.title,
      datePublished: article.publishedAt,
      url: `${siteUrl}/blog/${article.slug}`,
      articleSection: article.category.title,
      description: article.summary,
      ...(article.enSlug
        ? { url: [`${siteUrl}/blog/${article.slug}`, `${siteUrl}/en/blog/${article.enSlug}`] }
        : {}),
    })),
  };

  return (
    <BlogShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogIndexContent
        articles={articles}
        featured={featured}
        recentWithoutFeatured={recentWithoutFeatured}
        categories={categories}
      />
    </BlogShell>
  );
}
