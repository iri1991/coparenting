"use client";

import Image from "next/image";
import Link from "next/link";

const FOOTER_LINKS = {
  produs: [
    { label: "Funcții", href: "#functionalitati" },
    { label: "Cum merge", href: "#cum-functioneaza" },
    { label: "Scenarii", href: "#scenarii" },
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
    <footer className="border-t border-[#ead9c8] bg-[#fbf4ec] py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="HomeSplit" width={40} height={40} className="rounded-2xl object-contain" />
              <div>
                <span className="landing-display block text-xl font-semibold text-stone-900">HomeSplit</span>
                <span className="block text-xs uppercase tracking-[0.22em] text-stone-500">calendar calm pentru familie</span>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-stone-600">
              Program, ritualuri, documente și context pentru familii care vor mai puțină fricțiune și mai multă claritate.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Produs</h4>
              <ul className="mt-4 space-y-3">
                {FOOTER_LINKS.produs.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm text-stone-600 transition-colors hover:text-stone-900">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Legal</h4>
              <ul className="mt-4 space-y-3">
                {FOOTER_LINKS.legal.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-stone-600 transition-colors hover:text-stone-900">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Contact</h4>
              <ul className="mt-4 space-y-3">
                {FOOTER_LINKS.contact.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-stone-600 transition-colors hover:text-stone-900">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-stone-500">
          © {new Date().getFullYear()} HomeSplit. Co-parenting și organizare de familie cu mai mult calm.
        </p>
      </div>
    </footer>
  );
}
