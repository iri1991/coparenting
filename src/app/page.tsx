/**
 * / — public marketing homepage.
 *
 * Fully prerendered at build time (SSG ○).
 * No auth check, no DB access, no dynamic imports.
 *
 * Authenticated users are redirected here → /app by the middleware.
 * CTAs in LandingPage point to /register and /login as before.
 */
import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import {
  brandName,
  defaultDescription,
  defaultDescriptionEn,
  defaultTitle,
  defaultTitleEn,
  geoSummary,
  geoSummaryEn,
  keywords,
  keywordsEn,
  ogImage,
  siteUrl,
} from "@/lib/seo";

// Force static prerendering — no dynamic server-side work at all.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: defaultTitle,
  description: defaultDescription,
  alternates: {
    canonical: siteUrl,
    languages: {
      ro: `${siteUrl}/`,
      en: `${siteUrl}/en`,
      "x-default": `${siteUrl}/`,
    },
  },
  keywords: [...keywords, ...keywordsEn],
  openGraph: {
    type: "website",
    locale: "ro_RO",
    alternateLocale: ["en_US"],
    url: siteUrl,
    siteName: brandName,
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: ogImage,
        width: 512,
        height: 512,
        alt: "HomeSplit — calendar familie și activități copil",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitleEn,
    description: defaultDescriptionEn,
    images: [ogImage],
  },
  robots: { index: true, follow: true },
  other: {
    // GEO / AI-readable summary sentences injected into <head>
    "geo:description": geoSummary.join(" "),
    "geo:description:en": geoSummaryEn.join(" "),
  },
};

export default function HomePage() {
  return <LandingPage />;
}
