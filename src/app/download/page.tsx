import type { Metadata } from "next";
import { Smartphone, MonitorSmartphone, Bell, Share2 } from "lucide-react";
import Link from "next/link";
import { SeoPageShell } from "@/components/seo/SeoPageShell";
import { SeoBreadcrumb } from "@/components/seo/SeoBreadcrumb";
import { SeoCTA } from "@/components/seo/SeoCTA";
import { SeoInternalLinks } from "@/components/seo/SeoInternalLinks";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Descarcă HomeSplit — instalare pe telefon sau acces din browser",
  description:
    "HomeSplit este o web app — nu necesită instalare din App Store sau Google Play. Funcționează din orice browser și poate fi salvată pe ecranul principal al telefonului.",
  alternates: { canonical: `${siteUrl}/download` },
  openGraph: {
    title: "Descarcă HomeSplit — web app pentru co-parenting",
    description:
      "Nu necesită instalare. Funcționează din browser pe iOS și Android.",
    url: `${siteUrl}/download`,
    type: "website",
  },
};

const STEPS_IOS = [
  { nr: "01", title: "Deschide Safari", text: "Accesează homesplit.ro din Safari pe iPhone sau iPad." },
  { nr: "02", title: "Apasă Share", text: "Apasă iconița de Share (pătratul cu săgeată în sus) din bara de jos." },
  { nr: "03", title: "Add to Home Screen", text: 'Selectează „Add to Home Screen" din meniu.' },
  { nr: "04", title: "Gata!", text: "HomeSplit apare pe ecranul tău ca o aplicație nativă." },
];

const STEPS_ANDROID = [
  { nr: "01", title: "Deschide Chrome", text: "Accesează homesplit.ro din Google Chrome." },
  { nr: "02", title: "Meniu (⋮)", text: "Apasă meniul din colțul din dreapta sus (trei puncte)." },
  { nr: "03", title: "Add to Home Screen", text: 'Selectează „Add to Home Screen" sau „Install App".' },
  { nr: "04", title: "Gata!", text: "HomeSplit apare pe ecranul tău cu iconița sa." },
];

export default function DownloadPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteUrl}/download`,
    name: "Descarcă HomeSplit",
    description:
      "Cum instalezi HomeSplit pe telefon — web app fără App Store sau Google Play.",
    url: `${siteUrl}/download`,
    inLanguage: "ro-RO",
    isPartOf: { "@id": siteUrl },
    about: {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#app`,
      name: "HomeSplit",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web, iOS, Android",
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
        items={[{ label: "Descarcă HomeSplit", href: "/download" }]}
      />

      {/* Hero */}
      <section className="pb-16 pt-10 sm:pb-20 sm:pt-14">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="inline-flex rounded-full border border-[#ead9c8] bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Accesibil de oriunde
          </span>
          <h1 className="landing-display mt-5 text-4xl leading-tight text-stone-900 sm:text-5xl lg:text-6xl">
            HomeSplit pe{" "}
            <span className="text-[#b85c3e]">orice dispozitiv</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-stone-600">
            Nu necesită instalare din App Store sau Google Play. HomeSplit
            funcționează direct din browser și poate fi salvată pe ecranul
            principal al telefonului.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] px-7 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_rgba(191,106,75,0.22)] transition hover:brightness-[1.02]"
            >
              <Smartphone className="h-4 w-4" />
              Deschide HomeSplit
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-stone-500">
            <span>✓ Fără instalare</span>
            <span>✓ iOS & Android</span>
            <span>✓ Desktop & laptop</span>
          </div>
        </div>
      </section>

      {/* Ce este o web app */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-[2rem] border border-[#ead9c8] bg-white/80 p-8 sm:p-12">
            <h2 className="landing-display text-3xl leading-tight text-stone-900 sm:text-4xl">
              Ce este o web app?
            </h2>
            <p className="mt-5 text-base leading-8 text-stone-600">
              O web app este o aplicație care rulează direct din browser — fără
              să fie nevoie să o descarci din App Store sau Google Play. Se
              comportă ca o aplicație nativă: are iconița ei pe ecranul
              principal, se deschide fullscreen și funcționează rapid.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {[
                {
                  icon: Smartphone,
                  title: "Ca o aplicație nativă",
                  text: "Iconița pe ecranul principal, fullscreen, experiență fluidă.",
                  accent: "bg-[#f6dcc0] text-[#8a4b2d]",
                },
                {
                  icon: Bell,
                  title: "Notificări push",
                  text: "Primești notificări chiar dacă nu ai aplicația deschisă.",
                  accent: "bg-[#d9eee8] text-[#1f5a4e]",
                },
                {
                  icon: MonitorSmartphone,
                  title: "Pe orice dispozitiv",
                  text: "iPhone, Android, laptop, desktop — același calendar peste tot.",
                  accent: "bg-[#dde8f6] text-[#365d89]",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[1.4rem] bg-[#f6f0e8] p-5">
                    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${item.accent}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="font-semibold text-stone-800">{item.title}</p>
                    <p className="mt-1.5 text-sm leading-6 text-stone-600">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Instrucțiuni iOS */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2">
            {/* iOS */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f6dcc0] text-[#8a4b2d]">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h2 className="landing-display text-2xl text-stone-900">
                  iPhone & iPad (iOS)
                </h2>
              </div>
              <div className="space-y-4">
                {STEPS_IOS.map((step) => (
                  <div
                    key={step.nr}
                    className="flex gap-4 rounded-[1.4rem] border border-[#ead9c8] bg-white/88 p-5"
                  >
                    <span className="landing-display text-2xl text-[#f0d8c4]">
                      {step.nr}
                    </span>
                    <div>
                      <p className="font-semibold text-stone-800">{step.title}</p>
                      <p className="mt-1 text-sm leading-6 text-stone-600">
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Android */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d9eee8] text-[#1f5a4e]">
                  <Share2 className="h-5 w-5" />
                </div>
                <h2 className="landing-display text-2xl text-stone-900">
                  Android
                </h2>
              </div>
              <div className="space-y-4">
                {STEPS_ANDROID.map((step) => (
                  <div
                    key={step.nr}
                    className="flex gap-4 rounded-[1.4rem] border border-[#ead9c8] bg-white/88 p-5"
                  >
                    <span className="landing-display text-2xl text-[#c8e0da]">
                      {step.nr}
                    </span>
                    <div>
                      <p className="font-semibold text-stone-800">{step.title}</p>
                      <p className="mt-1 text-sm leading-6 text-stone-600">
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SeoInternalLinks
        heading="Vezi și"
        links={[
          { href: "/register", label: "Creează cont", description: "Încearcă HomeSplit gratuit." },
          { href: "/aplicatie-co-parenting", label: "Aplicație co-parenting", description: "Tot ce include HomeSplit." },
          { href: "/faq", label: "Întrebări frecvente", description: "Răspunsuri complete." },
          { href: "/contact", label: "Contact", description: "Ai nevoie de ajutor?" },
          { href: "/despre", label: "Despre HomeSplit", description: "Povestea platformei." },
          { href: "/co-parenting", label: "Co-parenting", description: "Ghid complet co-parenting." },
        ]}
      />

      <SeoCTA
        heading="Accesibil de oriunde, oricând"
        subheading="Deschide HomeSplit din browser, creează cont gratuit și salvează pe ecranul principal."
        ctaLabel="Deschide HomeSplit"
        ctaHref="/register"
      />
    </SeoPageShell>
  );
}
