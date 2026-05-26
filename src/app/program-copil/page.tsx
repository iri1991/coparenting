import type { Metadata } from "next";
import {
  CalendarDays,
  Clock,
  Repeat2,
  Users,
  Sun,
  GraduationCap,
  Palmtree,
  Star,
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
  title: "Program copil după divorț sau separare — organizare simplă",
  description:
    "Organizează programul copilului după divorț sau separare. Zilele cu fiecare părinte, weekenduri, vacanțe și activități — toate într-un singur loc cu HomeSplit.",
  alternates: { canonical: `${siteUrl}/program-copil` },
  openGraph: {
    title: "Program copil după divorț sau separare",
    description:
      "Organizează programul copilului simplu și predictibil cu HomeSplit.",
    url: `${siteUrl}/program-copil`,
    type: "website",
  },
};

const PROGRAM_TYPES = [
  {
    icon: CalendarDays,
    title: "Zile cu fiecare părinte",
    description:
      "Definește clar care sunt zilele la mama și zilele la tata. Programul de bază rămâne vizibil și consistent pentru toată lumea.",
    accent: "bg-[#f6dcc0] text-[#8a4b2d]",
  },
  {
    icon: Sun,
    title: "Weekenduri",
    description:
      "Weekendurile alternante sau alte aranjamente — sunt marcate clar în calendar astfel încât ambii părinți să știe ce urmează.",
    accent: "bg-[#f6e7c7] text-[#7a5620]",
  },
  {
    icon: Palmtree,
    title: "Vacanțe și concedii",
    description:
      "Vacanțele de vară, de iarnă, Crăciunul, Paștele — fiecare perioadă specială este planificată și coordonată în avans.",
    accent: "bg-[#dde8f6] text-[#365d89]",
  },
  {
    icon: GraduationCap,
    title: "Program școală și afterschool",
    description:
      "Activitățile de la școală, afterschool-ul și meditațiile sunt parte din programul general al copilului.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
  {
    icon: Repeat2,
    title: "Activități recurente",
    description:
      "Balet, înot, dans, sport — activitățile care se repetă săptămânal sunt vizibile constant în programul copilului.",
    accent: "bg-[#f6dcc0] text-[#8a4b2d]",
  },
  {
    icon: Star,
    title: "Perioade speciale",
    description:
      "Aniversări, zile de naștere, evenimente de familie — momentele importante sunt marcate clar în calendar.",
    accent: "bg-[#fde8d8] text-[#b85c3e]",
  },
  {
    icon: Users,
    title: "Custodie alternativă",
    description:
      "Modelul săptămână-la-săptămână, 2-2-3 sau orice alt aranjament poate fi configurat simplu.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
  {
    icon: Clock,
    title: "Program zilnic",
    description:
      "Orele de trezire, culcare, masă sau alte activități zilnice pot fi incluse pentru o predictibilitate și mai mare.",
    accent: "bg-[#f6e7c7] text-[#7a5620]",
  },
];

const FAQ_ITEMS = [
  {
    q: "Cum organizez programul copilului după divorț?",
    a: "Cel mai important este să existe un program clar, scris și accesibil ambilor părinți. HomeSplit oferă un calendar comun unde poți defini zilele cu fiecare părinte, activitățile și vacanțele — totul vizibil și actualizat în timp real.",
  },
  {
    q: "Ce model de program al copilului funcționează cel mai bine?",
    a: "Nu există un model universal. Cel mai bun program este cel care se potrivește nevoilor copilului și disponibilității ambilor părinți. Modelele comune includ: săptămână alternativă, 2-2-3, 3-4-4-3. Homesplit poate fi configurat pentru orice aranjament.",
  },
  {
    q: "Cum gestionez schimbările de program de ultim moment?",
    a: "În HomeSplit, orice modificare este vizibilă imediat pentru celălalt părinte. Poți adăuga note explicative la schimbări și ambii părinți primesc notificare când programul se modifică.",
  },
  {
    q: "Pot folosi HomeSplit și dacă avem un program fix, fără modificări frecvente?",
    a: "Da. HomeSplit este util indiferent de frecvența schimbărilor. Un program fix bine configurat oferă oricum predictibilitate și claritate — ambii părinți și copilul știu ce urmează fără să mai fie nevoie de confirmare.",
  },
];

export default function ProgramCopilPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteUrl}/program-copil`,
    name: "Program copil după divorț sau separare",
    description:
      "Organizează programul copilului după divorț sau separare cu HomeSplit.",
    url: `${siteUrl}/program-copil`,
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
        items={[{ label: "Program copil", href: "/program-copil" }]}
      />

      <SeoHero
        eyebrow="Program copil"
        h1="Programul copilului"
        h1Accent="într-un singur loc"
        subtitle="Programul copilului poate deveni greu de urmărit când este discutat în conversații separate sau modificat frecvent. HomeSplit oferă un loc central, clar și accesibil ambilor părinți."
        ctaLabel="Organizează programul acum"
        secondaryLabel="Cum funcționează"
        trustPills={[
          "Zile cu fiecare părinte",
          "Weekenduri",
          "Vacanțe",
          "Activități",
          "Program şcoală",
        ]}
      />

      {/* Ce poți organiza */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-[2rem] border border-[#ead9c8] bg-white/80 p-8 sm:p-12">
            <h2 className="landing-display text-3xl leading-tight text-stone-900 sm:text-4xl">
              Ce poți organiza cu HomeSplit?
            </h2>
            <p className="mt-4 text-base leading-8 text-stone-600">
              Indiferent de aranjamentul tău de co-parenting, HomeSplit se
              adaptează la situația ta. Poți configura orice tip de program:
              alternativ, fix sau personalizat.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Zile cu fiecare părinte",
                "Weekenduri alternante",
                "Vacanțe de vară și de iarnă",
                "Sărbători (Crăciun, Paște)",
                "Afterschool și activități",
                "Meditații și lecții",
                "Aniversări și zile speciale",
                "Concedii medicale",
                "Program școală",
                "Perioade excepționale",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-[1rem] bg-[#f6f0e8] px-4 py-3"
                >
                  <div className="h-2 w-2 shrink-0 rounded-full bg-[#b85c3e]" />
                  <span className="text-sm font-semibold text-stone-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SeoFeatureGrid
        eyebrow="Tipuri de program"
        heading="Toate tipurile de program, într-un calendar"
        subheading="De la programul săptămânal de bază până la vacanțe și activități recurente — HomeSplit organizează totul simplu și vizibil."
        features={PROGRAM_TYPES}
        columns={3}
      />

      {/* Principiul predictibilității */}
      <section className="bg-[#f2ebe2] py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="landing-display text-3xl leading-tight text-stone-900 sm:text-4xl">
                Predictibilitatea contează
              </h2>
              <p className="mt-5 text-base leading-8 text-stone-600">
                Cercetările în psihologia copilului arată că predictibilitatea
                este unul dintre factorii cheie pentru securitatea emoțională a
                copilului după separarea părinților.
              </p>
              <p className="mt-4 text-base leading-8 text-stone-600">
                Un copil care știe unde va fi, cu cine și ce urmează are mai
                puțin stres, se adaptează mai ușor și se simte în siguranță
                indiferent de casă.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  title: "Copilul știe ce urmează",
                  text: 'Nu mai întreabă anxios „cu cine stau săptămâna asta?" — programul este clar și stabil.',
                },
                {
                  title: "Părinții nu se mai contrazic",
                  text: "Ambii au acces la același program — nu există versiuni diferite sau neînțelegeri.",
                },
                {
                  title: "Schimbările sunt gestionate clar",
                  text: "Când apare o excepție, aceasta este documentată și vizibilă, nu ascunsă în mesaje.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.4rem] border border-[#ead9c8] bg-white/88 p-5"
                >
                  <p className="font-semibold text-stone-800">{item.title}</p>
                  <p className="mt-1.5 text-sm leading-6 text-stone-600">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SeoFaqAccordion
        items={FAQ_ITEMS}
        pageUrl="/program-copil"
        heading="Întrebări despre programul copilului"
      />

      <SeoInternalLinks
        heading="Subiecte legate de programul copilului"
        links={[
          {
            href: "/calendar-copil",
            label: "Calendar copil",
            description: "Calendar comun vizibil pentru ambii părinți.",
          },
          {
            href: "/custodie-comuna",
            label: "Custodie comună",
            description: "Organizarea programului în custodie comună.",
          },
          {
            href: "/vacante-si-program",
            label: "Vacanțe și program",
            description: "Cum coordonezi vacanțele în co-parenting.",
          },
          {
            href: "/activitati-copil",
            label: "Activitățile copilului",
            description: "Organizarea activităților recurente.",
          },
          {
            href: "/zile-blocate",
            label: "Zile indisponibile",
            description: "Marchează perioadele când nu ești disponibil.",
          },
          {
            href: "/co-parenting",
            label: "Despre co-parenting",
            description: "Ghid complet despre co-parenting.",
          },
        ]}
      />

      <SeoBlogLinks categorySlug="rutine-si-tranzitii" categoryLabel="rutine &amp; tranziții" />
      <SeoCTA heading="Organizează programul copilului acum" />
    </SeoPageShell>
  );
}
