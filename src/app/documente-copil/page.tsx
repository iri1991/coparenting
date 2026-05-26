import type { Metadata } from "next";
import {
  FileText,
  Shield,
  Heart,
  AlertCircle,
  BookOpen,
  Smartphone,
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
  title: "Documentele copilului organizate simplu — HomeSplit",
  description:
    "Pașaport, certificat de naștere, alergii, documente medicale și informații importante ale copilului — accesibile rapid pentru ambii părinți cu HomeSplit.",
  alternates: { canonical: `${siteUrl}/documente-copil` },
  openGraph: {
    title: "Documentele copilului organizate simplu",
    description:
      "Documente importante ale copilului centralizate și accesibile rapid pentru ambii părinți.",
    url: `${siteUrl}/documente-copil`,
    type: "website",
  },
};

const FEATURES = [
  {
    icon: FileText,
    title: "Acces rapid",
    description:
      "Toate documentele sunt la un click distanță — nu mai cauți în galeria foto sau prin conversații vechi.",
    accent: "bg-[#f6dcc0] text-[#8a4b2d]",
  },
  {
    icon: Shield,
    title: "Acces controlat",
    description:
      "Documentele sunt vizibile doar părinților autorizați — nu terților, nu altor utilizatori.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
  {
    icon: Heart,
    title: "Informații medicale",
    description:
      "Alergii, medicamente, grupe sanguine, condiții speciale — informații critice accesibile rapid în orice situație.",
    accent: "bg-[#fde8d8] text-[#b85c3e]",
  },
  {
    icon: AlertCircle,
    title: "Informații de urgență",
    description:
      "Date de contact în caz de urgență, medic de familie, spital preferat — totul disponibil imediat.",
    accent: "bg-[#f6e7c7] text-[#7a5620]",
  },
  {
    icon: BookOpen,
    title: "Informații școlare",
    description:
      "Date despre școală, prof de clasă, program orar, activități extrașcolare — centralizate și actualizate.",
    accent: "bg-[#dde8f6] text-[#365d89]",
  },
  {
    icon: Smartphone,
    title: "Disponibil pe mobil",
    description:
      "Când ai nevoie de pașaportul copilului la frontieră sau de informații medicale la urgențe — le găsești instant.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
];

const DOCUMENT_TYPES = [
  { label: "Pașaport", cat: "identitate" },
  { label: "Carte de identitate", cat: "identitate" },
  { label: "Certificat de naștere", cat: "identitate" },
  { label: "Card sănătate", cat: "medical" },
  { label: "Alergii și intoleranțe", cat: "medical" },
  { label: "Grup sanguin", cat: "medical" },
  { label: "Medicamente curente", cat: "medical" },
  { label: "Medic de familie", cat: "medical" },
  { label: "Asigurare medicală", cat: "medical" },
  { label: "Program școală", cat: "școlar" },
  { label: "Contact diriginte/profesor", cat: "școlar" },
  { label: "Activități extrașcolare", cat: "școlar" },
  { label: "Note importante", cat: "altele" },
  { label: "Informații de urgență", cat: "altele" },
];

const FAQ_ITEMS = [
  {
    q: "Ce tipuri de documente pot stoca în HomeSplit?",
    a: "Poți stoca informații despre documente de identitate (pașaport, carte de identitate, certificat naștere), informații medicale (alergii, medicamente, medic de familie), informații școlare și orice alte informații importante despre copil.",
  },
  {
    q: "Cine are acces la documentele copilului?",
    a: "Numai părinții autorizați din aceeași familie au acces. Documentele nu sunt vizibile terților.",
  },
  {
    q: "Pot adăuga notițe sau informații suplimentare?",
    a: "Da. Pe lângă documente, poți adăuga informații text importante — alergii, instrucțiuni medicale, contacte de urgență sau orice altă informație relevantă.",
  },
  {
    q: "Documentele sunt actualizate când unul dintre părinți le modifică?",
    a: "Da. Orice modificare adusă de un părinte este vizibilă imediat celuilalt.",
  },
];

export default function DocumenteCopilPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteUrl}/documente-copil`,
    name: "Documentele copilului organizate simplu — HomeSplit",
    description:
      "Documente importante ale copilului centralizate și accesibile rapid.",
    url: `${siteUrl}/documente-copil`,
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
        items={[{ label: "Documente copil", href: "/documente-copil" }]}
      />

      <SeoHero
        eyebrow="Documente importante"
        h1="Documentele copilului"
        h1Accent="într-un singur loc"
        subtitle="Pașaport, alergii, informații medicale și documente importante — accesibile rapid pentru ambii părinți, oricând ai nevoie."
        ctaLabel="Organizează documentele acum"
        trustPills={[
          "Pașaport",
          "Alergii",
          "Documente medicale",
          "Informații școlare",
          "Acces controlat",
        ]}
      />

      {/* Lista de documente */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="landing-display text-4xl leading-tight text-stone-900 sm:text-5xl">
              Ce informații poți organiza?
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DOCUMENT_TYPES.map((doc) => (
              <div
                key={doc.label}
                className="flex items-center gap-3 rounded-[1.2rem] border border-[#ead9c8] bg-white/88 px-4 py-3.5"
              >
                <FileText className="h-4 w-4 shrink-0 text-[#b85c3e]" />
                <div>
                  <span className="text-sm font-semibold text-stone-800">
                    {doc.label}
                  </span>
                  <span className="ml-2 text-xs text-stone-400 capitalize">
                    {doc.cat}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SeoFeatureGrid
        eyebrow="De ce contează"
        heading="Documente disponibile când ai nevoie"
        subheading="Nu mai cauți în galerie, nu mai trimiți poze prin WhatsApp. Informațiile importante sunt la un click distanță, oricând."
        features={FEATURES}
        columns={3}
      />

      {/* Scenariu practic */}
      <section className="bg-[#f2ebe2] py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="landing-display text-3xl leading-tight text-stone-900 sm:text-4xl">
            Scenariu real
          </h2>
          <p className="mt-5 text-base leading-8 text-stone-600">
            Copilul este la tata la weekend. El alergează la terenul de joacă și
            se lovește. Medicul de urgență întreabă despre alergii la medicamente.
          </p>
          <p className="mt-4 text-base leading-8 text-stone-600">
            Cu HomeSplit, tata deschide aplicația de pe telefon și vede imediat:
            alergii cunoscute, grup sanguin, medicul de familie. Nu mai sună mama
            în panică la 11 noaptea.
          </p>
          <div className="mt-8 rounded-[1.8rem] border border-[#ead9c8] bg-white/88 px-6 py-6 text-left shadow-[0_12px_28px_rgba(28,25,23,0.05)]">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-stone-500">
              Informații disponibile instant
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Alergii la medicamente", val: "Niciuna" },
                { label: "Grup sanguin", val: "A+" },
                { label: "Medic de familie", val: "Dr. Ionescu, 0722..." },
              ].map((item) => (
                <div key={item.label} className="rounded-[1rem] bg-[#f6f0e8] px-4 py-3">
                  <p className="text-xs text-stone-500">{item.label}</p>
                  <p className="mt-1 font-semibold text-stone-800">{item.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SeoFaqAccordion
        items={FAQ_ITEMS}
        pageUrl="/documente-copil"
        heading="Întrebări despre documente"
      />

      <SeoInternalLinks
        heading="Vezi și"
        links={[
          { href: "/co-parenting", label: "Despre co-parenting", description: "Ghid complet co-parenting." },
          { href: "/aplicatie-co-parenting", label: "Aplicație co-parenting", description: "Tot ce include HomeSplit." },
          { href: "/calendar-copil", label: "Calendar copil", description: "Calendar comun pentru ambii părinți." },
          { href: "/pentru-parinti-separati", label: "Pentru părinți separați", description: "De ce HomeSplit a fost creat." },
          { href: "/faq", label: "Întrebări frecvente", description: "Răspunsuri complete." },
          { href: "/download", label: "Descarcă HomeSplit", description: "Cum instalezi HomeSplit pe telefon." },
        ]}
      />

      <SeoCTA heading="Organizează documentele copilului" />
    </SeoPageShell>
  );
}
