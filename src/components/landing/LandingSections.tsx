"use client";

import { AnimateOnScroll } from "./AnimateOnScroll";

export function LandingSocialProof() {
  const badges = [
    "Planificare săptămânală automată",
    "Activități recurente + responsabil",
    "Alergii & documente la îndemână",
    "Istoric și trasabilitate",
  ];
  return (
    <section className="border-y border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <h2 className="text-center text-xl font-semibold text-stone-800 dark:text-stone-100 sm:text-2xl">
            Pentru părinți care vor claritate, nu discuții în buclă.
          </h2>
        </AnimateOnScroll>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {badges.map((label, i) => (
            <AnimateOnScroll key={label} delay={i * 80}>
              <span className="rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 shadow-sm">
                {label}
              </span>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingProblemSolution() {
  const cards = [
    { pain: "Mesaje infinite", fix: "Plan centralizat", detail: "Programul e într-un singur loc, vizibil pentru amândoi." },
    { pain: "Conflicte pe „cine duce”", fix: "Responsabilități clare", detail: "Activitățile copilului au responsabil setat (fix sau rotativ)." },
    { pain: "Informații risipite", fix: "Profil complet", detail: "Alergii, medic, școală, documente, contacte — rapid, oricând." },
  ];
  return (
    <section id="problema" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <h2 className="text-center text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
            Când programul e neclar, apar tensiuni. Când e clar, copilul câștigă.
          </h2>
        </AnimateOnScroll>
        <AnimateOnScroll delay={100}>
          <p className="mx-auto mt-4 max-w-2xl text-center text-stone-600 dark:text-stone-400">
            Co-parenting-ul devine greu când fiecare schimbare înseamnă mesaje, calcule și interpretări. Aplicația transformă totul într-un sistem simplu: disponibilitate, reguli, activități și locații — iar programul săptămânal se generează logic, nu emoțional.
          </p>
        </AnimateOnScroll>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {cards.map((card, i) => (
            <AnimateOnScroll key={card.fix} delay={150 + i * 100}>
              <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6 shadow-sm">
                <p className="text-sm font-medium text-stone-400 dark:text-stone-500">{card.pain}</p>
                <p className="mt-1 text-lg font-semibold text-amber-700 dark:text-amber-300">→ {card.fix}</p>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{card.detail}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    title: "Program & calendar",
    items: ["Calendar săptămânal/lunar pentru timpul copilului", "Handover: ore, locații, note"],
  },
  {
    title: "Zile blocate & disponibilitate",
    items: ["Blochezi zile/intervale când nu poți", "Repetare (recurring) + motive (opțional)"],
  },
  {
    title: "Activități recurente",
    items: ["Ex: Balet – miercuri 16:00", "Locație, durată, reminders", "„Cine duce / cine ia” (fix sau alternant)"],
  },
  {
    title: "Propunerea automată de duminică",
    items: ["Generează programul săptămânii viitoare", "Ține cont de: zile blocate, activități recurente, reguli", "Acceptă / ajustează / propune schimb"],
  },
  {
    title: "Profil copil (1+ copii)",
    items: ["Alergii + ce trebuie evitat", "Medicație / instrucțiuni", "Contacte utile (pediatru, școală, urgențe)"],
  },
  {
    title: "Documente & călătorie",
    items: ["Pașaport/CI, asigurare, acord de călătorie", "Încărcare + expirare + reminders"],
  },
];

export function LandingFeatures() {
  return (
    <section id="functionalitati" className="bg-stone-50/50 dark:bg-stone-900/30 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <h2 className="text-center text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
            Tot ce ai nevoie pentru co-parenting, organizat pe module.
          </h2>
        </AnimateOnScroll>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <AnimateOnScroll key={f.title} delay={i * 60}>
              <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6 shadow-sm">
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">{f.title}</h3>
                <ul className="mt-3 space-y-1 text-sm text-stone-600 dark:text-stone-400">
                  {f.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-amber-500">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
        <AnimateOnScroll delay={400}>
          <div className="mt-10 text-center">
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3 font-medium text-white hover:bg-amber-600 transition"
            >
              Încearcă Pro 14 zile (fără card)
            </a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}

const STEPS = [
  { title: "Pasul 1 — Creezi familia", text: "Adaugi copilul/copiii și inviți celălalt părinte." },
  { title: "Pasul 2 — Setezi disponibilitatea", text: "Introduci zile blocate, intervale și activitățile recurente." },
  { title: "Pasul 3 — Duminică primești propunerea", text: "Aplicația generează automat programul pentru săptămâna următoare." },
  { title: "Pasul 4 — Ajustați și confirmați", text: "Acceptați sau editați, apoi rămâne un plan clar pentru amândoi." },
];

export function LandingHowItWorks() {
  return (
    <section id="cum-functioneaza" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <h2 className="text-center text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
            Setare rapidă. Beneficii imediat.
          </h2>
        </AnimateOnScroll>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <AnimateOnScroll key={step.title} delay={i * 100}>
              <div className="relative">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 font-semibold">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold text-stone-900 dark:text-stone-100">{step.title}</h3>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{step.text}</p>
                {i < STEPS.length - 1 && (
                  <span className="absolute -right-4 top-5 hidden text-stone-300 dark:text-stone-600 lg:inline" aria-hidden>→</span>
                )}
              </div>
            </AnimateOnScroll>
          ))}
        </div>
        <AnimateOnScroll delay={500}>
          <div className="mt-10 text-center">
            <a href="/login" className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3 font-medium text-white hover:bg-amber-600 transition">
              Încearcă gratuit
            </a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}

export function LandingWebApp() {
  const benefits = [
    { title: "Acces instant", sub: "link → login → gata" },
    { title: "Funcționează peste tot", sub: "iOS, Android, Windows, macOS" },
    { title: "Icon pe ecran", sub: "se comportă ca o aplicație (shortcut)" },
  ];
  const iosSteps = ["Deschide aplicația în Safari", "Apasă Share (pătratul cu săgeată)", "Alege Add to Home Screen / Adaugă pe ecranul principal", "Confirmă Add"];
  const androidSteps = ["Deschide în Chrome", "Apasă meniul ⋮ (dreapta sus)", "Alege Add to Home screen", "Confirmă"];
  const desktopSteps = ["Deschide în browser", "Apasă icon Install din bara de adresă sau ⋮ → More tools → Create shortcut", "Bifează Open as window (opțional) și confirmă"];
  return (
    <section id="web-app" className="bg-stone-50/50 dark:bg-stone-900/30 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <h2 className="text-center text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
            E web app — intri din browser. Dacă vrei, o pui pe ecran ca o aplicație.
          </h2>
        </AnimateOnScroll>
        <AnimateOnScroll delay={100}>
          <p className="mx-auto mt-4 max-w-2xl text-center text-stone-600 dark:text-stone-400">
            Funcționează pe telefon, tabletă și laptop. Ideal pentru co-parenting: fiecare părinte intră rapid, fără instalări și fără update-uri.
          </p>
        </AnimateOnScroll>
        <div className="mt-10 flex flex-wrap justify-center gap-6">
          {benefits.map((b, i) => (
            <AnimateOnScroll key={b.title} delay={150 + i * 80}>
              <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-5 py-3 text-center">
                <p className="font-medium text-stone-800 dark:text-stone-200">{b.title}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">{b.sub}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          <AnimateOnScroll delay={400}>
            <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-5">
              <h4 className="font-semibold text-stone-900 dark:text-stone-100">iPhone / iPad (Safari)</h4>
              <ol className="mt-3 list-decimal list-inside space-y-1 text-sm text-stone-600 dark:text-stone-400">
                {iosSteps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={500}>
            <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-5">
              <h4 className="font-semibold text-stone-900 dark:text-stone-100">Android (Chrome)</h4>
              <ol className="mt-3 list-decimal list-inside space-y-1 text-sm text-stone-600 dark:text-stone-400">
                {androidSteps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={600}>
            <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-5">
              <h4 className="font-semibold text-stone-900 dark:text-stone-100">Desktop (Chrome / Edge)</h4>
              <ol className="mt-3 list-decimal list-inside space-y-1 text-sm text-stone-600 dark:text-stone-400">
                {desktopSteps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          </AnimateOnScroll>
        </div>
        <AnimateOnScroll delay={700}>
          <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
            În 10 secunde ai un icon pe ecran și intri ca într-o aplicație.
          </p>
          <div className="mt-4 text-center">
            <a href="/login" className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3 font-medium text-white hover:bg-amber-600 transition">
              Deschide web app-ul
            </a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}

const USE_CASES = [
  { quote: "Am deplasare marți–miercuri.", answer: "Blochezi zilele, aplicația propune automat ajustarea." },
  { quote: "Balet miercuri 16:00 — cine duce?", answer: "Activitatea e recurentă și are responsabil clar." },
  { quote: "Schimbăm locul de predare.", answer: "Actualizezi locația, rămâne în calendar." },
  { quote: "Plecați în vacanță.", answer: "Ai documentele la îndemână + reminder la expirare." },
  { quote: "Copilul are alergie.", answer: "Informația e vizibilă imediat, fără căutat prin conversații." },
];

export function LandingUseCases() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <h2 className="text-center text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
            Exact pentru situațiile care creează fricțiune.
          </h2>
        </AnimateOnScroll>
        <div className="mt-12 space-y-4">
          {USE_CASES.map((uc, i) => (
            <AnimateOnScroll key={uc.quote} delay={i * 80}>
              <div className="flex flex-col gap-2 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-medium text-stone-800 dark:text-stone-200">&bdquo;{uc.quote}&rdquo;</p>
                <p className="text-sm text-amber-700 dark:text-amber-300 sm:text-right">{uc.answer}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

const WHY_US = [
  { title: "Automatizare săptămânală", text: "Propunere de duminică bazată pe datele reale." },
  { title: "Trasabilitate", text: "Istoric schimbări pentru claritate și responsabilitate." },
  { title: "Siguranță", text: "Alergii + documente + reminders, centralizate." },
];

export function LandingWhyUs() {
  return (
    <section id="diferentiator" className="bg-stone-50/50 dark:bg-stone-900/30 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <h2 className="text-center text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
            Nu e doar un calendar. E un sistem de co-parenting.
          </h2>
        </AnimateOnScroll>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {WHY_US.map((item, i) => (
            <AnimateOnScroll key={item.title} delay={i * 100}>
              <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6 text-center">
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">{item.title}</h3>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{item.text}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingSecurity() {
  const points = [
    "Acces doar pe bază de invitație",
    "Control asupra datelor (export / ștergere cont)",
    "Nu vindem date. Niciodată.",
  ];
  return (
    <section id="siguranta" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <h2 className="text-center text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
            Datele copilului sunt sensibile. Noi le tratăm ca atare.
          </h2>
        </AnimateOnScroll>
        <ul className="mx-auto mt-8 max-w-xl space-y-3">
          {points.map((p, i) => (
            <AnimateOnScroll key={p} delay={i * 80}>
              <li className="flex items-center gap-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-5 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </span>
                <span className="text-stone-700 dark:text-stone-300">{p}</span>
              </li>
            </AnimateOnScroll>
          ))}
        </ul>
        <AnimateOnScroll delay={400}>
          <p className="mt-8 text-center font-medium text-stone-600 dark:text-stone-400">
            Confidențialitatea nu e un feature. E standardul.
          </p>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
