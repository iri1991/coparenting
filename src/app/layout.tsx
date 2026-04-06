import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { UpgradeModalProvider } from "@/contexts/UpgradeModalContext";
import {
  siteUrl,
  defaultTitle,
  defaultDescription,
  keywords,
  brandName,
  ogImage,
  serviceArea,
} from "@/lib/seo";
import { PwaRuntime } from "@/components/PwaRuntime";

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
  alternates: {
    canonical: "/",
  },
  title: {
    default: defaultTitle,
    template: `%s | ${brandName}`,
  },
  description: defaultDescription,
  keywords: keywords,
  category: "family",
  authors: [{ name: brandName, url: siteUrl }],
  creator: brandName,
  publisher: brandName,
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: siteUrl,
    siteName: brandName,
    title: defaultTitle,
    description: defaultDescription,
    images: [
      { url: ogImage, width: 512, height: 512, alt: "HomeSplit — calendar familie și activități copil" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "HomeSplit", statusBarStyle: "default" },
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
    "apple-mobile-web-app-capable": "yes",
  },
  verification: {
    // optional: add when you have them
    // google: "google-site-verification-code",
    // yandex: "yandex-verification-code",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f6efe6",
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: brandName,
      url: siteUrl,
      logo: { "@type": "ImageObject", url: `${siteUrl}${ogImage}` },
      description: defaultDescription,
      areaServed: serviceArea.map((name) => ({ "@type": "AdministrativeArea", name })),
      sameAs: [siteUrl],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: brandName,
      inLanguage: "ro-RO",
      description: defaultDescription,
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#app`,
      name: brandName,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      inLanguage: "ro-RO",
      availableLanguage: ["ro-RO"],
      url: siteUrl,
      description: defaultDescription,
      audience: {
        "@type": "Audience",
        audienceType: "Familii cu copii din România (împreună sau co-parenting la distanță)",
      },
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          price: "0",
          priceCurrency: "RON",
          category: "trial",
          url: `${siteUrl}/register`,
        },
        {
          "@type": "Offer",
          name: "Pro",
          price: "39",
          priceCurrency: "RON",
          billingDuration: "P1M",
          url: `${siteUrl}/register?plan=pro`,
        },
        {
          "@type": "Offer",
          name: "Family+",
          price: "59",
          priceCurrency: "RON",
          billingDuration: "P1M",
          url: `${siteUrl}/register?plan=family`,
        },
      ],
      provider: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "Service",
      "@id": `${siteUrl}/#service`,
      name: "Organizare familie & program copil",
      serviceType: "Calendar, activități, idei AI, documente; handover când copilul e la două adrese",
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: serviceArea.map((name) => ({ "@type": "AdministrativeArea", name })),
      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: siteUrl,
      },
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
      <head>
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KL6M5FLZ');`}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KL6M5FLZ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SessionProvider>
          <UpgradeModalProvider>
            <PwaRuntime />
            {children}
          </UpgradeModalProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
