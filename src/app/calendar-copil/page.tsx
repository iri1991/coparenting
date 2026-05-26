import type { Metadata } from "next";
import {
  CalendarDays,
  Eye,
  Bell,
  Repeat2,
  Smartphone,
  RefreshCw,
} from "lucide-react";
import { SeoPageShell } from "@/components/seo/SeoPageShell";
import { SeoBreadcrumb } from "@/components/seo/SeoBreadcrumb";
import { SeoHero } from "@/components/seo/SeoHero";
import { SeoFeatureGrid } from "@/components/seo/SeoFeatureGrid";
import { SeoCTA } from "@/components/seo/SeoCTA";
import { SeoInternalLinks } from "@/components/seo/SeoInternalLinks";
import { SeoBlogLinks } from "@/components/seo/SeoBlogLinks";
import { SeoFaqAccordion } from "@/components/seo/SeoFaqAccordion";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Calendar copil pentru părinți separați — vedere săptămânală și lunară",
  description:
    "Calendar comun pentru organizarea programului copilului, activităților și vacanțelor. Ambii părinți văd același calendar actualizat în timp real.",
  alternates: { canonical: `${siteUrl}/calendar-copil` },
  openGraph: {
    title: "Calendar copil pentru părinți separați",
    description:
      "Calendar comun pentru organizarea programului copilului, activităților și vacanțelor.",
    url: `${siteUrl}/calendar-copil`,
    type: "website",
  },
};

const FEATURES = [
  {
    icon: Eye,
    title: "Vizibilitate completă",
    description:
      "Ambii părinți văd același calendar în timp real. Fără versiuni diferite, fără neînțelegeri despre ce s-a modificat și când.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
  {
    icon: CalendarDays,
    title: "Vedere săptămânală și lunară",
    description:
      "Alege vizualizarea care ți se potrivește: zi cu zi, săptămână sau lună. Programul copilului devine clar la orice scară.",
    accent: "bg-[#f6dcc0] text-[#8a4b2d]",
  },
  {
    icon: Repeat2,
    title: "Activități recurente",
    description:
      "Balet miercuri, înot vineri, meditații luni — activitățile recurente se afișează automat în calendar fără să le introduci de fiecare dată.",
    accent: "bg-[#dde8f6] text-[#365d89]",
  },
  {
    icon: Bell,
    title: "Notificări pentru ambii părinți",
    description:
      "Când programul se modifică, ambii părinți primesc notificare. Schimbările nu se pierd în conversații.",
    accent: "bg-[#f6e7c7] text-[#7a5620]",
  },
  {
    icon: RefreshCw,
    title: "Schimbări rapide",
    description:
      "Dacă apare o situație excepțională, orice modificare de program se actualizează imediat și este vizibilă pentru celălalt părinte.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
  {
    icon: Smartphone,
    title: "Accesibil pe telefon",
    description:
      "Calendarul funcționează perfect pe mobil. Poți verifica programul copilului oricând, de oriunde.",
    accent: "bg-[#f6dcc0] text-[#8a4b2d]",
  },
];

const FAQ_ITEMS = [
  {
    q: "Cum funcționează calendarul comun în HomeSplit?",
    a: "Ambii părinți invitați în aceeași familie văd același calendar. Orice modificare adusă de un părinte este vizibilă imediat celuilalt. Calendarul afișează zilele cu copilul, activitățile recurente, vacanțele și zilele indisponibile.",
  },
  {
    q: "Pot adăuga activitățile recurente ale copilului în calendar?",
    a: "Da. Poți defini activități care se repetă săptămânal sau la intervale regulate — balet, înot, meditații, afterschool — și ele vor apărea automat în calendar.",
  },
  {
    q: "Pot exporta sau sincroniza cu Google Calendar?",
    a: "HomeSplit oferă export ICS pentru integrare cu alte aplicații de calendar. Detaliile de integrare sunt disponibile în setările contului.",
  },
  {
    q: "Ce se întâmplă dacă un eveniment se modifică retroactiv?",
    a: "Modificările sunt vizibile pentru ambii părinți și sunt marcate clar. Istoricul schimbărilor rămâne accesibil.",
  },
];

export default function CalendarCopilPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteUrl}/calendar-copil`,
    name: "Calendar copil pentru părinți separați",
    description:
      "Calendar comun pentru organizarea programului copilului, activităților și vacanțelor în co-parenting.",
    url: `${siteUrl}/calendar-copil`,
    inLanguage: "ro-RO",
    isPartOf: { "@id": siteUrl },
    about: {
      "@type": "SoftwareApplication",
      name: "HomeSplit",
      applicationCategory: "LifestyleApplication",
    },
  };

  return (
    <SeoPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SeoBreadcrumb
        items={[{ label: "Calendar copil", href: "/calendar-copil" }]}
      />

      <SeoHero
        eyebrow="Calendar comun"
        h1="Calendar clar pentru"
        h1Accent="ambii părinți"
        subtitle="Un singur calendar partajat pentru programul copilului, activitățile recurente și vacanțe. Ambii părinți văd exact același lucru, actualizat în timp real."
        ctaLabel="Creează calendar gratuit"
        secondaryLabel="Cum funcționează"
        trustPills={[
          "Vedere săptămânală",
          "Vedere lunară",
          "Activități recurente",
          "Notificări instant",
          "Accesibil pe mobil",
        ]}
      />

      {/* Visual preview section */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-[2rem] border border-[#ead9c8] bg-white/88 shadow-[0_30px_80px_rgba(28,25,23,0.08)]">
            {/* Calendar header mock */}
            <div className="border-b border-[#f0e3d7] bg-[#faf3ec] px-6 py-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-stone-800">
                  Săptămâna copilului
                </h3>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#d9eee8] px-3 py-1 text-xs font-semibold text-[#1f5a4e]">
                    Vedere săptămânală
                  </span>
                  <span className="rounded-full bg-[#f6e7c7] px-3 py-1 text-xs font-semibold text-[#7a5620]">
                    Vedere lunară
                  </span>
                </div>
              </div>
            </div>
            {/* Calendar rows mock */}
            <div className="divide-y divide-[#f6ede4] p-4 sm:p-6">
              {[
                { day: "Luni", label: "acasă la mama", tone: "bg-[#f6d7bf] text-[#8a4b2d]", activity: "" },
                { day: "Marți", label: "Balet 17:00", tone: "bg-[#dde8f6] text-[#365d89]", activity: "activitate" },
                { day: "Miercuri", label: "acasă la mama", tone: "bg-[#f6d7bf] text-[#8a4b2d]", activity: "" },
                { day: "Joi", label: "Meditații 16:30", tone: "bg-[#dde8f6] text-[#365d89]", activity: "activitate" },
                { day: "Vineri", label: "acasă la tata", tone: "bg-[#d6ebe5] text-[#1f5a4e]", activity: "" },
                { day: "Sâmbătă", label: "acasă la tata", tone: "bg-[#d6ebe5] text-[#1f5a4e]", activity: "" },
                { day: "Duminică", label: "acasă la tata", tone: "bg-[#d6ebe5] text-[#1f5a4e]", activity: "" },
              ].map((row) => (
                <div
                  key={row.day}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="w-20 shrink-0 text-sm font-semibold text-stone-500">
                    {row.day}
                  </span>
                  <div className="flex flex-1 items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${row.tone}`}
                    >
                      {row.label}
                    </span>
                    {row.activity && (
                      <span className="rounded-full bg-[#f4e8fb] px-3 py-1 text-xs font-semibold text-[#6b3fa0]">
                        {row.activity}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#f0e3d7] bg-[#faf3ec] px-6 py-4 text-center">
              <p className="text-xs text-stone-500">
                Calendar actualizat în timp real · accesibil de pe orice dispozitiv
              </p>
            </div>
          </div>
        </div>
      </section>

      <SeoFeatureGrid
        eyebrow="Funcționalități calendar"
        heading="Mai puține neînțelegeri, mai mult timp"
        subheading="Un calendar comun reduce confuziile și ajută ambii părinți să aibă aceeași vizibilitate asupra programului copilului."
        features={FEATURES}
        columns={3}
      />

      {/* Beneficii emoționale */}
      <section className="bg-[#f2ebe2] py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="landing-display text-3xl leading-tight text-stone-900 sm:text-4xl">
            Copilul simte claritatea
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-stone-600">
            Când programul este clar și predictibil, copilul nu se mai simte
            prins la mijloc. Știe unde va fi, cu cine și ce urmează — și asta
            face o diferență reală în starea lui emoțională.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
              { stat: "Mai puțin stres", desc: "pentru ambii părinți, când totul este vizibil și clar" },
              { stat: "Zero surprize", desc: "pentru copil — programul lui este predictibil și stabil" },
              { stat: "Un loc", desc: "pentru tot ce ține de programul copilului" },
            ].map((item) => (
              <div
                key={item.stat}
                className="rounded-[1.6rem] border border-[#ead9c8] bg-white/88 p-6 shadow-[0_12px_28px_rgba(28,25,23,0.05)]"
              >
                <p className="landing-display text-2xl text-[#b85c3e]">
                  {item.stat}
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SeoFaqAccordion
        items={FAQ_ITEMS}
        pageUrl="/calendar-copil"
        heading="Întrebări despre calendarul copilului"
      />

      <SeoInternalLinks
        heading="Vezi și"
        links={[
          {
            href: "/program-copil",
            label: "Program copil",
            description: "Organizarea zilelor copilului după separare.",
          },
          {
            href: "/activitati-copil",
            label: "Activități copil",
            description: "Gestionarea activităților recurente în calendar.",
          },
          {
            href: "/vacante-si-program",
            label: "Vacanțe și program",
            description: "Coordonarea vacanțelor și perioadelor speciale.",
          },
          {
            href: "/zile-blocate",
            label: "Zile indisponibile",
            description: "Marchează perioadele când nu ești disponibil.",
          },
          {
            href: "/co-parenting",
            label: "Despre co-parenting",
            description: "Ghid complet despre organizarea co-parentingului.",
          },
          {
            href: "/aplicatie-co-parenting",
            label: "Aplicație co-parenting",
            description: "Tot ce include HomeSplit pentru co-parenting.",
          },
        ]}
      />

      <SeoBlogLinks categorySlug="rutine-si-tranzitii" categoryLabel="rutine &amp; tranziții" />
      <SeoCTA heading="Creează calendarul comun al copilului" />
    </SeoPageShell>
  );
}
