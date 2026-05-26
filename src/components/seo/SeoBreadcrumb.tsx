import Link from "next/link";
import { siteUrl } from "@/lib/seo";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface SeoBreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Server component: renders breadcrumb nav + BreadcrumbList JSON-LD.
 */
export function SeoBreadcrumb({ items }: SeoBreadcrumbProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "HomeSplit",
        item: siteUrl,
      },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.label,
        item: `${siteUrl}${item.href}`,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
          <li>
            <Link href="/" className="transition-colors hover:text-stone-800">
              HomeSplit
            </Link>
          </li>
          {items.map((item) => (
            <li key={item.href} className="flex items-center gap-1.5">
              <span className="text-stone-300">/</span>
              <Link
                href={item.href}
                className="transition-colors hover:text-stone-800"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
