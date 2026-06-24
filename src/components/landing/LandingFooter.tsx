"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export function LandingFooter() {
  const { t } = useLanguage();
  const fl = t.footer.links;

  const footerLinks = {
    produs: [
      { label: fl.features, href: "/#functionalitati" },
      { label: fl.howItWorks, href: "/#cum-functioneaza" },
      { label: fl.blog, href: "/blog" },
      { label: fl.pricing, href: "/#preturi" },
      { label: fl.faq, href: "/#intrebari" },
    ],
    coparenting: [
      { label: "Co-parenting", href: "/co-parenting" },
      { label: "Calendar copil", href: "/calendar-copil" },
      { label: "Program copil", href: "/program-copil" },
      { label: "Custodie comună", href: "/custodie-comuna" },
      { label: "Activitățile copilului", href: "/activitati-copil" },
      { label: "Vacanțe și program", href: "/vacante-si-program" },
      { label: "Zile indisponibile", href: "/zile-blocate" },
      { label: "Documente copil", href: "/documente-copil" },
      { label: "Aplicație co-parenting", href: "/aplicatie-co-parenting" },
      { label: "Părinți separați", href: "/pentru-parinti-separati" },
    ],
    companie: [
      { label: "Despre HomeSplit", href: "/despre" },
      { label: "FAQ", href: "/faq" },
      { label: "Descarcă", href: "/download" },
      { label: fl.terms, href: "/terms" },
      { label: fl.privacy, href: "/privacy" },
      { label: fl.cookies, href: "/cookies" },
    ],
    legal: [
      { label: fl.terms, href: "/terms" },
      { label: fl.privacy, href: "/privacy" },
      { label: fl.cookies, href: "/cookies" },
    ],
    contact: [
      { label: fl.support, href: "mailto:me@irinelnicoara.ro" },
      { label: fl.contactLabel, href: "mailto:me@irinelnicoara.ro" },
      { label: "Contact", href: "/contact" },
    ],
  };

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
              {t.footer.tagline}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{t.footer.product}</h4>
              <ul className="mt-4 space-y-3">
                {footerLinks.produs.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-stone-600 transition-colors hover:text-stone-900">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Co-parenting</h4>
              <ul className="mt-4 space-y-3">
                {footerLinks.coparenting.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-stone-600 transition-colors hover:text-stone-900">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{t.footer.contact}</h4>
              <ul className="mt-4 space-y-3">
                {footerLinks.contact.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-stone-600 transition-colors hover:text-stone-900">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <h4 className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{t.footer.legal}</h4>
              <ul className="mt-4 space-y-3">
                {footerLinks.companie.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-stone-600 transition-colors hover:text-stone-900">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-stone-500">
          © {new Date().getFullYear()} HomeSplit. {t.footer.tagline}
        </p>
      </div>
    </footer>
  );
}
