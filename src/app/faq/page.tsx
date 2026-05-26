import type { Metadata } from "next";
import { SeoPageShell } from "@/components/seo/SeoPageShell";
import { SeoBreadcrumb } from "@/components/seo/SeoBreadcrumb";
import { SeoFaqAccordion } from "@/components/seo/SeoFaqAccordion";
import { SeoCTA } from "@/components/seo/SeoCTA";
import { SeoInternalLinks } from "@/components/seo/SeoInternalLinks";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Întrebări frecvente despre HomeSplit și co-parenting",
  description:
    "Răspunsuri la cele mai frecvente întrebări despre HomeSplit, organizarea co-parentingului și funcționalitățile platformei.",
  alternates: { canonical: `${siteUrl}/faq` },
  openGraph: {
    title: "Întrebări frecvente — HomeSplit",
    description:
      "Răspunsuri la cele mai frecvente întrebări despre HomeSplit și co-parenting.",
    url: `${siteUrl}/faq`,
    type: "website",
  },
};

const FAQ_GENERAL = [
  {
    q: "Ce este HomeSplit?",
    a: "HomeSplit este o aplicație de co-parenting și organizare familială pentru părinți separați sau divorțați. Oferă un calendar comun, organizarea activităților copilului, gestionarea vacanțelor, zile indisponibile, documente importante și notificări — totul într-un singur loc accesibil ambilor părinți.",
  },
  {
    q: "HomeSplit este o aplicație de mesagerie?",
    a: "Nu. HomeSplit este o platformă de organizare, nu de mesagerie. Focusul este pe calendar, program, activități și documente — nu pe comunicare generală între părinți.",
  },
  {
    q: "Este doar pentru părinți separați sau divorțați?",
    a: "HomeSplit este conceput în primul rând pentru co-parenting la două adrese. Oferă funcționalități specifice: calendar comun, handover, zile blocate și program partajat.",
  },
  {
    q: "Trebuie instalată din App Store sau Google Play?",
    a: "Nu. HomeSplit funcționează ca web app direct din browser. Poate fi salvată pe ecranul principal al telefonului (iOS sau Android) pentru acces rapid, ca o aplicație nativă.",
  },
  {
    q: "Este gratuit?",
    a: "HomeSplit oferă un plan Free și un trial Pro de 14 zile fără card. Planul Pro include funcționalități avansate: propuneri automate de program, activități recurente extinse, documente și alte funcții premium.",
  },
];

const FAQ_FUNCTIONALITATI = [
  {
    q: "Pot gestiona mai mulți copii?",
    a: "Da. Poți adăuga mai mulți copii în același cont și organiza programul fiecăruia separat.",
  },
  {
    q: "Pot adăuga activități recurente?",
    a: "Da. Poți defini activități recurente — balet, înot, meditații, afterschool — care apar automat în calendar săptămânal sau la intervalele definite de tine.",
  },
  {
    q: "Pot marca vacanțe și zile indisponibile?",
    a: "Da. Poți planifica vacanțele din timp și marca zilele când nu ești disponibil să preiei copilul. Celălalt părinte vede imediat.",
  },
  {
    q: "Ce documente pot stoca în HomeSplit?",
    a: "Poți adăuga informații despre documente de identitate (pașaport, carte de identitate), informații medicale (alergii, medicamente, medic de familie), informații școlare și orice alte notițe importante despre copil.",
  },
  {
    q: "Cum funcționează modificările de program?",
    a: "Orice modificare adusă de un părinte este vizibilă imediat celuilalt. Ambii părinți primesc notificare când programul se schimbă.",
  },
  {
    q: "Există propuneri automate de program?",
    a: "Da, în planul Pro. HomeSplit poate genera o propunere săptămânală de program bazată pe structura configurată — un punct de plecare pentru coordonare.",
  },
];

const FAQ_CONT = [
  {
    q: "Ce se întâmplă dacă nu plătesc după trial?",
    a: "Revii automat pe planul Free și îți păstrezi toate datele. Poți face upgrade oricând.",
  },
  {
    q: "Trebuie să avem amândoi cont?",
    a: "Da, ambii părinți trebuie să aibă cont pentru a folosi funcționalitățile de calendar comun și notificări. Unul dintre părinți creează contul familiei și îl invită pe celălalt.",
  },
  {
    q: "Datele copilului sunt în siguranță?",
    a: "Accesul la date este controlat — numai părinții autorizați ai acelei familii au acces. Informațiile sensibile sunt tratate cu prioritate de securitate.",
  },
  {
    q: "HomeSplit oferă consultanță juridică?",
    a: "Nu. HomeSplit este exclusiv o platformă de organizare practică. Nu oferă și nu înlocuiește consultanța juridică, psihologică sau de mediere familială.",
  },
  {
    q: "Pot exporta datele?",
    a: "Da. Poți exporta calendarul în format ICS pentru integrare cu alte aplicații. Exportul complet al datelor este disponibil din setările contului.",
  },
];

export default function FAQPage() {
  return (
    <SeoPageShell>
      <SeoBreadcrumb
        items={[{ label: "Întrebări frecvente", href: "/faq" }]}
      />

      {/* Hero simplu */}
      <section className="pb-12 pt-10 sm:pb-16 sm:pt-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <span className="inline-flex rounded-full border border-[#ead9c8] bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Suport
          </span>
          <h1 className="landing-display mt-5 text-4xl leading-tight text-stone-900 sm:text-5xl lg:text-6xl">
            Întrebări frecvente
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-stone-600">
            Răspunsuri la cele mai frecvente întrebări despre HomeSplit,
            funcționalitățile platformei și organizarea co-parentingului.
          </p>
        </div>
      </section>

      {/* General */}
      <SeoFaqAccordion
        eyebrow="General"
        heading="Despre HomeSplit"
        items={FAQ_GENERAL}
        pageUrl="/faq#general"
      />

      {/* Funcționalități */}
      <SeoFaqAccordion
        eyebrow="Funcționalități"
        heading="Funcționalitățile platformei"
        items={FAQ_FUNCTIONALITATI}
        pageUrl="/faq#functionalitati"
      />

      {/* Cont și securitate */}
      <SeoFaqAccordion
        eyebrow="Cont & securitate"
        heading="Cont și date"
        items={FAQ_CONT}
        pageUrl="/faq#cont"
      />

      <SeoInternalLinks
        heading="Resurse utile"
        links={[
          { href: "/co-parenting", label: "Ghid co-parenting", description: "Ce este co-parentingul și cum funcționează." },
          { href: "/aplicatie-co-parenting", label: "Aplicație co-parenting", description: "Tot ce include HomeSplit." },
          { href: "/calendar-copil", label: "Calendar copil", description: "Calendar comun pentru ambii părinți." },
          { href: "/pentru-parinti-separati", label: "Pentru părinți separați", description: "De ce am creat HomeSplit." },
          { href: "/despre", label: "Despre HomeSplit", description: "Povestea și valorile platformei." },
          { href: "/contact", label: "Contact", description: "Ai o întrebare? Scrie-ne." },
        ]}
      />

      <SeoCTA
        heading="Nu ai găsit răspunsul?"
        subheading="Scrie-ne și răspundem în cel mai scurt timp."
        ctaLabel="Contactează-ne"
        ctaHref="/contact"
        note="Sau încearcă HomeSplit gratuit — 14 zile Pro, fără card."
      />
    </SeoPageShell>
  );
}
