import type { Metadata } from "next";
import {
  Palmtree,
  CalendarDays,
  Bell,
  Users,
  CheckCircle,
  Clock,
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
  title: "Vacanțe și program copil în co-parenting — coordonare simplă",
  description:
    "Cum coordonezi vacanțele și perioadele speciale în co-parenting. Planifică vacanțele de vară, de iarnă și sărbătorile fără suprapuneri sau tensiuni.",
  alternates: { canonical: `${siteUrl}/vacante-si-program` },
  openGraph: {
    title: "Vacanțe și program copil în co-parenting",
    description:
      "Coordonarea vacanțelor și perioadelor speciale în co-parenting cu HomeSplit.",
    url: `${siteUrl}/vacante-si-program`,
    type: "website",
  },
};

const FEATURES = [
  {
    icon: Palmtree,
    title: "Planifică vacanțele din timp",
    description:
      "Propune perioadele de vacanță în avans și evită suprapunerile sau conflictele de ultim moment.",
    accent: "bg-[#dde8f6] text-[#365d89]",
  },
  {
    icon: CalendarDays,
    title: "Vizibilitate completă",
    description:
      "Ambii părinți văd vacanțele planificate în calendarul comun — fără surprize, fără neînțelegeri.",
    accent: "bg-[#f6dcc0] text-[#8a4b2d]",
  },
  {
    icon: Users,
    title: "Coordonare ușoară",
    description:
      "Discutați disponibilitatea și ajungeți la un acord simplu — totul documentat în platformă.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
  {
    icon: Bell,
    title: "Notificări la timp",
    description:
      "Ambii părinți primesc notificare când o vacanță este propusă sau modificată.",
    accent: "bg-[#f6e7c7] text-[#7a5620]",
  },
  {
    icon: CheckCircle,
    title: "Sărbători organizate",
    description:
      "Crăciun, Paște, vacanța de primăvară — perioadele speciale sunt planificate din timp și marcate clar.",
    accent: "bg-[#fde8d8] text-[#b85c3e]",
  },
  {
    icon: Clock,
    title: "Fără suprapuneri",
    description:
      "Calendarul semnalează automat suprapunerile între vacanțe și programul obișnuit.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
];

const VACANTE_TYPES = [
  { label: "Vacanță de vară", desc: "Planifică din timp cine are copilul și în ce perioadă" },
  { label: "Vacanță de iarnă", desc: "Crăciun, Revelion, Sf. Ioan — totul coordonat" },
  { label: "Vacanță de primăvară", desc: "Paște și vacanța școlară de primăvară" },
  { label: "Concediu parental", desc: "Concedii cu fiecare părinte, vizibil pentru amândoi" },
  { label: "Weekend-uri speciale", desc: "Zile de naștere, aniversări, evenimente de familie" },
  { label: "Excursii școlare", desc: "Activitățile școlare care modifică programul obișnuit" },
];

const FAQ_ITEMS = [
  {
    q: "Cum coordonez vacanțele de vară cu celălalt părinte?",
    a: "În HomeSplit poți propune perioadele de vacanță direct din calendar. Celălalt părinte vede propunerea, poate confirma sau propune modificări. Totul rămâne documentat și vizibil pentru amândoi.",
  },
  {
    q: "Ce se întâmplă dacă ambii părinți vor aceeași perioadă pentru vacanță?",
    a: "HomeSplit evidențiază suprapunerile și permite negocierea în platformă. Scopul este să ajungeți la un acord în avans, nu în ultimul moment.",
  },
  {
    q: "Pot planifica vacanțe cu câteva luni în avans?",
    a: "Da. Poți adăuga orice eveniment sau perioadă în calendar, indiferent cât de mult timp în avans. Planificarea timpurie reduce tensiunile și oferă predictibilitate copilului.",
  },
  {
    q: "Pot marca în calendar Crăciunul sau Paștele din timp?",
    a: "Da. Perioadele speciale — sărbători, zile de naștere, excursii școlare — pot fi marcate cu un an sau mai mult în avans.",
  },
];

export default function VacanteSiProgramPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteUrl}/vacante-si-program`,
    name: "Vacanțe și program copil în co-parenting",
    description:
      "Coordonarea vacanțelor și perioadelor speciale în co-parenting cu HomeSplit.",
    url: `${siteUrl}/vacante-si-program`,
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
        items={[
          { label: "Vacanțe și program", href: "/vacante-si-program" },
        ]}
      />

      <SeoHero
        eyebrow="Vacanțe în co-parenting"
        h1="Vacanțele copilului"
        h1Accent="coordonate simplu"
        subtitle="Vacanțele de vară, de iarnă și sărbătorile sunt momente importante pentru copil. HomeSplit ajută ambii părinți să le planifice din timp, fără tensiuni de ultim moment."
        ctaLabel="Planifică prima vacanță"
        trustPills={[
          "Vacanță de vară",
          "Crăciun & Paște",
          "Fără suprapuneri",
          "Planifică din timp",
        ]}
      />

      {/* Tipuri de vacanțe */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="landing-display text-4xl leading-tight text-stone-900 sm:text-5xl">
              Ce poți planifica?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-stone-600">
              De la vacanțele lungi de vară la weekendurile speciale — orice
              perioadă poate fi planificată și coordonată în HomeSplit.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VACANTE_TYPES.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.6rem] border border-[#ead9c8] bg-white/88 p-5 shadow-[0_12px_28px_rgba(28,25,23,0.05)]"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Palmtree className="h-4 w-4 text-[#1f5a4e]" />
                  <p className="font-semibold text-stone-800">{item.label}</p>
                </div>
                <p className="text-sm leading-6 text-stone-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SeoFeatureGrid
        eyebrow="Cum funcționează"
        heading="Coordonare mai simplă pentru vacanțe"
        subheading="Propune perioade, discută disponibilitatea și evită suprapunerile sau confuziile — totul din HomeSplit."
        features={FEATURES}
        columns={3}
      />

      {/* Exemplu practic */}
      <section className="bg-[#f2ebe2] py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="landing-display mb-8 text-3xl leading-tight text-stone-900 sm:text-4xl">
            Un exemplu practic
          </h2>
          <div className="space-y-4">
            {[
              {
                luna: "Martie",
                actiune: "Mama propune vacanța de vară: 1–15 iulie",
                status: "propus",
              },
              {
                luna: "Aprilie",
                actiune: "Tata confirmă și propune 16–31 iulie",
                status: "confirmat",
              },
              {
                luna: "Aprilie",
                actiune: "Ambii părinți văd vacanțele de vară finalizate în calendar",
                status: "finalizat",
              },
              {
                luna: "Mai",
                actiune: "Mama adaugă vacanța școlară de Paște",
                status: "adaugat",
              },
              {
                luna: "Noiembrie",
                actiune: "Planificarea Crăciunului — propuneri și confirmare",
                status: "planificat",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-[1.4rem] border border-[#ead9c8] bg-white/88 p-5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1f3a36] text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
                    {step.luna}
                  </span>
                  <p className="mt-1 text-sm font-semibold text-stone-800">
                    {step.actiune}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    step.status === "finalizat" || step.status === "confirmat"
                      ? "bg-[#d9eee8] text-[#1f5a4e]"
                      : "bg-[#f6e7c7] text-[#7a5620]"
                  }`}
                >
                  {step.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SeoFaqAccordion
        items={FAQ_ITEMS}
        pageUrl="/vacante-si-program"
        heading="Întrebări despre vacanțe în co-parenting"
      />

      <SeoInternalLinks
        heading="Vezi și"
        links={[
          { href: "/calendar-copil", label: "Calendar copil", description: "Calendar comun actualizat în timp real." },
          { href: "/program-copil", label: "Program copil", description: "Organizarea zilnică și săptămânală." },
          { href: "/zile-blocate", label: "Zile indisponibile", description: "Marchează perioadele indisponibile." },
          { href: "/activitati-copil", label: "Activitățile copilului", description: "Activitățile recurente în calendar." },
          { href: "/co-parenting", label: "Despre co-parenting", description: "Ghid complet despre co-parenting." },
          { href: "/aplicatie-co-parenting", label: "Aplicație co-parenting", description: "Tot ce include HomeSplit." },
        ]}
      />

      <SeoCTA heading="Planifică vacanțele fără stres" />
    </SeoPageShell>
  );
}
