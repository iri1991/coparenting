import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  formatBlogDate,
  getAllBlogArticles,
  getAllBlogSlugs,
  getArticlesForCategory,
  getBlogArticleByAnySlug,
} from "@/content/blog";
import { BlogShell } from "@/components/blog/BlogShell";
import { BlogArticleContent } from "@/components/blog/BlogArticleContent";
import { brandName, ogImage, siteUrl } from "@/lib/seo";
import { getSharePathMeta, ogPublicUrl } from "@/lib/share-meta";

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

  return {
    title,
    description,
    alternates: {
      canonical: pathname,
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
      authors: [brandName],
      locale: useEn ? "en_US" : "ro_RO",
      ...(hasEn ? { alternateLocale: useEn ? ["ro_RO"] : ["en_US"] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BlogArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  // Accept both Romanian slugs and English slugs (e.g. after /en/ rewrite)
  const articleRo = getBlogArticleByAnySlug(slug);

  if (!articleRo) notFound();

  // Prepare English version if available (same article, translated fields merged)
  const articleEn = articleRo.en ? { ...articleRo, ...articleRo.en } : null;

  // Related articles in both languages (client will pick based on language)
  const relatedRo = getArticlesForCategory(articleRo.category.slug, "ro")
    .filter((item) => item.slug !== articleRo.slug)
    .slice(0, 2);
  const relatedEn = getArticlesForCategory(articleRo.category.slug, "en")
    .filter((item) => item.slug !== articleRo.slug)
    .slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: articleRo.title,
    description: articleRo.summary,
    datePublished: articleRo.publishedAt,
    dateModified: articleRo.publishedAt,
    inLanguage: articleRo.en ? ["ro-RO", "en"] : "ro-RO",
    author: { "@type": "Organization", name: brandName },
    publisher: {
      "@type": "Organization",
      name: brandName,
      logo: { "@type": "ImageObject", url: `${siteUrl}${ogImage}` },
    },
    articleSection: articleRo.category.title,
    url: `${siteUrl}/blog/${articleRo.slug}`,
    image: `${siteUrl}/blog/${articleRo.slug}/opengraph-image`,
    citation: articleRo.sources.map((source) => source.url),
    isAccessibleForFree: true,
    ...(articleRo.en
      ? {
          name: [
            { "@language": "ro", "@value": articleRo.title },
            { "@language": "en", "@value": articleRo.en.title },
          ],
        }
      : {}),
  };

  return (
    <BlogShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogArticleContent
        articleRo={articleRo}
        articleEn={articleEn}
        relatedRo={relatedRo}
        relatedEn={relatedEn}
      />
    </BlogShell>
  );
}
