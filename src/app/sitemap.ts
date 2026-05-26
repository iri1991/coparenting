import { MetadataRoute } from "next";
import { blogCategories, getAllBlogArticles, getArticlesForCategory } from "@/content/blog";
import { siteUrl } from "@/lib/seo";

/** All SEO landing pages — updated when content changes */
const SEO_PAGES: MetadataRoute.Sitemap = [
  // Core product pages
  { url: `${siteUrl}/co-parenting`,              priority: 0.95, changeFrequency: "monthly" },
  { url: `${siteUrl}/calendar-copil`,             priority: 0.93, changeFrequency: "monthly" },
  { url: `${siteUrl}/program-copil`,              priority: 0.93, changeFrequency: "monthly" },
  { url: `${siteUrl}/custodie-comuna`,            priority: 0.90, changeFrequency: "monthly" },
  { url: `${siteUrl}/aplicatie-co-parenting`,     priority: 0.92, changeFrequency: "monthly" },
  { url: `${siteUrl}/vacante-si-program`,         priority: 0.88, changeFrequency: "monthly" },
  { url: `${siteUrl}/documente-copil`,            priority: 0.87, changeFrequency: "monthly" },
  { url: `${siteUrl}/zile-blocate`,               priority: 0.87, changeFrequency: "monthly" },
  { url: `${siteUrl}/activitati-copil`,           priority: 0.88, changeFrequency: "monthly" },
  { url: `${siteUrl}/pentru-parinti-separati`,    priority: 0.90, changeFrequency: "monthly" },
  // Support & info pages
  { url: `${siteUrl}/faq`,    priority: 0.85, changeFrequency: "monthly" },
  { url: `${siteUrl}/despre`, priority: 0.75, changeFrequency: "monthly" },
  { url: `${siteUrl}/contact`, priority: 0.70, changeFrequency: "yearly" },
  { url: `${siteUrl}/download`, priority: 0.80, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllBlogArticles();
  const now = new Date();

  return [
    // Homepage — highest priority
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },

    // SEO landing pages
    ...SEO_PAGES.map((p) => ({ ...p, lastModified: now })),

    // App / auth pages
    { url: `${siteUrl}/blog`,            lastModified: now, changeFrequency: "weekly",  priority: 0.92 },
    { url: `${siteUrl}/login`,           lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${siteUrl}/register`,        lastModified: now, changeFrequency: "monthly", priority: 0.85 },

    // Legal
    { url: `${siteUrl}/terms`,           lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${siteUrl}/privacy`,         lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${siteUrl}/cookies`,         lastModified: now, changeFrequency: "yearly",  priority: 0.3 },

    // Auth helpers
    { url: `${siteUrl}/forgot-password`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },

    // Blog categories
    ...blogCategories.map((category) => {
      const categoryArticles = getArticlesForCategory(category.slug);
      const latestDate = categoryArticles[0]?.publishedAt ?? now.toISOString().slice(0, 10);
      return {
        url: `${siteUrl}/blog/categorie/${category.slug}`,
        lastModified: new Date(`${latestDate}T12:00:00Z`),
        changeFrequency: "weekly" as const,
        priority: 0.75,
      };
    }),

    // Blog articles
    ...articles.map((article) => ({
      url: `${siteUrl}/blog/${article.slug}`,
      lastModified: new Date(`${article.publishedAt}T12:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: article.featured ? 0.85 : 0.7,
    })),
  ];
}
