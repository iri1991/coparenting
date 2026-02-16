"use client";

import Link from "next/link";
import Image from "next/image";

const FOOTER_LINKS = {
  produs: [
    { label: "Ce este HomeSplit?", href: "#ce-este-homesplit" },
    { label: "Funcționalități", href: "#functionalitati" },
    { label: "Web app", href: "#web-app" },
    { label: "Prețuri", href: "#preturi" },
    { label: "FAQ", href: "#intrebari" },
  ],
  legal: [
    { label: "Termeni", href: "/terms" },
    { label: "Confidențialitate", href: "/privacy" },
    { label: "Cookies", href: "/cookies" },
  ],
  contact: [
    { label: "Suport", href: "mailto:me@irinelnicoara.ro" },
    { label: "Contact", href: "mailto:me@irinelnicoara.ro" },
  ],
};

export function LandingFooter() {
  return (
    <footer id="footer" className="border-t border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-900/50 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between sm:gap-8">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="HomeSplit" width={36} height={36} className="rounded-lg object-contain" />
            <span className="font-semibold text-stone-800 dark:text-stone-100">HomeSplit</span>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Produs
              </h4>
              <ul className="mt-3 space-y-2">
                {FOOTER_LINKS.produs.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Legal
              </h4>
              <ul className="mt-3 space-y-2">
                {FOOTER_LINKS.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Contact
              </h4>
              <ul className="mt-3 space-y-2">
{FOOTER_LINKS.contact.map((link) => (
            <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-stone-400 dark:text-stone-500">
          © {new Date().getFullYear()} HomeSplit. Co-parenting fără stres.
        </p>
      </div>
    </footer>
  );
}
