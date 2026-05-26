import type { Metadata } from "next";
import { Mail, MessageSquare, Clock } from "lucide-react";
import Link from "next/link";
import { SeoPageShell } from "@/components/seo/SeoPageShell";
import { SeoBreadcrumb } from "@/components/seo/SeoBreadcrumb";
import { SeoInternalLinks } from "@/components/seo/SeoInternalLinks";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact HomeSplit — suport și întrebări",
  description:
    "Contactează echipa HomeSplit pentru suport, întrebări sau feedback. Răspundem în cel mai scurt timp.",
  alternates: { canonical: `${siteUrl}/contact` },
  openGraph: {
    title: "Contact — HomeSplit",
    description:
      "Contactează echipa HomeSplit pentru suport și întrebări.",
    url: `${siteUrl}/contact`,
    type: "website",
  },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${siteUrl}/contact`,
    name: "Contact HomeSplit",
    description: "Pagina de contact a platformei HomeSplit.",
    url: `${siteUrl}/contact`,
    inLanguage: "ro-RO",
    isPartOf: { "@id": siteUrl },
    mainEntity: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "HomeSplit",
      url: siteUrl,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "me@irinelnicoara.ro",
        availableLanguage: ["Romanian", "English"],
      },
    },
  };

  return (
    <SeoPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SeoBreadcrumb items={[{ label: "Contact", href: "/contact" }]} />

      {/* Hero */}
      <section className="pb-16 pt-10 sm:pb-20 sm:pt-14">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="inline-flex rounded-full border border-[#ead9c8] bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Suport
          </span>
          <h1 className="landing-display mt-5 text-4xl leading-tight text-stone-900 sm:text-5xl lg:text-6xl">
            Cum te putem ajuta?
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-stone-600">
            Ai o întrebare, un feedback sau ai nevoie de ajutor? Scrie-ne —
            răspundem în cel mai scurt timp.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Mail,
                title: "Email suport",
                desc: "Pentru orice întrebare sau problemă",
                action: "me@irinelnicoara.ro",
                href: "mailto:me@irinelnicoara.ro",
                accent: "bg-[#f6dcc0] text-[#8a4b2d]",
              },
              {
                icon: MessageSquare,
                title: "Feedback produs",
                desc: "Idei, sugestii sau funcționalități dorite",
                action: "Trimite feedback",
                href: "mailto:me@irinelnicoara.ro?subject=Feedback HomeSplit",
                accent: "bg-[#d9eee8] text-[#1f5a4e]",
              },
              {
                icon: Clock,
                title: "Timp de răspuns",
                desc: "De obicei răspundem în",
                action: "1–2 zile lucrătoare",
                href: null,
                accent: "bg-[#f6e7c7] text-[#7a5620]",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-[1.8rem] border border-[#ead9c8] bg-white/88 p-6 shadow-[0_16px_36px_rgba(28,25,23,0.05)]"
                >
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${card.accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-stone-900">{card.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-stone-500">
                    {card.desc}
                  </p>
                  {card.href ? (
                    <a
                      href={card.href}
                      className="mt-3 inline-block text-sm font-semibold text-[#b85c3e] hover:underline"
                    >
                      {card.action}
                    </a>
                  ) : (
                    <p className="mt-3 text-sm font-semibold text-stone-700">
                      {card.action}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Email CTA */}
          <div className="mt-10 rounded-[2rem] bg-[linear-gradient(135deg,#2f4b46_0%,#1f3a36_100%)] px-8 py-12 text-center">
            <h2 className="landing-display text-3xl text-white sm:text-4xl">
              Scrie-ne direct
            </h2>
            <p className="mt-4 text-base text-white/75">
              Ne place să auzim de la utilizatori. Feedback-ul vostru ne ajută
              să construim un produs mai bun.
            </p>
            <a
              href="mailto:me@irinelnicoara.ro"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] px-8 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(191,106,75,0.32)] transition hover:brightness-[1.04]"
            >
              <Mail className="h-4 w-4" />
              me@irinelnicoara.ro
            </a>
          </div>
        </div>
      </section>

      {/* FAQ redirect */}
      <section className="border-t border-[#ead9c8] py-12">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="text-base text-stone-600">
            Poate găsești răspunsul deja în{" "}
            <Link
              href="/faq"
              className="font-semibold text-[#b85c3e] hover:underline"
            >
              secțiunea FAQ
            </Link>
            .
          </p>
        </div>
      </section>

      <SeoInternalLinks
        heading="Resurse utile"
        links={[
          { href: "/faq", label: "Întrebări frecvente", description: "Răspunsuri la cele mai frecvente întrebări." },
          { href: "/despre", label: "Despre HomeSplit", description: "Povestea și valorile platformei." },
          { href: "/aplicatie-co-parenting", label: "Aplicație co-parenting", description: "Tot ce include HomeSplit." },
          { href: "/register", label: "Creează cont", description: "Încearcă gratuit 14 zile Pro." },
          { href: "/blog", label: "Blog", description: "Articole despre co-parenting." },
          { href: "/co-parenting", label: "Co-parenting", description: "Ghid complet co-parenting." },
        ]}
      />
    </SeoPageShell>
  );
}
