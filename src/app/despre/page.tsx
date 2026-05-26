import type { Metadata } from "next";
import { Heart, Shield, Star, Users } from "lucide-react";
import { SeoPageShell } from "@/components/seo/SeoPageShell";
import { SeoBreadcrumb } from "@/components/seo/SeoBreadcrumb";
import { SeoCTA } from "@/components/seo/SeoCTA";
import { SeoInternalLinks } from "@/components/seo/SeoInternalLinks";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Despre HomeSplit — platformă de co-parenting pentru familii moderne",
  description:
    "HomeSplit a fost creat pentru părinți separați care vor o organizare mai simplă și mai liniștită. Descoperă valorile, misiunea și echipa din spatele platformei.",
  alternates: { canonical: `${siteUrl}/despre` },
  openGraph: {
    title: "Despre HomeSplit",
    description:
      "Povestea și valorile platformei de co-parenting HomeSplit.",
    url: `${siteUrl}/despre`,
    type: "website",
  },
};

const VALORI = [
  {
    icon: Heart,
    title: "Copil first",
    description:
      "Fiecare decizie de produs pornește de la o întrebare simplă: cum ajută asta copilul? Nu părinții, nu platforma — copilul.",
    accent: "bg-[#fde8d8] text-[#b85c3e]",
  },
  {
    icon: Shield,
    title: "Claritate, nu conflict",
    description:
      "HomeSplit nu alimentează conflictele. Oferă claritate și structură pentru a reduce tensiunile logistice, nu pentru a le amplifica.",
    accent: "bg-[#d9eee8] text-[#1f5a4e]",
  },
  {
    icon: Star,
    title: "Simplitate reală",
    description:
      "Un produs simplu pe care celălalt părinte îl va folosi — chiar dacă nu este fan al tehnologiei. Simplitatea nu este opțională.",
    accent: "bg-[#f6e7c7] text-[#7a5620]",
  },
  {
    icon: Users,
    title: "Empatie și maturitate",
    description:
      "Știm că situațiile de separare sunt complexe emoțional. HomeSplit nu judecă, nu dramatizează — ajută, punct.",
    accent: "bg-[#dde8f6] text-[#365d89]",
  },
];

export default function DesprePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${siteUrl}/despre`,
    name: "Despre HomeSplit",
    description:
      "HomeSplit este o platformă de co-parenting creată pentru părinți separați din România.",
    url: `${siteUrl}/despre`,
    inLanguage: "ro-RO",
    about: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "HomeSplit",
      url: siteUrl,
      foundingDate: "2024",
      areaServed: [
        { "@type": "AdministrativeArea", name: "Romania" },
        { "@type": "AdministrativeArea", name: "Bucuresti" },
      ],
      description:
        "HomeSplit este o platformă modernă pentru co-parenting și organizare familială, creată pentru părinți separați din România.",
    },
  };

  return (
    <SeoPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SeoBreadcrumb
        items={[{ label: "Despre HomeSplit", href: "/despre" }]}
      />

      {/* Hero */}
      <section className="pb-16 pt-10 sm:pb-20 sm:pt-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <span className="inline-flex rounded-full border border-[#ead9c8] bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Despre noi
            </span>
            <h1 className="landing-display mt-5 text-4xl leading-tight text-stone-900 sm:text-5xl lg:text-6xl">
              Construim organizarea{" "}
              <span className="text-[#b85c3e]">care lipsea</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-stone-600">
              HomeSplit a pornit de la o problemă reală: părinții separați nu
              aveau un loc centralizat pentru organizarea vieții copilului.
              Am construit soluția.
            </p>
          </div>
        </div>
      </section>

      {/* Povestea */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-[2rem] border border-[#ead9c8] bg-white/80 p-8 sm:p-12">
            <h2 className="landing-display text-3xl leading-tight text-stone-900 sm:text-4xl">
              De ce HomeSplit?
            </h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-stone-600">
              <p>
                Co-parentingul este o realitate pentru milioane de familii din
                România. Dar instrumentele disponibile — grupuri de WhatsApp,
                calendare Google nesincronizate, note pe telefon — nu au fost
                create pentru această situație specifică.
              </p>
              <p>
                Rezultatul? Activități uitate, schimbări de program de ultim
                moment, vacanțe negociate cu tensiune, documente căutate prin
                galeria foto. Stres pentru părinți și, inevitabil, o parte din
                acest stres ajunge și la copil.
              </p>
              <p>
                HomeSplit centralizează tot ce ține de copil: calendar, program,
                activități, vacanțe, zile blocate și documente. Un singur loc,
                accesibil ambilor părinți, cu o singură actualizare vizibilă
                pentru toți.
              </p>
              <p>
                <strong className="text-stone-800">
                  Co-parentingul este suficient de complicat. Organizarea lui nu
                  trebuie să fie.
                </strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valori */}
      <section className="bg-[#f2ebe2] py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="landing-display text-4xl leading-tight text-stone-900 sm:text-5xl">
              Valorile noastre
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {VALORI.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="rounded-[1.8rem] border border-[#ead9c8] bg-white/88 p-6 shadow-[0_16px_36px_rgba(28,25,23,0.05)]"
                >
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${v.accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-stone-900">
                    {v.title}
                  </h3>
                  <p className="text-sm leading-7 text-stone-600">
                    {v.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ce nu este HomeSplit */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="landing-display mb-8 text-3xl leading-tight text-stone-900 sm:text-4xl">
            Ce nu este HomeSplit
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                nu: "Nu este o aplicație de mesagerie",
                da: "Este un instrument de organizare logistică",
              },
              {
                nu: "Nu oferă consultanță juridică",
                da: "Ajută la organizarea practică, nu la aspectele legale",
              },
              {
                nu: "Nu este un instrument de conflict",
                da: "Este gândit pentru claritate și reducerea tensiunilor",
              },
              {
                nu: "Nu urmărește relația dintre părinți",
                da: "Focusul este pe copil și pe nevoile lui",
              },
            ].map((item) => (
              <div
                key={item.nu}
                className="rounded-[1.6rem] border border-[#ead9c8] bg-white/88 p-5"
              >
                <p className="text-sm text-stone-400 line-through">
                  {item.nu}
                </p>
                <p className="mt-2 font-semibold text-[#1f5a4e]">
                  ✓ {item.da}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platformă */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-[2rem] bg-[#f6f0e8] p-8 sm:p-12">
            <h2 className="landing-display text-2xl leading-tight text-stone-900 sm:text-3xl">
              HomeSplit în cifre
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {[
                { val: "România", desc: "Piața principală de lansare" },
                { val: "Web app", desc: "Funcționează din orice browser, fără instalare" },
                { val: "2 părinți", desc: "Un abonament acoperă ambii părinți" },
              ].map((item) => (
                <div key={item.val} className="text-center">
                  <p className="landing-display text-3xl text-[#b85c3e]">
                    {item.val}
                  </p>
                  <p className="mt-2 text-sm text-stone-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SeoInternalLinks
        heading="Explorează HomeSplit"
        links={[
          { href: "/co-parenting", label: "Co-parenting", description: "Ghid complet despre co-parenting." },
          { href: "/aplicatie-co-parenting", label: "Aplicație co-parenting", description: "Tot ce include platforma." },
          { href: "/pentru-parinti-separati", label: "Pentru părinți separați", description: "Creat pentru situația voastră." },
          { href: "/faq", label: "Întrebări frecvente", description: "Răspunsuri complete." },
          { href: "/contact", label: "Contact", description: "Scrie-ne." },
          { href: "/blog", label: "Blog", description: "Articole despre co-parenting." },
        ]}
      />

      <SeoCTA
        heading="Construim împreună ceva mai bun"
        subheading="Încearcă HomeSplit gratuit și spune-ne ce îți lipsește."
      />
    </SeoPageShell>
  );
}
