import type { Metadata } from "next";
import {
  blogDescription,
  blogDescriptionEn,
  blogTitle,
  blogTitleEn,
  getAllBlogArticles,
  getBlogCategoriesWithTranslation,
} from "@/content/blog";
import { BlogShell } from "@/components/blog/BlogShell";
import { BlogIndexContent } from "@/components/blog/BlogIndexContent";
import { brandName, ogImage, siteUrl } from "@/lib/seo";
import { getSharePathMeta, ogPublicUrl } from "@/lib/share-meta";
import { BLOG_INDEX_SEO_LINKS } from "@/lib/blog-seo-links";

const canonicalPath = "/blog";
const BLOG_PAGE_SIZE = 12;

// Fully static — all articles are build-time data
export const dynamic = "force-static";

function parsePageParam(page: string | string[] | undefined) {
  const raw = Array.isArray(page) ? page[0] : page;
  const parsed = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}): Promise<Metadata> {
  const { pathname, lang } = await getSharePathMeta();
  const { page } = await searchParams;
  const currentPage = parsePageParam(page);
  const isEn = lang === "en";
  const titleBase = isEn ? blogTitleEn : blogTitle;
  const description = isEn ? blogDescriptionEn : blogDescription;
  const pageTitle = `${titleBase} | ${brandName}`;
  const pathWithPage = currentPage > 1 ? `${pathname}?page=${currentPage}` : pathname;
  const canonicalUrl = currentPage > 1 ? `${siteUrl}${pathWithPage}` : `${siteUrl}${pathname}`;
  const ogUrl = ogPublicUrl(siteUrl, pathWithPage);

  return {
    title: titleBase,
    description,
    keywords: isEn
      ? ["co-parenting blog", "shared custody", "child routine", "parenting after separation", "HomeSplit"]
      : ["blog co-parenting", "custodie partajată", "rutine copil", "parenting după separare", "doi părinți", "HomeSplit"],
    robots: { index: true, follow: true },
    alternates: {
      canonical: canonicalUrl,
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

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { page } = await searchParams;
  const requestedPage = parsePageParam(page);
  const articles = getAllBlogArticles();
  // Deterministic featured: prefer explicitly marked article, else most recent (articles[0])
  const featured = articles.find((a) => a.featured) ?? (articles.length ? articles[0] : null);
  const recentWithoutFeatured = featured
    ? articles.filter((article) => article.slug !== featured.slug)
    : articles;
  const totalPages = Math.max(1, Math.ceil(recentWithoutFeatured.length / BLOG_PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageStart = (currentPage - 1) * BLOG_PAGE_SIZE;
  const paginatedArticles = recentWithoutFeatured.slice(pageStart, pageStart + BLOG_PAGE_SIZE);
  const categories = getBlogCategoriesWithTranslation();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "HomeSplit", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}${canonicalPath}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      "@id": `${siteUrl}${canonicalPath}#blog`,
      name: blogTitle,
      url: `${siteUrl}${canonicalPath}`,
      description: blogDescription,
      inLanguage: ["ro-RO", "en"],
      publisher: {
        "@type": "Organization",
        name: brandName,
        url: siteUrl,
        logo: { "@type": "ImageObject", url: `${siteUrl}${ogImage}` },
      },
      blogPost: articles.map((article) => ({
        "@type": "BlogPosting",
        headline: article.title,
        datePublished: article.publishedAt,
        url: `${siteUrl}/blog/${article.slug}`,
        articleSection: article.category.title,
        description: article.summary,
        ...(article.enSlug
          ? { sameAs: `${siteUrl}/en/blog/${article.enSlug}` }
          : {}),
      })),
    },
  ];

  return (
    <BlogShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogIndexContent
        articles={articles}
        featured={featured}
        recentWithoutFeatured={paginatedArticles}
        categories={categories}
        currentPage={currentPage}
        totalPages={totalPages}
        seoLinks={BLOG_INDEX_SEO_LINKS}
      />
    </BlogShell>
  );
}
