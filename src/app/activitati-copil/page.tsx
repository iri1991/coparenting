import type { Metadata } from "next";
import {
  Music,
  Waves,
  BookOpen,
  Star,
  CalendarDays,
  Bell,
  Repeat2,
  Users,
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
  title: "Activitățile copilului organizate simplu pentru părinți separați",
  description:
    "Organizează activitățile recurente ale copilului — balet, înot, meditații, afterschool — într-un calendar comun accesibil ambilor părinți cu HomeSplit.",
  alternates: { canonical: `${siteUrl}/activitati-copil` },
  openGraph: {
    title: "Activitățile copilului organizate simplu",
    description:
      "Balet, înot, meditații, afterschool — organizate în calendar comun pentru ambii părinți.",
    url: `${siteUrl}/activitati-copil`,
    type: "website",
  },
};

const ACTIVITATI_LIST = [
  { icon: Waves, label: "Înot", desc: "Ore săptămânale la bazin" },
  { icon: Music, label: "Balet și dans", desc: "Antrenamente recurente" },
  { icon: BookOpen, label: "Meditații", desc: "Pregătire suplimentară" },
  { icon: Star, label: "Afterschool", desc: "Program zilnic sau parțial" },
  { icon: Music, label: "Muzică și instrumente", desc: "Ore individuale sau grup" },
  { icon: Waves, label: "Sport și atletism", desc: "Fotbal, tenis, gimnastică" },
  { icon: BookOpen, label: "Limbi străine", desc: "Engleză, franceză și altele" },
  { icon: Star, label: "Arte vizuale", desc: "Pictură, desen, ceramică" },
  { icon: CalendarDays, label: "Excursii și ieșiri", desc: "Activități de grup" },
  { icon: Users, label: "Socializare", desc: "Întâlniri cu prietenii" },
];

const FEATURES = [
  {
    icon: Repeat2,
    title: "Activități recurente",
    description:
      "Definești activitatea o singură dată — balet miercuri la 17:00 — și apare automat în calendar în fiecare săptămână.",
    accent: "bg-[#f6dcc0] text-[#8a4b2d]",
  },
  {
    icon: Users,
    title: "Vizibil pentru amândoi",
    description:
      "Ambii părinți văd toate activitățile copilului, indiferent cine le-a adăugat. Niciuna nu mai este uitată sau ignorată.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
  {
    icon: Bell,
    title: "Notificări pentru activități",
    description:
      "Reminder înainte de activitate — părintele care are copilul este atenționat la timp.",
    accent: "bg-[#f6e7c7] text-[#7a5620]",
  },
  {
    icon: CalendarDays,
    title: "Vizibile în calendar",
    description:
      "Activitățile apar în calendarul comun, alături de programul zilnic al copilului.",
    accent: "bg-[#dde8f6] text-[#365d89]",
  },
  {
    icon: Star,
    title: "Istoricul activităților",
    description:
      "Poți vedea activitățile din trecut — ce a participat copilul, la ce ore și când.",
    accent: "bg-[#fde8d8] text-[#b85c3e]",
  },
  {
    icon: BookOpen,
    title: "Informații suplimentare",
    description:
      "Adaugă locație, contact profesor, echipament necesar sau alte detalii relevante pentru fiecare activitate.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
];

const FAQ_ITEMS = [
  {
    q: "Cum adaug activitățile recurente ale copilului?",
    a: "În HomeSplit poți adăuga o activitate recurentă specificând ziua, ora, frecvența și detalii suplimentare. Activitatea apare automat în calendar fără să o reintroduci de fiecare dată.",
  },
  {
    q: "Ce se întâmplă dacă activitatea copilului se schimbă sau se anulează?",
    a: "Poți modifica sau anula orice activitate. Celălalt părinte este notificat automat despre schimbare.",
  },
  {
    q: "Pot adăuga mai multe activități pentru același copil?",
    a: "Da, fără limită. Poți adăuga câte activități are copilul — fiecare cu orarul și detaliile proprii.",
  },
  {
    q: "Ambii părinți pot adăuga activități?",
    a: "Da. Oricare dintre părinți poate adăuga activități, iar celălalt le vede imediat în calendarul comun.",
  },
];

export default function ActivitatiCopilPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteUrl}/activitati-copil`,
    name: "Activitățile copilului organizate simplu",
    description:
      "Organizează activitățile recurente ale copilului în calendar comun pentru ambii părinți.",
    url: `${siteUrl}/activitati-copil`,
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
        items={[{ label: "Activitățile copilului", href: "/activitati-copil" }]}
      />

      <SeoHero
        eyebrow="Activități recurente"
        h1="Activitățile copilului"
        h1Accent="organizate mai simplu"
        subtitle="Balet, înot, meditații, afterschool — toate activitățile recurente ale copilului pot fi organizate simplu și vizibil pentru ambii părinți."
        ctaLabel="Adaugă activitățile acum"
        trustPills={[
          "Activități recurente",
          "Ambii părinți văd",
          "Notificări la timp",
          "Fără activități uitate",
        ]}
      />

      {/* Lista de activități */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="landing-display text-4xl leading-tight text-stone-900 sm:text-5xl">
              Toate activitățile, un singur loc
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-stone-600">
              Indiferent de tipul activității, o poți organiza și urmări în
              HomeSplit.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {ACTIVITATI_LIST.map((act) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.label}
                  className="flex flex-col items-center rounded-[1.6rem] border border-[#ead9c8] bg-white/88 p-5 text-center shadow-[0_10px_24px_rgba(28,25,23,0.04)]"
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f6dcc0] text-[#8a4b2d]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-stone-800">{act.label}</p>
                  <p className="mt-1 text-xs leading-5 text-stone-500">
                    {act.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <SeoFeatureGrid
        eyebrow="Cum funcționează"
        heading="Activitățile nu se mai uită"
        subheading="Când activitățile recurente sunt în calendar, ambii părinți știu ce urmează — fără să se bazeze pe memorie sau mesaje."
        features={FEATURES}
        columns={3}
      />

      {/* Problemă → Soluție */}
      <section className="bg-[#f2ebe2] py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <span className="inline-flex rounded-full bg-[#fde8d8] px-3 py-1 text-xs font-semibold text-[#b85c3e]">
                Înainte de HomeSplit
              </span>
              <div className="mt-5 space-y-3">
                {[
                  '„Ai dus-o la balet astăzi?"',
                  '„Credeam că tu o duci la înot."',
                  '„Nu știam că are meditații miercuri."',
                  '„Am uitat de afterschool."',
                ].map((q) => (
                  <p
                    key={q}
                    className="rounded-[1.2rem] bg-white/88 px-4 py-3 text-sm font-semibold text-stone-700 shadow-[0_6px_16px_rgba(28,25,23,0.04)]"
                  >
                    {q}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <span className="inline-flex rounded-full bg-[#d9eee8] px-3 py-1 text-xs font-semibold text-[#1f5a4e]">
                Cu HomeSplit
              </span>
              <div className="mt-5 space-y-3">
                {[
                  "Balet miercuri 17:00 — vizibil în calendar.",
                  "Înot vineri — amândoi vedeți și știți.",
                  "Meditații luni — adăugate de mama, vizibile la tata.",
                  "Afterschool zilnic — marcat automat, fără să uiți.",
                ].map((q) => (
                  <p
                    key={q}
                    className="rounded-[1.2rem] bg-[#d9eee8]/60 px-4 py-3 text-sm font-semibold text-[#1f3a36] shadow-[0_6px_16px_rgba(28,25,23,0.04)]"
                  >
                    ✓ {q}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SeoFaqAccordion
        items={FAQ_ITEMS}
        pageUrl="/activitati-copil"
        heading="Întrebări despre activitățile copilului"
      />

      <SeoInternalLinks
        heading="Vezi și"
        links={[
          { href: "/calendar-copil", label: "Calendar copil", description: "Calendar comun pentru ambii părinți." },
          { href: "/program-copil", label: "Program copil", description: "Programul complet al copilului." },
          { href: "/vacante-si-program", label: "Vacanțe și program", description: "Coordonarea vacanțelor." },
          { href: "/zile-blocate", label: "Zile indisponibile", description: "Marchează perioadele indisponibile." },
          { href: "/co-parenting", label: "Despre co-parenting", description: "Ghid complet co-parenting." },
          { href: "/aplicatie-co-parenting", label: "Aplicație co-parenting", description: "Tot ce include HomeSplit." },
        ]}
      />

      <SeoBlogLinks categorySlug="activitati-si-conectare" categoryLabel="activități &amp; conectare" />
      <SeoCTA heading="Organizează activitățile copilului acum" />
    </SeoPageShell>
  );
}
