import type { Metadata } from "next";
import {
  blogDescription,
  blogDescriptionEn,
  blogTitle,
  blogTitleEn,
  getAllBlogArticles,
  getFeaturedBlogArticle,
  getBlogCategoriesWithTranslation,
} from "@/content/blog";
import { BlogShell } from "@/components/blog/BlogShell";
import { BlogIndexContent } from "@/components/blog/BlogIndexContent";
import { brandName, ogImage, siteUrl } from "@/lib/seo";
import { getSharePathMeta, ogPublicUrl } from "@/lib/share-meta";

const canonicalPath = "/blog";

export async function generateMetadata(): Promise<Metadata> {
  const { pathname, lang } = await getSharePathMeta();
  const isEn = lang === "en";
  const titleBase = isEn ? blogTitleEn : blogTitle;
  const description = isEn ? blogDescriptionEn : blogDescription;
  const pageTitle = `${titleBase} | ${brandName}`;
  const ogUrl = ogPublicUrl(siteUrl, pathname);

  return {
    title: titleBase,
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
      title: pageTitle,
      description,
      locale: isEn ? "en_US" : "ro_RO",
      alternateLocale: isEn ? ["ro_RO"] : ["en_US"],
      siteName: brandName,
      images: [
        {
          url: ogImage,
          width: 512,
          height: 512,
          alt: isEn ? "HomeSplit blog" : "Blog HomeSplit",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [ogImage],
    },
  };
}

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
