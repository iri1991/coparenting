import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllBlogArticles,
  getAllBlogSlugs,
  getArticlesForCategory,
  getBlogArticleByAnySlug,
} from "@/content/blog";
import { BlogShell } from "@/components/blog/BlogShell";
import { BlogArticleContent } from "@/components/blog/BlogArticleContent";
import { brandName, ogImage, siteUrl } from "@/lib/seo";
import { getSharePathMeta, ogPublicUrl } from "@/lib/share-meta";
import { getSeoLinksForCategory } from "@/lib/blog-seo-links";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  // Include both Romanian and English slugs so /en/blog/[enSlug] is pre-built
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticleByAnySlug(slug);

  if (!article) return {};

  const { pathname, lang } = await getSharePathMeta();
  const hasEn = Boolean(article.en && article.enSlug);
  const useEn = lang === "en" && Boolean(article.en);
  const title = useEn && article.en ? article.en.title : article.title;
  const description = useEn && article.en ? article.en.summary : article.summary;

  const pathRo = `/blog/${article.slug}`;
  const pathEn = hasEn && article.enSlug ? `/en/blog/${article.enSlug}` : null;
  const ogUrl = ogPublicUrl(siteUrl, pathname);

  const keywords = [
    article.category.title,
    "co-parenting",
    "doi părinți",
    "copil",
    "HomeSplit",
    ...(useEn ? ["parenting after separation", "shared custody"] : ["custodie partajată", "separare"]),
  ];

  return {
    title,
    description,
    keywords,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${siteUrl}${pathRo}`,
      ...(pathEn
        ? {
            languages: {
              ro: `${siteUrl}${pathRo}`,
              en: `${siteUrl}${pathEn}`,
              "x-default": `${siteUrl}${pathRo}`,
            },
          }
        : {}),
    },
    openGraph: {
      type: "article",
      url: ogUrl,
      title,
      description,
      publishedTime: article.publishedAt,
      modifiedTime: article.publishedAt,
      authors: [brandName],
      locale: useEn ? "en_US" : "ro_RO",
      siteName: brandName,
      ...(hasEn ? { alternateLocale: useEn ? ["ro_RO"] : ["en_US"] } : {}),
      images: [
        {
          url: `${siteUrl}/blog/${article.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/blog/${article.slug}/opengraph-image`],
    },
  };
}

export default async function BlogArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const articleRo = getBlogArticleByAnySlug(slug);

  if (!articleRo) notFound();

  const articleEn = articleRo.en ? { ...articleRo, ...articleRo.en } : null;

  const relatedRo = getArticlesForCategory(articleRo.category.slug, "ro")
    .filter((item) => item.slug !== articleRo.slug)
    .slice(0, 2);
  const relatedEn = getArticlesForCategory(articleRo.category.slug, "en")
    .filter((item) => item.slug !== articleRo.slug)
    .slice(0, 2);

  const seoLinks = getSeoLinksForCategory(articleRo.categorySlug);

  const articleUrl = `${siteUrl}/blog/${articleRo.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "HomeSplit", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
        { "@type": "ListItem", position: 3, name: articleRo.category.title, item: `${siteUrl}/blog/categorie/${articleRo.categorySlug}` },
        { "@type": "ListItem", position: 4, name: articleRo.title, item: articleUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${articleUrl}#article`,
      headline: articleRo.title,
      description: articleRo.summary,
      datePublished: articleRo.publishedAt,
      dateModified: articleRo.publishedAt,
      inLanguage: articleRo.en ? ["ro-RO", "en"] : "ro-RO",
      isAccessibleForFree: true,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": articleUrl,
      },
      author: {
        "@type": "Organization",
        name: brandName,
        url: siteUrl,
      },
      publisher: {
        "@type": "Organization",
        name: brandName,
        logo: { "@type": "ImageObject", url: `${siteUrl}${ogImage}` },
      },
      articleSection: articleRo.category.title,
      url: articleUrl,
      image: {
        "@type": "ImageObject",
        url: `${siteUrl}/blog/${articleRo.slug}/opengraph-image`,
        width: 1200,
        height: 630,
      },
      citation: articleRo.sources.map((source) => ({
        "@type": "CreativeWork",
        name: source.title,
        url: source.url,
        publisher: { "@type": "Organization", name: source.publisher },
      })),
      ...(articleRo.en && articleRo.enSlug
        ? { sameAs: `${siteUrl}/en/blog/${articleRo.enSlug}` }
        : {}),
    },
  ];

  return (
    <BlogShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogArticleContent
        articleRo={articleRo}
        articleEn={articleEn}
        relatedRo={relatedRo}
        relatedEn={relatedEn}
        seoLinks={seoLinks}
      />
    </BlogShell>
  );
}
