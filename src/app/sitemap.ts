import { MetadataRoute } from "next";
import { blogCategories, getAllBlogArticles, getArticlesForCategory } from "@/content/blog";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllBlogArticles();

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.92 },
    { url: `${siteUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${siteUrl}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${siteUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/cookies`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/forgot-password`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    ...blogCategories.map((category) => {
      const categoryArticles = getArticlesForCategory(category.slug);
      const latestDate = categoryArticles[0]?.publishedAt ?? new Date().toISOString().slice(0, 10);

      return {
        url: `${siteUrl}/blog/categorie/${category.slug}`,
        lastModified: new Date(`${latestDate}T12:00:00Z`),
        changeFrequency: "weekly" as const,
        priority: 0.75,
      };
    }),
    ...articles.map((article) => ({
      url: `${siteUrl}/blog/${article.slug}`,
      lastModified: new Date(`${article.publishedAt}T12:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: article.featured ? 0.85 : 0.7,
    })),
  ];
}
