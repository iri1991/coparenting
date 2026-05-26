import type { Metadata } from "next";
import {
  CalendarDays,
  Repeat2,
  FileText,
  Bell,
  Smartphone,
  Users,
  Clock,
  Palmtree,
  MessageSquare,
  Shield,
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
  title: "Aplicație co-parenting pentru părinți separați — HomeSplit",
  description:
    "HomeSplit este aplicația de co-parenting pentru părinți separați: calendar comun, program copil, activități recurente, vacanțe, zile blocate și documente importante.",
  alternates: { canonical: `${siteUrl}/aplicatie-co-parenting` },
  openGraph: {
    title: "Aplicație co-parenting — HomeSplit",
    description:
      "Calendar comun, program copil, activități, vacanțe și documente — totul într-o singură aplicație de co-parenting.",
    url: `${siteUrl}/aplicatie-co-parenting`,
    type: "website",
  },
};

const ALL_FEATURES = [
  {
    icon: CalendarDays,
    title: "Calendar comun",
    description:
      "Calendar partajat în timp real pentru ambii părinți. Programul copilului este vizibil și actualizat instant.",
    accent: "bg-[#f6dcc0] text-[#8a4b2d]",
  },
  {
    icon: Repeat2,
    title: "Activități recurente",
    description:
      "Balet, înot, meditații, afterschool — activitățile care se repetă sunt organizate și vizibile automat.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
  {
    icon: Palmtree,
    title: "Vacanțe și concedii",
    description:
      "Planificarea vacanțelor, a concediilor și a perioadelor speciale fără suprapuneri sau neînțelegeri.",
    accent: "bg-[#dde8f6] text-[#365d89]",
  },
  {
    icon: Clock,
    title: "Zile indisponibile",
    description:
      "Fiecare părinte poate marca perioadele când nu este disponibil, pentru o planificare mai bună.",
    accent: "bg-[#f6e7c7] text-[#7a5620]",
  },
  {
    icon: FileText,
    title: "Documente copil",
    description:
      "Pașaport, certificat naștere, alergii, documente medicale — accesibile rapid pentru ambii părinți.",
    accent: "bg-[#fde8d8] text-[#b85c3e]",
  },
  {
    icon: Bell,
    title: "Notificări",
    description:
      "Notificări când programul se modifică, când activitățile se apropie sau când există actualizări importante.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
  {
    icon: Users,
    title: "Propuneri de program",
    description:
      "HomeSplit poate genera propuneri automate de program săptămânal — un punct de plecare pentru coordonare.",
    accent: "bg-[#f6dcc0] text-[#8a4b2d]",
  },
  {
    icon: Smartphone,
    title: "Web app mobil",
    description:
      "Funcționează perfect din browser pe telefon. Poate fi salvată pe ecranul principal pentru acces rapid.",
    accent: "bg-[#dde8f6] text-[#365d89]",
  },
  {
    icon: Shield,
    title: "Date în siguranță",
    description:
      "Accesul este controlat — doar părinții autorizați văd datele copilului. Fără terți, fără expunere.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
  {
    icon: MessageSquare,
    title: "Comunicare logistică",
    description:
      "Un spațiu de comunicare pentru informații legate de copil — separat de mesajele personale.",
    accent: "bg-[#f6e7c7] text-[#7a5620]",
  },
];

const COMPARATIE = [
  {
    aspect: "Calendar comun",
    fara: "WhatsApp cu poze de la calendar",
    cu: "Calendar real, partajat, în timp real",
  },
  {
    aspect: "Activități recurente",
    fara: "Reținute mental sau pe hârtie",
    cu: "Vizibile automat în calendar",
  },
  {
    aspect: "Documente copil",
    fara: "Poze în galerie sau PDF-uri pierdute",
    cu: "Centralizate și accesibile instant",
  },
  {
    aspect: "Schimbări de program",
    fara: "Mesaje la ore imposibile",
    cu: "Notificări clare, cu context",
  },
  {
    aspect: "Vacanțe",
    fara: "Negocieri lungi, suprapuneri",
    cu: "Coordonate simplu, vizibil pentru amândoi",
  },
];

const FAQ_ITEMS = [
  {
    q: "Ce este HomeSplit și pentru cine este?",
    a: "HomeSplit este o aplicație de co-parenting pentru părinți separați sau divorțați care vor să organizeze mai simplu programul copilului, activitățile, vacanțele și documentele importante. Este potrivită pentru orice aranjament de co-parenting.",
  },
  {
    q: "HomeSplit este o aplicație de mesagerie?",
    a: "Nu. HomeSplit este o platformă de organizare, nu de mesagerie. Focusul este pe calendar, program, activități și documente — nu pe comunicare generală între părinți.",
  },
  {
    q: "Trebuie instalată din App Store sau Google Play?",
    a: "Nu este necesară instalarea. HomeSplit funcționează ca web app direct din browser și poate fi salvată pe ecranul principal al telefonului pentru acces rapid.",
  },
  {
    q: "Este gratuit?",
    a: "HomeSplit oferă un plan Free și un trial Pro de 14 zile fără card. Planul Pro include funcționalități avansate: propuneri automate de program, activități recurente extinse, documente și alte funcții premium.",
  },
  {
    q: "Pot gestiona mai mulți copii?",
    a: "Da. Poți adăuga mai mulți copii și organiza programul fiecăruia separat în același cont.",
  },
  {
    q: "Ce se întâmplă dacă celălalt părinte nu vrea să folosească HomeSplit?",
    a: "Poți folosi HomeSplit și singur pentru a organiza propriile zile cu copilul. Platforma este totuși mult mai utilă când ambii părinți o folosesc — funcționalitățile de calendar comun și notificări necesită ambii părinți activi.",
  },
];

export default function AplicatieCoParentingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteUrl}/aplicatie-co-parenting`,
    name: "Aplicație co-parenting pentru părinți separați — HomeSplit",
    description:
      "HomeSplit: calendar comun, program copil, activități, vacanțe și documente pentru co-parenting.",
    url: `${siteUrl}/aplicatie-co-parenting`,
    inLanguage: "ro-RO",
    isPartOf: { "@id": siteUrl },
    about: {
      "@type": "SoftwareApplication",
      name: "HomeSplit",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      url: siteUrl,
    },
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
            label: "Aplicație co-parenting",
            href: "/aplicatie-co-parenting",
          },
        ]}
      />

      <SeoHero
        eyebrow="Aplicație co-parenting"
        h1="Tot ce ai nevoie"
        h1Accent="pentru co-parenting"
        subtitle="HomeSplit reunește tot ce ține de copil într-un singur loc: calendar, program, activități, vacanțe, zile blocate și documente — accesibil ambilor părinți, oricând."
        ctaLabel="Încearcă gratuit 14 zile Pro"
        secondaryLabel="Vezi toate funcțiile"
        secondaryHref="#functionalitati"
        trustPills={[
          "Fără instalare",
          "14 zile Pro gratuit",
          "Fără card",
          "Un abonament pentru amândoi",
        ]}
      />

      {/* Comparație cu/fără */}
      <section className="py-14 sm:py-16" id="comparatie">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <span className="inline-flex rounded-full border border-[#ead9c8] bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Înainte și după
            </span>
            <h2 className="landing-display mt-5 text-4xl leading-tight text-stone-900 sm:text-5xl">
              Co-parenting cu și fără HomeSplit
            </h2>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-[#ead9c8] bg-white/88 shadow-[0_20px_60px_rgba(28,25,23,0.07)]">
            <div className="grid grid-cols-3 border-b border-[#f0e3d7] bg-[#faf3ec] px-6 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-stone-500">
              <span>Aspect</span>
              <span className="text-center text-[#b85c3e]">Fără HomeSplit</span>
              <span className="text-center text-[#1f5a4e]">Cu HomeSplit</span>
            </div>
            <div className="divide-y divide-[#f6ede4]">
              {COMPARATIE.map((row) => (
                <div
                  key={row.aspect}
                  className="grid grid-cols-3 gap-2 px-6 py-4"
                >
                  <span className="text-sm font-semibold text-stone-700">
                    {row.aspect}
                  </span>
                  <span className="text-center text-sm leading-6 text-stone-500">
                    {row.fara}
                  </span>
                  <span className="text-center text-sm font-semibold leading-6 text-[#1f5a4e]">
                    {row.cu}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="functionalitati">
        <SeoFeatureGrid
          eyebrow="Toate funcționalitățile"
          heading="Tot ce include HomeSplit"
          subheading="O singură aplicație pentru toate nevoile de organizare în co-parenting — de la calendar la documente."
          features={ALL_FEATURES}
          columns={3}
        />
      </section>

      {/* Cum funcționează */}
      <section className="bg-[#f2ebe2] py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <span className="inline-flex rounded-full border border-[#ead9c8] bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Pași simpli
            </span>
            <h2 className="landing-display mt-5 text-4xl leading-tight text-stone-900 sm:text-5xl">
              Cum funcționează?
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { nr: "01", title: "Creezi contul", text: "Înregistrare rapidă cu email. Fără card." },
              { nr: "02", title: "Adaugi copilul", text: "Setezi profilul copilului: nume, vârstă, informații utile." },
              { nr: "03", title: "Inviți partenerul", text: "Celălalt părinte primește invitație și se alătură familiei." },
              { nr: "04", title: "Configurezi programul", text: "Definești zilele cu fiecare părinte și structura de bază." },
              { nr: "05", title: "Adaugi activitățile", text: "Activitățile recurente, vacanțele și zilele blocate." },
              { nr: "06", title: "Gestionați împreună", text: "Ambii părinți văd și actualizează același calendar în timp real." },
            ].map((step) => (
              <div
                key={step.nr}
                className="rounded-[1.8rem] border border-[#ead9c8] bg-white/88 p-6 shadow-[0_12px_28px_rgba(28,25,23,0.05)]"
              >
                <span className="landing-display block text-4xl text-[#f0d8c4]">
                  {step.nr}
                </span>
                <h3 className="mt-2 font-semibold text-stone-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SeoFaqAccordion
        items={FAQ_ITEMS}
        pageUrl="/aplicatie-co-parenting"
        heading="Întrebări despre HomeSplit"
      />

      <SeoInternalLinks
        heading="Explorează funcționalitățile"
        links={[
          {
            href: "/calendar-copil",
            label: "Calendar copil",
            description: "Calendar comun pentru programul copilului.",
          },
          {
            href: "/activitati-copil",
            label: "Activitățile copilului",
            description: "Gestionarea activităților recurente.",
          },
          {
            href: "/vacante-si-program",
            label: "Vacanțe și program",
            description: "Coordonarea vacanțelor.",
          },
          {
            href: "/zile-blocate",
            label: "Zile indisponibile",
            description: "Marchează perioadele indisponibile.",
          },
          {
            href: "/documente-copil",
            label: "Documente copil",
            description: "Documente importante centralizate.",
          },
          {
            href: "/pentru-parinti-separati",
            label: "Pentru părinți separați",
            description: "De ce HomeSplit a fost creat pentru voi.",
          },
        ]}
      />

      <SeoCTA />
    </SeoPageShell>
  );
}
