import { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/cookies`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/forgot-password`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];
}
