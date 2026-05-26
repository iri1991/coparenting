import type { Metadata } from "next";
import { Clock, Bell, CalendarDays, CheckCircle, Users, RefreshCw } from "lucide-react";
import { SeoPageShell } from "@/components/seo/SeoPageShell";
import { SeoBreadcrumb } from "@/components/seo/SeoBreadcrumb";
import { SeoHero } from "@/components/seo/SeoHero";
import { SeoFeatureGrid } from "@/components/seo/SeoFeatureGrid";
import { SeoCTA } from "@/components/seo/SeoCTA";
import { SeoInternalLinks } from "@/components/seo/SeoInternalLinks";
import { SeoFaqAccordion } from "@/components/seo/SeoFaqAccordion";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Zile indisponibile — planificare fără surprize în co-parenting",
  description:
    "Marchează zilele când nu ești disponibil și coordonează mai simplu programul copilului. Evită schimbările de ultim moment cu HomeSplit.",
  alternates: { canonical: `${siteUrl}/zile-blocate` },
  openGraph: {
    title: "Zile indisponibile în co-parenting — planificare fără surprize",
    description:
      "Marchează zilele indisponibile și coordonează programul copilului fără surprize.",
    url: `${siteUrl}/zile-blocate`,
    type: "website",
  },
};

const FEATURES = [
  {
    icon: Clock,
    title: "Marchează perioadele tale",
    description:
      "Conferințe, delegații, intervenții medicale sau orice altă perioadă când nu ești disponibil — marcate în avans.",
    accent: "bg-[#f6dcc0] text-[#8a4b2d]",
  },
  {
    icon: Users,
    title: "Vizibil pentru celălalt părinte",
    description:
      "Când marchezi o perioadă indisponibilă, celălalt părinte vede imediat și poate planifica în consecință.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
  {
    icon: Bell,
    title: "Notificări în avans",
    description:
      "Ambii părinți primesc notificare cu suficient timp înainte pentru a organiza alternativa.",
    accent: "bg-[#f6e7c7] text-[#7a5620]",
  },
  {
    icon: CalendarDays,
    title: "Vizibil în calendar",
    description:
      "Zilele indisponibile apar marcate în calendarul comun — fără confuzii, fără presupuneri.",
    accent: "bg-[#dde8f6] text-[#365d89]",
  },
  {
    icon: CheckCircle,
    title: "Planificare predictibilă",
    description:
      "Când ambii părinți marchează perioadele indisponibile, programul copilului devine mai stabil și mai ușor de gestionat.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
  {
    icon: RefreshCw,
    title: "Modificări gestionate",
    description:
      "Când apare o schimbare neașteptată, poți actualiza rapid și celălalt părinte este notificat imediat.",
    accent: "bg-[#fde8d8] text-[#b85c3e]",
  },
];

const EXEMPLE_ZILE_BLOCATE = [
  { tip: "Delegație de lucru", desc: "3–5 zile, perioadă marcată din timp", culoare: "bg-[#dde8f6] text-[#365d89]" },
  { tip: "Intervenție medicală", desc: "Recuperare, nu pot prelua copilul", culoare: "bg-[#fde8d8] text-[#b85c3e]" },
  { tip: "Concediu personal", desc: "Perioadă liberă la mare sau munte", culoare: "bg-[#d9eee8] text-[#1f5a4e]" },
  { tip: "Eveniment de familie", desc: "Nuntă sau eveniment important", culoare: "bg-[#f6e7c7] text-[#7a5620]" },
  { tip: "Terminare program târziu", desc: "O zi cu ore suplimentare la muncă", culoare: "bg-[#f6dcc0] text-[#8a4b2d]" },
  { tip: "Deplasare în altă localitate", desc: "Nu sunt în oraș, nu pot prelua", culoare: "bg-[#dde8f6] text-[#365d89]" },
];

const FAQ_ITEMS = [
  {
    q: "Ce sunt zilele indisponibile (blocate) în HomeSplit?",
    a: "Zilele indisponibile sunt perioadele marcate de un părinte când nu este disponibil să preia copilul. Aceste perioade sunt vizibile pentru celălalt părinte în calendarul comun, permițând o planificare mai bună.",
  },
  {
    q: "Celălalt părinte este notificat când marchez o zi blocată?",
    a: "Da. Celălalt părinte primește o notificare când marcezi o perioadă indisponibilă, cu suficient timp pentru a-și reorganiza programul.",
  },
  {
    q: "Pot marca o singură zi sau doar perioade lungi?",
    a: "Poți marca orice interval — o singură zi, câteva zile sau perioade lungi. HomeSplit se adaptează la orice situație.",
  },
  {
    q: "Ce se întâmplă dacă ambii părinți marchează aceeași perioadă ca indisponibilă?",
    a: "HomeSplit evidențiază suprapunerile și permite discutarea soluțiilor. Scopul este să previi situațiile de urgență prin comunicare timpurie.",
  },
];

export default function ZileBlockatePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteUrl}/zile-blocate`,
    name: "Zile indisponibile — planificare fără surprize",
    description:
      "Marchează zilele indisponibile și coordonează programul copilului fără surprize în co-parenting.",
    url: `${siteUrl}/zile-blocate`,
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
        items={[{ label: "Zile indisponibile", href: "/zile-blocate" }]}
      />

      <SeoHero
        eyebrow="Planificare simplă"
        h1="Planificare fără"
        h1Accent="surprize"
        subtitle="Fiecare părinte poate marca perioadele când nu este disponibil. Celălalt înțelege din timp și poate planifica — fără tensiuni de ultim moment."
        ctaLabel="Încearcă HomeSplit gratuit"
        trustPills={[
          "Marchează din timp",
          "Celălalt vede instant",
          "Notificări automate",
          "Fără surprize",
        ]}
      />

      {/* Exemple */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="landing-display text-4xl leading-tight text-stone-900 sm:text-5xl">
              Când folosești zilele blocate?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-stone-600">
              Orice perioadă în care nu ești disponibil poate fi marcată.
              Exemple frecvente:
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXEMPLE_ZILE_BLOCATE.map((item) => (
              <div
                key={item.tip}
                className="rounded-[1.6rem] border border-[#ead9c8] bg-white/88 p-5 shadow-[0_10px_24px_rgba(28,25,23,0.04)]"
              >
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${item.culoare} mb-3`}
                >
                  Blocat
                </span>
                <p className="font-semibold text-stone-800">{item.tip}</p>
                <p className="mt-1.5 text-sm leading-6 text-stone-600">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SeoFeatureGrid
        eyebrow="Cum funcționează"
        heading="Predictibilitate pentru toată lumea"
        subheading="Când ambii părinți marchează din timp perioadele indisponibile, programul copilului devine stabil și tensiunile de ultim moment dispar."
        features={FEATURES}
        columns={3}
      />

      {/* Beneficiu cheie */}
      <section className="bg-[#f2ebe2] py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="landing-display text-3xl leading-tight text-stone-900 sm:text-4xl">
            Copilul simte stabilitatea
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-stone-600">
            Când schimbările de program sunt planificate din timp și comunicate
            clar, copilul nu simte anxietatea incertitudinii. Știe ce urmează,
            indiferent de situație.
          </p>
        </div>
      </section>

      <SeoFaqAccordion
        items={FAQ_ITEMS}
        pageUrl="/zile-blocate"
        heading="Întrebări despre zilele indisponibile"
      />

      <SeoInternalLinks
        heading="Vezi și"
        links={[
          { href: "/calendar-copil", label: "Calendar copil", description: "Calendar comun actualizat în timp real." },
          { href: "/program-copil", label: "Program copil", description: "Organizarea zilnică și săptămânală." },
          { href: "/vacante-si-program", label: "Vacanțe și program", description: "Coordonarea vacanțelor." },
          { href: "/activitati-copil", label: "Activitățile copilului", description: "Activitățile recurente." },
          { href: "/co-parenting", label: "Despre co-parenting", description: "Ghid complet co-parenting." },
          { href: "/aplicatie-co-parenting", label: "Aplicație co-parenting", description: "Tot ce include HomeSplit." },
        ]}
      />

      <SeoCTA heading="Organizează programul fără surprize" />
    </SeoPageShell>
  );
}
