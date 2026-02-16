import { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/account", "/config", "/chat", "/api/", "/setup", "/join", "/admin"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
