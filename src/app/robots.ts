import { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        // Authenticated app routes — not for indexing
        "/app",
        "/app/",
        // User-specific app pages
        "/account",
        "/config",
        "/chat",
        "/setup",
        "/join",
        "/admin",
        // API routes
        "/api/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
