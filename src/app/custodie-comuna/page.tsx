import type { Metadata } from "next";
import {
  CalendarDays,
  Users,
  CheckCircle,
  Heart,
  MessageSquare,
  Shield,
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
  title: "Custodie comună — organizare eficientă pentru co-parenting",
  description:
    "Organizarea programului copilului în situații de custodie comună. Calendar comun, activități partajate și coordonare practică cu HomeSplit.",
  alternates: { canonical: `${siteUrl}/custodie-comuna` },
  openGraph: {
    title: "Custodie comună — organizare eficientă",
    description:
      "Organizarea programului copilului în custodie comună cu HomeSplit.",
    url: `${siteUrl}/custodie-comuna`,
    type: "website",
  },
};

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Calendar partajat",
    description:
      "Ambii părinți văd același calendar. Zilele de custodie sunt marcate clar, fără ambiguități sau neînțelegeri.",
    accent: "bg-[#f6dcc0] text-[#8a4b2d]",
  },
  {
    icon: Users,
    title: "Vizibilitate pentru amândoi",
    description:
      "Indiferent de modelul de custodie — alternativ, mixt sau personalizat — ambii părinți au aceeași vizibilitate.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
  {
    icon: CheckCircle,
    title: "Program clar",
    description:
      "Zilele la fiecare locuință sunt definite simplu. Copilul știe mereu ce urmează.",
    accent: "bg-[#f6e7c7] text-[#7a5620]",
  },
  {
    icon: MessageSquare,
    title: "Comunicare logistică",
    description:
      "Informațiile practice despre copil — orare, activități, sănătate — sunt centralizate și accesibile ambilor.",
    accent: "bg-[#dde8f6] text-[#365d89]",
  },
  {
    icon: Heart,
    title: "Centrat pe copil",
    description:
      "HomeSplit nu este despre conflicte sau drepturi. Este despre organizare și bunăstarea copilului.",
    accent: "bg-[#fde8d8] text-[#b85c3e]",
  },
  {
    icon: Shield,
    title: "Date în siguranță",
    description:
      "Informațiile copilului sunt accesibile doar părinților autorizați. Datele sensibile sunt protejate.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
];

const FAQ_ITEMS = [
  {
    q: "Ce înseamnă custodie comună în practică?",
    a: "Custodia comună înseamnă că ambii părinți au drept de decizie în privința copilului și că acesta petrece timp semnificativ cu fiecare. Există mai multe variante: custodie fizică alternativă, custodie fizică principală la un părinte cu vizite regulate la celălalt, sau aranjamente personalizate. Din punct de vedere organizatoric, important este să existe un program clar și predictibil.",
  },
  {
    q: "Cum ajută HomeSplit în situații de custodie comună?",
    a: "HomeSplit oferă un calendar comun partajat, unde ambii părinți văd același program al copilului. Poți defini zilele de custodie, activitățile recurente, vacanțele și zilele indisponibile — totul vizibil și actualizat în timp real pentru amândoi.",
  },
  {
    q: "HomeSplit oferă consultanță juridică despre custodie?",
    a: "Nu. HomeSplit este o platformă de organizare practică, nu un serviciu juridic sau psihologic. Pentru aspecte legale legate de custodie, vă recomandăm consultarea unui avocat specializat în dreptul familiei.",
  },
  {
    q: "Funcționează HomeSplit și dacă nu am acord formal de custodie?",
    a: "Da. HomeSplit este util indiferent dacă ai un acord formal sau o înțelegere informală. Platforma ajută la organizarea practică a vieții copilului, nu la aspectele juridice.",
  },
];

export default function CustodieComunaPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteUrl}/custodie-comuna`,
    name: "Custodie comună — organizare eficientă",
    description:
      "Organizarea programului copilului în custodie comună cu HomeSplit.",
    url: `${siteUrl}/custodie-comuna`,
    inLanguage: "ro-RO",
    isPartOf: { "@id": siteUrl },
  };

  return (
    <SeoPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SeoBreadcrumb
        items={[{ label: "Custodie comună", href: "/custodie-comuna" }]}
      />

      <SeoHero
        eyebrow="Custodie comună"
        h1="Custodie comună și"
        h1Accent="organizare eficientă"
        subtitle="Custodia comună presupune colaborare și predictibilitate pentru binele copilului. HomeSplit face organizarea practică mai simplă — fără tensiuni logistice."
        ctaLabel="Organizează acum gratuit"
        trustPills={[
          "Calendar partajat",
          "Program clar",
          "Ambii părinți vizibili",
          "Activități și vacanțe",
        ]}
      />

      {/* Disclaimer important */}
      <section className="py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-[1.6rem] border border-[#ead9c8] bg-[#faf3ec] px-6 py-5">
            <div className="flex items-start gap-4">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-[#b85c3e]" />
              <div>
                <p className="font-semibold text-stone-800">Notă importantă</p>
                <p className="mt-1 text-sm leading-6 text-stone-600">
                  HomeSplit nu oferă consultanță juridică și nu interpretează
                  legislația privind custodia. Platforma este un instrument de
                  organizare practică. Pentru aspecte juridice legate de
                  custodie, contactați un avocat specializat în dreptul
                  familiei.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ce este custodia comună */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-[2rem] border border-[#ead9c8] bg-white/80 p-8 sm:p-12">
            <h2 className="landing-display text-3xl leading-tight text-stone-900 sm:text-4xl">
              Custodia comună în practică
            </h2>
            <div className="mt-6 space-y-4 text-base leading-8 text-stone-600">
              <p>
                Custodia comună presupune implicarea activă a ambilor părinți
                în viața copilului după separare. Indiferent de modelul ales —
                alternativ, mixt sau personalizat — organizarea logistică
                rămâne o provocare constantă.
              </p>
              <p>
                Cel mai frecvent, dificultățile nu vin din lipsa bunei voințe,
                ci din lipsa unui sistem clar de organizare. Fiecare schimbare,
                activitate sau vacanță trebuie comunicată și confirmată manual.
              </p>
              <p>
                HomeSplit simplifică această organizare: un singur loc pentru
                programul copilului, vizibil și actualizat pentru ambii părinți.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Custodie alternativă (50/50)",
                  text: "Copilul petrece timp egal la fiecare locuință — de obicei săptămână la săptămână sau 2-2-3.",
                },
                {
                  title: "Custodie principală + vizite",
                  text: "Copilul locuiește preponderent la un părinte, cu vizite regulate la celălalt.",
                },
                {
                  title: "Aranjament personalizat",
                  text: "Orice model care se potrivește situației specifice a familiei.",
                },
                {
                  title: "Program flexibil",
                  text: "Perioade variabile cu fiecare părinte, adaptate la nevoile copilului și disponibilitatea ambilor.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.4rem] bg-[#f6f0e8] px-5 py-4"
                >
                  <p className="font-semibold text-stone-800">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SeoFeatureGrid
        eyebrow="Ce oferă HomeSplit"
        heading="Instrumentele de care ai nevoie"
        subheading="HomeSplit centralizează tot ce ține de organizarea practică a custodiei comune — fără haos, fără mesaje pierdute."
        features={FEATURES}
        columns={3}
      />

      <SeoFaqAccordion
        items={FAQ_ITEMS}
        pageUrl="/custodie-comuna"
        heading="Întrebări despre custodie comună"
      />

      <SeoInternalLinks
        heading="Subiecte legate de custodie"
        links={[
          {
            href: "/program-copil",
            label: "Program copil",
            description: "Cum organizezi zilele copilului.",
          },
          {
            href: "/calendar-copil",
            label: "Calendar copil",
            description: "Calendar comun pentru ambii părinți.",
          },
          {
            href: "/co-parenting",
            label: "Co-parenting",
            description: "Ghid complet despre co-parenting.",
          },
          {
            href: "/pentru-parinti-separati",
            label: "Pentru părinți separați",
            description: "De ce HomeSplit a fost gândit pentru familii moderne.",
          },
          {
            href: "/vacante-si-program",
            label: "Vacanțe și program",
            description: "Coordonarea vacanțelor în co-parenting.",
          },
          {
            href: "/faq",
            label: "Întrebări frecvente",
            description: "Răspunsuri la cele mai frecvente întrebări.",
          },
        ]}
      />

      <SeoBlogLinks categorySlug="coparenting" categoryLabel="co-parenting &amp; custodie" />
      <SeoCTA heading="Organizează custodia comună mai simplu" />
    </SeoPageShell>
  );
}
