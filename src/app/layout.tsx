import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { siteUrl, defaultTitle, defaultDescription, keywords } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | HomeSplit",
  },
  description: defaultDescription,
  keywords: keywords,
  authors: [{ name: "HomeSplit", url: siteUrl }],
  creator: "HomeSplit",
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: siteUrl,
    siteName: "HomeSplit",
    title: defaultTitle,
    description: defaultDescription,
    images: [
      { url: "/logo.png", width: 512, height: 512, alt: "HomeSplit – Co-parenting fără stres" },
    ],
  },
  twitter: {
    card: "summary",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "HomeSplit" },
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png", sizes: "any" },
      { url: "/logo.png", type: "image/png", sizes: "192x192" },
      { url: "/logo.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/logo.png", type: "image/png", sizes: "180x180" },
    ],
  },
  other: {
    "theme-color": "#f59e0b",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
  verification: {
    // optional: add when you have them
    // google: "google-site-verification-code",
    // yandex: "yandex-verification-code",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "HomeSplit",
      url: siteUrl,
      logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
      description: defaultDescription,
    },
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/#webapp`,
      name: "HomeSplit",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Any",
      url: siteUrl,
      description: defaultDescription,
      offers: { "@type": "Offer", price: "0", priceCurrency: "RON" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
