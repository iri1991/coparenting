import type { Metadata } from "next";
import {
  Heart,
  CalendarDays,
  Shield,
  Smartphone,
  Users,
  CheckCircle,
  Clock,
  Star,
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
  title: "Aplicație pentru părinți separați — organizare co-parenting simplu",
  description:
    "HomeSplit a fost creat pentru părinți separați care vor să organizeze mai simplu programul copilului. Calendar comun, activități, vacanțe și documente — fără haos.",
  alternates: { canonical: `${siteUrl}/pentru-parinti-separati` },
  openGraph: {
    title: "Aplicație pentru părinți separați — HomeSplit",
    description:
      "HomeSplit ajută părinții separați să organizeze programul copilului simplu și predictibil.",
    url: `${siteUrl}/pentru-parinti-separati`,
    type: "website",
  },
};

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Calendar comun partajat",
    description:
      "Un singur calendar pentru amândoi. Programul copilului, activitățile și vacanțele — vizibile și actualizate în timp real.",
    accent: "bg-[#f6dcc0] text-[#8a4b2d]",
  },
  {
    icon: Clock,
    title: "Program predictibil",
    description:
      "Copilul știe mereu unde va fi și cu cine. Predictibilitatea reduce anxietatea și îi oferă stabilitate emoțională.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
  {
    icon: Heart,
    title: "Fără conflicte logistice",
    description:
      "Când informațiile sunt clare și accesibile ambilor, tensiunile legate de logistică dispar sau se reduc semnificativ.",
    accent: "bg-[#fde8d8] text-[#b85c3e]",
  },
  {
    icon: Shield,
    title: "Date în siguranță",
    description:
      "Informațiile copilului sunt accesibile numai părinților autorizați — nu terților, nu altor persoane.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
  {
    icon: Smartphone,
    title: "Pe telefon, instant",
    description:
      "HomeSplit funcționează ca web app pe orice telefon. Accesibil oricând, de oriunde, fără instalare.",
    accent: "bg-[#dde8f6] text-[#365d89]",
  },
  {
    icon: Users,
    title: "Un abonament pentru amândoi",
    description:
      "Un singur abonament acoperă ambii părinți. Nu e nevoie ca fiecare să plătească separat.",
    accent: "bg-[#f6e7c7] text-[#7a5620]",
  },
  {
    icon: CheckCircle,
    title: "Simplu de folosit",
    description:
      "Nu ai nevoie de cursuri sau tutoriale. HomeSplit este intuitiv și poți configura totul în câteva minute.",
    accent: "bg-[#f6dcc0] text-[#8a4b2d]",
  },
  {
    icon: Star,
    title: "Focusat pe copil",
    description:
      "HomeSplit nu este despre relația dintre părinți. Este despre bunăstarea copilului și organizarea vieții lui.",
    accent: "bg-[#fde8d8] text-[#b85c3e]",
  },
];

const FAQ_ITEMS = [
  {
    q: "De ce a fost creat HomeSplit pentru părinți separați?",
    a: "HomeSplit a pornit de la o nevoie reală: părinții separați nu au un loc centralizat pentru organizarea vieții copilului. WhatsApp-ul, calendarele separate și conversațiile fragmentate creează tensiuni care afectează atât părinții, cât și copilul.",
  },
  {
    q: "Trebuie să fim în relații bune cu celălalt părinte pentru a folosi HomeSplit?",
    a: "Nu neapărat. HomeSplit ajută chiar și în situații cu tensiuni — focusul este pe logistică, nu pe relația interpersonală. Informațiile sunt clare și documentate, reducând nevoia de negocieri verbale.",
  },
  {
    q: "Ce se întâmplă dacă celălalt părinte nu vrea să folosească HomeSplit?",
    a: "Poți folosi HomeSplit singur pentru propria organizare. Totuși, funcționalitățile de calendar comun și notificări funcționează cel mai bine când ambii părinți sunt activi pe platformă.",
  },
  {
    q: "Pot folosi HomeSplit dacă suntem în process de divorț?",
    a: "Da. HomeSplit poate fi folosit în orice etapă a separării — în timpul divorțului, după divorț sau în orice aranjament de co-parenting, formal sau informal.",
  },
  {
    q: "HomeSplit funcționează pentru familii reconstituite (cu parteneri noi)?",
    a: "HomeSplit este conceput pentru co-parenting între cei doi părinți ai copilului. Informațiile sunt partajate exclusiv între părinții autorizați.",
  },
];

export default function PentruParintiSeparatiPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteUrl}/pentru-parinti-separati`,
    name: "Aplicație pentru părinți separați — HomeSplit",
    description:
      "HomeSplit ajută părinții separați să organizeze programul copilului simplu și predictibil.",
    url: `${siteUrl}/pentru-parinti-separati`,
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
          {
            label: "Pentru părinți separați",
            href: "/pentru-parinti-separati",
          },
        ]}
      />

      <SeoHero
        eyebrow="Creat pentru părinți separați"
        h1="Organizare gândită"
        h1Accent="pentru voi"
        subtitle="Separarea schimbă organizarea familiei, dar nu schimbă nevoia copilului de stabilitate și predictibilitate. HomeSplit a fost creat exact pentru această situație."
        ctaLabel="Încearcă gratuit"
        secondaryLabel="Cum funcționează"
        trustPills={[
          "14 zile Pro gratuit",
          "Fără card",
          "Un abonament pentru amândoi",
          "Fără instalare",
        ]}
      />

      {/* Mesaj central */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-[2rem] bg-[linear-gradient(135deg,#2f4b46_0%,#1f3a36_100%)] p-10 text-center sm:p-16">
            <blockquote className="landing-display text-3xl leading-relaxed text-white sm:text-4xl">
              „Co-parentingul este suficient de complicat. Organizarea lui nu
              trebuie să fie."
            </blockquote>
            <p className="mt-5 text-base text-white/70">
              Principiul cu care am construit HomeSplit.
            </p>
          </div>
        </div>
      </section>

      {/* Ce înțelegem noi */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="landing-display mb-8 text-3xl leading-tight text-stone-900 sm:text-4xl">
            Ce înțelegem despre situația voastră
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                title: "Programul e în WhatsApp",
                text: "Conversații amestecate, poze de la calendar, mesaje pierdute — nu există un loc unic pentru programul copilului.",
              },
              {
                title: "Schimbările vin la ore imposibile",
                text: "Mesaje la 11 noaptea, solicitări de ultim moment — lipsa unui sistem clar generează tensiune constantă.",
              },
              {
                title: "Activitățile se uită",
                text: "Balet, meditații, doctor — fiecare activitate depinde de memoria unui singur om. Dacă uită, copilul suferă.",
              },
              {
                title: "Vacanțele devin negocieri",
                text: "Fiecare vacanță este o discuție care durează zile. Fără un sistem clar, ajungeți mereu în ultimul moment.",
              },
              {
                title: "Copilul simte tensiunea",
                text: "Chiar și când adulții încearcă să ascundă conflictele, copiii le simt. Predictibilitatea îi ajută să se simtă în siguranță.",
              },
              {
                title: "Nu vrei un sistem complicat",
                text: "Ai deja suficient pe cap. Vrei ceva simplu, care funcționează și pe care celălalt părinte îl va folosi.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[1.6rem] border border-[#ead9c8] bg-white/88 p-6 shadow-[0_12px_28px_rgba(28,25,23,0.05)]"
              >
                <p className="font-semibold text-stone-900">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-stone-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SeoFeatureGrid
        eyebrow="Ce oferă HomeSplit"
        heading="Tot ce ai nevoie"
        subheading="HomeSplit este simplu, focusat și gândit pentru situația reală a părinților separați — nu un tool generic de organizare."
        features={FEATURES}
        columns={3}
      />

      <SeoFaqAccordion
        items={FAQ_ITEMS}
        pageUrl="/pentru-parinti-separati"
        heading="Întrebări frecvente"
      />

      <SeoInternalLinks
        heading="Explorează HomeSplit"
        links={[
          { href: "/co-parenting", label: "Despre co-parenting", description: "Ghid complet pentru co-parenting." },
          { href: "/aplicatie-co-parenting", label: "Aplicație co-parenting", description: "Tot ce include HomeSplit." },
          { href: "/calendar-copil", label: "Calendar copil", description: "Calendar comun pentru ambii părinți." },
          { href: "/program-copil", label: "Program copil", description: "Programul copilului organizat." },
          { href: "/faq", label: "Întrebări frecvente", description: "Răspunsuri complete." },
          { href: "/download", label: "Descarcă HomeSplit", description: "Cum instalezi pe telefon." },
        ]}
      />

      <SeoCTA />
    </SeoPageShell>
  );
}
