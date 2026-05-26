import type { Metadata } from "next";
import {
  CalendarDays,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BookOpen,
  Heart,
} from "lucide-react";
import { SeoPageShell } from "@/components/seo/SeoPageShell";
import { SeoBreadcrumb } from "@/components/seo/SeoBreadcrumb";
import { SeoHero } from "@/components/seo/SeoHero";
import { SeoFeatureGrid } from "@/components/seo/SeoFeatureGrid";
import { SeoCTA } from "@/components/seo/SeoCTA";
import { SeoInternalLinks } from "@/components/seo/SeoInternalLinks";
import { SeoFaqAccordion } from "@/components/seo/SeoFaqAccordion";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Ce înseamnă co-parenting și cum îl poți organiza mai simplu",
  description:
    "Ghid complet despre co-parenting: ce este, cum funcționează în practică și cum poți organiza programul copilului, activitățile și comunicarea dintre părinți separați cu HomeSplit.",
  alternates: {
    canonical: `${siteUrl}/co-parenting`,
  },
  openGraph: {
    title: "Ce înseamnă co-parenting și cum îl poți organiza mai simplu",
    description:
      "Ghid complet despre co-parenting: organizarea programului copilului, activităților și comunicarea logistică dintre părinți separați.",
    url: `${siteUrl}/co-parenting`,
    type: "article",
  },
};

const PROBLEMS = [
  {
    icon: MessageSquare,
    title: "Informații împrăștiate",
    description:
      "Programul copilului se discută în WhatsApp, pe telefon, prin e-mail și prin terți — niciodată într-un loc clar accesibil amândurora.",
    accent: "bg-[#fde8d8] text-[#b85c3e]",
  },
  {
    icon: AlertTriangle,
    title: "Schimbări de ultim moment",
    description:
      "Modificările de program ajung prea târziu sau nu ajung deloc, creând tensiuni și confuzie pentru copil.",
    accent: "bg-[#fde8d8] text-[#b85c3e]",
  },
  {
    icon: Clock,
    title: "Activități uitate",
    description:
      "Balet, meditații, înot — fiecare activitate recurentă devine o sursă de incertitudine când un singur părinte o ține minte.",
    accent: "bg-[#fde8d8] text-[#b85c3e]",
  },
  {
    icon: CalendarDays,
    title: "Vacanțe greu de coordonat",
    description:
      "Planificarea concediilor și perioadelor speciale presupune negocieri lungi și risc de suprapunere.",
    accent: "bg-[#fde8d8] text-[#b85c3e]",
  },
  {
    icon: Users,
    title: "Comunicare fragmentată",
    description:
      "Fără un spațiu comun, fiecare mesaj despre copil se pierde în conversații mixte și greu de urmărit.",
    accent: "bg-[#fde8d8] text-[#b85c3e]",
  },
  {
    icon: BookOpen,
    title: "Documente inaccesibile",
    description:
      "Pașaportul, certificatul de naștere, informațiile medicale — nu sunt niciodată la îndemâna ambilor părinți în același timp.",
    accent: "bg-[#fde8d8] text-[#b85c3e]",
  },
];

const SOLUTIONS = [
  {
    icon: CalendarDays,
    title: "Calendar comun",
    description:
      "Ambii părinți văd același calendar: zilele copilului, activitățile recurente, vacanțele și perioadele speciale — actualizate în timp real.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
  {
    icon: CheckCircle,
    title: "Program predictibil",
    description:
      "Programul săptămânal și lunar al copilului este vizibil pentru ambii părinți. Fără ambiguități, fără întrebări repetate.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
  {
    icon: Clock,
    title: "Activități organizate",
    description:
      "Toate activitățile recurente ale copilului — înot, balet, meditații, afterschool — sunt vizibile și urmărite de ambii părinți.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
  {
    icon: Heart,
    title: "Copil first",
    description:
      "HomeSplit nu este despre conflict. Este despre stabilitate, claritate și un mediu predictibil pentru copil — indiferent unde se află.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
];

const FAQ_ITEMS = [
  {
    q: "Ce este co-parentingul?",
    a: "Co-parentingul este colaborarea dintre doi părinți separați sau divorțați pentru a crește și educa copilul împreună, chiar dacă nu mai locuiesc în aceeași casă. Presupune organizarea programului, activităților, vacanțelor și a comunicării logistice legate de copil.",
  },
  {
    q: "Care sunt principiile unui co-parenting sănătos?",
    a: "Un co-parenting sănătos se bazează pe: comunicare clară și respectuoasă, program predictibil pentru copil, separarea conflictelor adulților de nevoile copilului, flexibilitate și disponibilitate pentru situații neprevăzute, și centrarea deciziilor pe binele copilului.",
  },
  {
    q: "Cum ajută HomeSplit la organizarea co-parentingului?",
    a: "HomeSplit centralizează tot ce ține de copil: calendar comun cu programul săptămânal, activități recurente, zile indisponibile, vacanțe și documente importante — accesibil ambilor părinți de pe telefon sau computer.",
  },
  {
    q: "Este necesară cooperarea ambilor părinți pentru a folosi HomeSplit?",
    a: "HomeSplit funcționează cel mai bine când ambii părinți îl folosesc. Unul dintre părinți creează contul și îl invită pe celălalt. Dacă celălalt părinte nu este disponibil, poți folosi și singur platforma pentru a-ți organiza propria parte din program.",
  },
  {
    q: "HomeSplit oferă consultanță juridică sau psihologică?",
    a: "Nu. HomeSplit este o platformă de organizare și logistică pentru co-parenting. Nu oferă consultanță juridică, psihologică sau de mediere. Pentru aceste nevoi, vă recomandăm să apelați la specialiști calificați.",
  },
];

export default function CoParentingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${siteUrl}/co-parenting`,
    headline: "Ce înseamnă co-parenting și cum îl poți organiza mai simplu",
    description:
      "Ghid complet despre co-parenting: organizarea programului copilului, activităților și comunicarea logistică dintre părinți separați.",
    url: `${siteUrl}/co-parenting`,
    inLanguage: "ro-RO",
    author: { "@type": "Organization", name: "HomeSplit", url: siteUrl },
    publisher: { "@type": "Organization", name: "HomeSplit", url: siteUrl },
    about: { "@type": "Thing", name: "Co-parenting" },
    mainEntityOfPage: `${siteUrl}/co-parenting`,
  };

  return (
    <SeoPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SeoBreadcrumb
        items={[{ label: "Co-parenting", href: "/co-parenting" }]}
      />

      <SeoHero
        eyebrow="Organizare co-parenting"
        h1="Co-parenting organizat"
        h1Accent="și predictibil"
        subtitle="Co-parentingul presupune colaborarea dintre părinți pentru organizarea vieții copilului după separare sau divorț. HomeSplit ajută la claritate, organizare și liniște pentru toată familia."
        ctaLabel="Încearcă HomeSplit gratuit"
        secondaryLabel="Vezi cum funcționează"
        trustPills={[
          "Calendar comun",
          "Program predictibil",
          "Activități organizate",
          "Documente la îndemână",
        ]}
      />

      {/* Ce este co-parentingul */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-[2rem] border border-[#ead9c8] bg-white/80 p-8 sm:p-12">
            <span className="inline-flex rounded-full border border-[#ead9c8] bg-[#fff5eb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Definiție
            </span>
            <h2 className="landing-display mt-5 text-3xl leading-tight text-stone-900 sm:text-4xl">
              Ce înseamnă co-parenting?
            </h2>
            <div className="mt-6 space-y-4 text-base leading-8 text-stone-600">
              <p>
                <strong className="text-stone-800">Co-parentingul</strong> este
                procesul prin care doi părinți separați sau divorțați colaborează
                pentru a crește și educa copilul împreună, chiar dacă nu mai
                locuiesc sub același acoperiș.
              </p>
              <p>
                Spre deosebire de custodia exclusivă, co-parentingul implică
                implicarea activă a ambilor părinți în viața copilului: decizii
                comune, program partajat, comunicare continuă despre nevoile
                copilului.
              </p>
              <p>
                Un co-parenting bine organizat reduce stresul pentru copil,
                creează predictibilitate și îi oferă siguranța că ambii părinți
                sunt prezenți și coordonați.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Claritate",
                  text: "Program clar, activități planificate, vacanțe coordonate.",
                },
                {
                  label: "Comunicare",
                  text: "Informații logistice transmise eficient, fără tensiuni.",
                },
                {
                  label: "Stabilitate",
                  text: "Copilul știe ce urmează și se simte în siguranță.",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.4rem] bg-[#f6f0e8] px-5 py-4"
                >
                  <p className="font-semibold text-stone-800">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Probleme frecvente */}
      <SeoFeatureGrid
        eyebrow="Provocări frecvente"
        heading="Cele mai frecvente probleme în co-parenting"
        subheading="Când programul copilului este gestionat prin WhatsApp, conversații fragmentate și calendare separate, apar inevitabil confuzii și tensiuni."
        features={PROBLEMS}
        columns={3}
      />

      {/* Soluții HomeSplit */}
      <section className="bg-[#f2ebe2] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 flex flex-col items-center gap-4 text-center">
            <span className="inline-flex rounded-full border border-[#ead9c8] bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Soluție
            </span>
            <h2 className="landing-display max-w-3xl text-4xl leading-tight text-stone-900 sm:text-5xl">
              Un singur loc pentru tot ce ține de copil
            </h2>
            <p className="max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">
              HomeSplit centralizează programul, activitățile și informațiile
              importante — accesibil ambilor părinți, oricând.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {SOLUTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="rounded-[1.8rem] border border-[#ead9c8] bg-white/88 p-6 shadow-[0_16px_36px_rgba(28,25,23,0.05)]"
                >
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${s.accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-stone-900">
                    {s.title}
                  </h3>
                  <p className="text-sm leading-7 text-stone-600">
                    {s.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Citat emoțional */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <blockquote className="landing-display text-3xl leading-relaxed text-stone-800 sm:text-4xl">
            „Co-parentingul este suficient de complicat. Organizarea lui nu
            trebuie să fie."
          </blockquote>
          <p className="mt-5 text-sm text-stone-500">
            Principiul care stă la baza HomeSplit.
          </p>
        </div>
      </section>

      <SeoFaqAccordion
        items={FAQ_ITEMS}
        pageUrl="/co-parenting"
        heading="Întrebări despre co-parenting"
      />

      <SeoInternalLinks
        heading="Resurse utile pentru co-parenting"
        links={[
          {
            href: "/calendar-copil",
            label: "Calendar copil",
            description: "Calendar comun pentru programul copilului, vizibil ambilor părinți.",
          },
          {
            href: "/program-copil",
            label: "Program copil",
            description: "Cum organizezi zilele copilului după divorț sau separare.",
          },
          {
            href: "/activitati-copil",
            label: "Activitățile copilului",
            description: "Gestionarea activităților recurente: înot, balet, meditații.",
          },
          {
            href: "/vacante-si-program",
            label: "Vacanțe și program",
            description: "Coordonarea vacanțelor și perioadelor speciale.",
          },
          {
            href: "/zile-blocate",
            label: "Zile indisponibile",
            description: "Planifică mai simplu cu ajutorul zilelor blocate.",
          },
          {
            href: "/pentru-parinti-separati",
            label: "Pentru părinți separați",
            description: "De ce HomeSplit a fost gândit pentru familii moderne.",
          },
        ]}
      />

      <SeoCTA />
    </SeoPageShell>
  );
}
