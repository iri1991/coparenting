import type { Metadata } from "next";
import {
  ogImage,
  registerShareDescriptionEn,
  registerShareDescriptionRo,
  registerShareTitleEn,
  registerShareTitleRo,
  siteUrl,
} from "@/lib/seo";
import { getSharePathMeta, ogPublicUrl } from "@/lib/share-meta";

export async function generateMetadata(): Promise<Metadata> {
  const { pathname, lang } = await getSharePathMeta();
  const isEn = lang === "en";
  const title = isEn ? registerShareTitleEn : registerShareTitleRo;
  const description = isEn ? registerShareDescriptionEn : registerShareDescriptionRo;
  const ogUrl = ogPublicUrl(siteUrl, pathname);

  return {
    title,
    description,
    alternates: { canonical: pathname },
    openGraph: {
      type: "website",
      url: ogUrl,
      siteName: "HomeSplit",
      title,
      description,
      locale: isEn ? "en_US" : "ro_RO",
      images: [{ url: ogImage, width: 512, height: 512, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
