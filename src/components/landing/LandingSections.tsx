"use client";

import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  House,
  MessageSquare,
  MonitorSmartphone,
  MoonStar,
  Repeat2,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { AnimateOnScroll } from "./AnimateOnScroll";

function SectionHeading({
  eyebrow,
  title,
  text,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  text: string;
  align?: "center" | "left";
}) {
  const alignment =
    align === "center" ? "mx-auto text-center items-center" : "text-left items-start";

  return (
    <div className={`flex max-w-3xl flex-col gap-4 ${alignment}`}>
      <span className="inline-flex rounded-full border border-[#ead9c8] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
        {eyebrow}
      </span>
      <h2 className="landing-display text-4xl leading-tight text-stone-900 sm:text-5xl">{title}</h2>
      <p className="max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">{text}</p>
    </div>
  );
}

function IconBadge({
  icon: Icon,
  colorClass,
}: {
  icon: LucideIcon;
  colorClass: string;
}) {
  return (
    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colorClass}`}>
      <Icon className="h-5 w-5" />
    </div>
  );
}

const SOCIAL_SCENES: Array<{
  icon: LucideIcon;
  title: string;
  text: string;
  accent: string;
  iconTone: string;
}> = [
  {
    icon: House,
    title: "Două case, aceeași versiune a programului",
    text: "Nu mai există „credeam că rămâne altfel”. Programul și schimbările sensibile rămân sincronizate.",
    accent: "from-[#fff4e8] to-[#fffdf9]",
    iconTone: "bg-[#f6dcc0] text-[#8a4b2d]",
  },
  {
    icon: MoonStar,
    title: "O casă, dar fără liste risipite prin cap",
    text: "Ritualurile, activitățile, documentele și ideile utile stau împreună, într-un spațiu care respiră.",
    accent: "from-[#edf6f3] to-[#fffdf9]",
    iconTone: "bg-[#d9eee8] text-[#1f5a4e]",
  },
  {
    icon: ShieldCheck,
    title: "Schimbările importante au memorie",
    text: "Ce s-a mutat, cine a editat și când a fost notificat celălalt părinte nu mai rămân ambigue.",
    accent: "from-[#f9f0da] to-[#fffdf9]",
    iconTone: "bg-[#f4e3b2] text-[#7a5620]",
  },
];

export function LandingSocialProof() {
  return (
    <section className="py-10 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {SOCIAL_SCENES.map((scene, index) => (
            <AnimateOnScroll key={scene.title} delay={index * 90}>
              <div className={`h-full rounded-[2rem] border border-white/70 bg-gradient-to-br ${scene.accent} p-6 shadow-[0_20px_45px_rgba(28,25,23,0.06)]`}>
                <IconBadge icon={scene.icon} colorClass={scene.iconTone} />
                <h3 className="mt-5 text-xl font-extrabold text-stone-900">{scene.title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">{scene.text}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

const TRANSITIONS = [
  {
    problem: "Detalii pierdute în conversații",
    solution: "Calendar, note și schimbări logate într-un singur spațiu",
  },
  {
    problem: "Încărcare mentală pe umerii unuia dintre părinți",
    solution: "Ritualuri, documente și informații utile vizibile pentru amândoi",
  },
  {
    problem: "Schimbări sensibile rămase neclare după ce au trecut",
    solution: "Istoric, motiv și notificare clară când se editează ceva important",
  },
];

export function LandingProblemSolution() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
        <AnimateOnScroll className="lg:sticky lg:top-28">
          <SectionHeading
            eyebrow="Atmosferă, nu doar funcții"
            title="Când coordonarea iese din haos, casa se simte altfel."
            text="HomeSplit nu încearcă să vă facă mai ocupați. Mută informația într-un loc calm, clar și suficient de bine gândit încât să reducă fricțiunea zilnică."
            align="left"
          />

          <div className="mt-8 rounded-[2rem] bg-[#1f3a36] p-7 text-white shadow-[0_28px_70px_rgba(31,58,54,0.18)]">
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">ce se simte diferit</p>
            <p className="landing-display mt-4 text-4xl leading-tight">Din reacție, în ritm.</p>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/78">
              Programul nu mai este “ce mai rezolvăm azi?”, ci o imagine comună despre ce urmează, ce s-a schimbat și ce trebuie ținut minte.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid gap-5">
          {TRANSITIONS.map((item, index) => (
            <AnimateOnScroll key={item.problem} delay={index * 100}>
              <div className="rounded-[2rem] border border-[#ead9c8] bg-white/85 p-6 shadow-[0_18px_40px_rgba(28,25,23,0.06)]">
                <div className="grid gap-4 md:grid-cols-[0.9fr_auto_1.1fr] md:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">înainte</p>
                    <p className="mt-2 text-lg font-semibold leading-7 text-stone-800">{item.problem}</p>
                  </div>
                  <div className="hidden justify-center md:flex">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff1e5] text-[#b85c3e]">
                      <Repeat2 className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="rounded-[1.4rem] bg-[#f8f3ec] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">după</p>
                    <p className="mt-2 text-lg font-semibold leading-7 text-stone-900">{item.solution}</p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}

          <AnimateOnScroll delay={320}>
            <div className="grid gap-5 rounded-[2.2rem] border border-[#ead9c8] bg-[linear-gradient(135deg,#fff3e7_0%,#fffdf9_55%,#edf6f3_100%)] p-6 shadow-[0_22px_50px_rgba(28,25,23,0.06)] sm:grid-cols-[1.15fr_0.85fr] sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">micro-story</p>
                <p className="landing-display mt-4 text-3xl leading-tight text-stone-900">
                  Un loc pentru program. Un loc pentru context. Un loc pentru liniște.
                </p>
                <p className="mt-4 text-sm leading-7 text-stone-600">
                  Nu arată ca un spreadsheet. Arată ca un produs care înțelege că familia are ritm, nu doar deadline-uri.
                </p>
              </div>
              <div className="rounded-[1.8rem] bg-white/80 p-5 shadow-[0_16px_32px_rgba(28,25,23,0.06)]">
                <div className="space-y-3">
                  <div className="rounded-[1rem] bg-[#fff4e8] px-4 py-3 text-sm font-semibold text-[#8a4b2d]">
                    Programul săptămânii este deja clar
                  </div>
                  <div className="rounded-[1rem] bg-[#edf6f3] px-4 py-3 text-sm font-semibold text-[#1f5a4e]">
                    Handover-ul vine cu locație, oră și notițe
                  </div>
                  <div className="rounded-[1rem] bg-[#f8f1dc] px-4 py-3 text-sm font-semibold text-[#7a5620]">
                    Schimbările sensibile rămân explicate și notificabile
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}

const FEATURE_CARDS: Array<{
  icon: LucideIcon;
  title: string;
  text: string;
  bullets: string[];
  className: string;
  tone: string;
  iconTone: string;
}> = [
  {
    icon: CalendarDays,
    title: "Calendar care nu se discută de la zero în fiecare zi",
    text: "Vezi rapid cine, unde și când, cu ore, locații și handover acolo unde contează.",
    bullets: ["săptămână și lună", "predare cu context", "editări clar vizibile"],
    className: "md:col-span-2",
    tone: "bg-[linear-gradient(135deg,#fff6ed_0%,#fffdf9_100%)]",
    iconTone: "bg-[#f6dcc0] text-[#8a4b2d]",
  },
  {
    icon: MoonStar,
    title: "Ritualuri comune",
    text: "Copilul păstrează același ritm, indiferent unde adoarme în seara respectivă.",
    bullets: ["checklist simplu", "ordine clară", "reminder la ora potrivită"],
    className: "",
    tone: "bg-[linear-gradient(135deg,#edf6f3_0%,#fffdf9_100%)]",
    iconTone: "bg-[#d9eee8] text-[#1f5a4e]",
  },
  {
    icon: Sparkles,
    title: "Idei și jurnal de activități",
    text: "Ai inspirație pentru weekend și memorie pentru ce ați făcut deja.",
    bullets: ["recomandări AI", "accept sau refuz", "istoric util pentru data viitoare"],
    className: "",
    tone: "bg-[linear-gradient(135deg,#fff4e8_0%,#fffdf9_100%)]",
    iconTone: "bg-[#f6e7c7] text-[#7a5620]",
  },
  {
    icon: FileText,
    title: "Documente și informații sensibile, la îndemână",
    text: "Alergii, acte, note importante și expirări nu mai stau împrăștiate prin mesaje sau foldere.",
    bullets: ["profil copil", "acte și remindere", "acces comun în familie"],
    className: "",
    tone: "bg-[linear-gradient(135deg,#eef4fb_0%,#fffdf9_100%)]",
    iconTone: "bg-[#dde8f6] text-[#365d89]",
  },
  {
    icon: MessageSquare,
    title: "Context lângă calendar",
    text: "Mesajele importante trăiesc în aceeași zonă cu programul, nu în alt univers.",
    bullets: ["mai puțin forward", "mai puține interpretări", "mai puțin ping-pong"],
    className: "",
    tone: "bg-[linear-gradient(135deg,#f9f1e6_0%,#fffdf9_100%)]",
    iconTone: "bg-[#f5dfbe] text-[#8a6330]",
  },
  {
    icon: BellRing,
    title: "Automatizare și notificări care ajută",
    text: "Propuneri săptămânale, remindere și notificări utile când există o schimbare relevantă.",
    bullets: ["ritualuri la oră fixă", "propunere de duminică", "notificări pentru modificări"],
    className: "md:col-span-2",
    tone: "bg-[linear-gradient(135deg,#edf6f3_0%,#fff3e7_100%)]",
    iconTone: "bg-[#d9eee8] text-[#1f5a4e]",
  },
];

export function LandingFeatures() {
  return (
    <section id="functionalitati" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <SectionHeading
            eyebrow="Ce face produsul"
            title="Mai puține blocuri de text. Mai multe momente în care totul are sens."
            text="Am păstrat funcțiile care chiar reduc stresul și le-am așezat într-un flow care se vede rapid: program, ritualuri, documente, idei și istoric clar."
          />
        </AnimateOnScroll>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {FEATURE_CARDS.map((card, index) => (
            <AnimateOnScroll key={card.title} delay={index * 70}>
              <div className={`h-full rounded-[2rem] border border-white/70 ${card.tone} p-6 shadow-[0_20px_45px_rgba(28,25,23,0.06)] ${card.className}`}>
                <IconBadge icon={card.icon} colorClass={card.iconTone} />
                <h3 className="mt-5 text-2xl font-extrabold text-stone-900">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">{card.text}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {card.bullets.map((bullet) => (
                    <span key={bullet} className="rounded-full border border-[#ead9c8] bg-white/75 px-3 py-1.5 text-xs font-semibold text-stone-600">
                      {bullet}
                    </span>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: House,
    title: "Creezi familia",
    text: "Adaugi copilul și inviți celălalt părinte atunci când sunteți gata.",
  },
  {
    icon: CalendarDays,
    title: "Pui ritmul de bază",
    text: "Calendar, activități, zile blocate, documente și ritualuri comune.",
  },
  {
    icon: Repeat2,
    title: "Aplicația înțelege repetiția",
    text: "Ce se repetă și ce e excepție nu mai trebuie reinventat săptămânal.",
  },
  {
    icon: BellRing,
    title: "Folosiți, ajustați, continuați",
    text: "Programul trăiește cu voi și notifică atunci când chiar contează.",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="cum-functioneaza" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <SectionHeading
            eyebrow="Cum începe"
            title="Onboarding scurt. Claritate care rămâne."
            text="Nu trebuie să înveți un sistem greoi. Primii pași sunt puțini, iar valoarea apare imediat ce programul începe să aibă o singură sursă."
          />
        </AnimateOnScroll>

        <div className="relative mt-14 grid gap-5 lg:grid-cols-4">
          <div className="absolute left-8 right-8 top-9 hidden border-t border-dashed border-[#d8c2ad] lg:block" />
          {STEPS.map((step, index) => (
            <AnimateOnScroll key={step.title} delay={index * 90}>
              <div className="relative h-full rounded-[2rem] border border-[#ead9c8] bg-white/85 p-6 shadow-[0_18px_40px_rgba(28,25,23,0.06)]">
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff3e7] text-[#b85c3e]">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="landing-display text-4xl text-[#d4b39a]">{index + 1}</span>
                </div>
                <h3 className="mt-6 text-xl font-extrabold text-stone-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">{step.text}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

const USE_CASES = [
  {
    quote: "“Pleci marți dimineață și trebuie mutat programul de handover.”",
    answer: "Modifici, motivezi, iar celălalt părinte vede exact schimbarea.",
    tone: "bg-[#fff3e7]",
  },
  {
    quote: "“Nu vrem să uităm duș, dinți, poveste și somn devreme.”",
    answer: "Ritualul devine vizibil și repetabil, nu încă o promisiune verbală.",
    tone: "bg-[#edf6f3]",
  },
  {
    quote: "“Ce facem în weekend fără să repetăm același mall?”",
    answer: "Tab-ul Idei propune opțiuni și jurnalul păstrează memoria activităților.",
    tone: "bg-[#f8f1dc]",
  },
  {
    quote: "“Unde e acordul de călătorie?”",
    answer: "În hub-ul comun, alături de celelalte documente importante.",
    tone: "bg-[#eef4fb]",
  },
  {
    quote: "“Copilul are alergie și bunicii trebuie să știe imediat.”",
    answer: "Informația nu mai stă ascunsă într-un mesaj vechi.",
    tone: "bg-[#fff5eb]",
  },
  {
    quote: "“Ce s-a schimbat săptămâna trecută?”",
    answer: "Istoricul oferă context, responsabilitate și memorie comună.",
    tone: "bg-[#f6efe6]",
  },
];

export function LandingUseCases() {
  return (
    <section id="scenarii" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <SectionHeading
            eyebrow="Scenarii reale"
            title="Viața de familie nu vine în bullet points perfecte."
            text="Tocmai de aceea designul și funcțiile trebuie să răspundă la situații concrete: mutări, rutină, vacanțe, alergii, schimbări sensibile și serile care trebuie să curgă mai calm."
          />
        </AnimateOnScroll>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {USE_CASES.map((item, index) => (
            <AnimateOnScroll key={item.quote} delay={index * 80}>
              <div className={`h-full rounded-[2rem] border border-white/70 ${item.tone} p-6 shadow-[0_18px_40px_rgba(28,25,23,0.05)]`}>
                <p className="landing-display text-2xl leading-tight text-stone-900">{item.quote}</p>
                <p className="mt-4 text-sm leading-7 text-stone-600">{item.answer}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

const PRINCIPLES: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: Clock3,
    title: "Reduce zgomotul zilnic",
    text: "Nu te obligă să citești mult ca să înțelegi repede ce urmează.",
  },
  {
    icon: Smartphone,
    title: "Arată bine pe telefon",
    text: "Pentru că acolo sunt luate cele mai multe decizii din mers.",
  },
  {
    icon: BookOpen,
    title: "Păstrează contextul",
    text: "Nu doar programul, ci și informațiile care îl fac ușor de urmat.",
  },
  {
    icon: ShieldCheck,
    title: "Respectă sensibilitatea datelor",
    text: "Datele despre copil trebuie tratate cu grijă, nu doar stocate.",
  },
];

export function LandingWhyUs() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <div className="overflow-hidden rounded-[2.6rem] bg-[#1f3a36] px-6 py-10 text-white shadow-[0_30px_80px_rgba(31,58,54,0.2)] sm:px-10">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/55">De ce se simte diferit</p>
                <h2 className="landing-display mt-4 text-4xl leading-tight sm:text-5xl">
                  HomeSplit nu arată ca un proces rece. Arată ca un spațiu de familie.
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-8 text-white/75 sm:text-base">
                  Direcția de produs și direcția vizuală spun același lucru: claritatea nu trebuie să fie austeră. Poate fi caldă, memorabilă și foarte practică în același timp.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {PRINCIPLES.map((item, index) => (
                  <AnimateOnScroll key={item.title} delay={index * 80}>
                    <div className="h-full rounded-[1.8rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#f8c89f]">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-lg font-extrabold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-white/72">{item.text}</p>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}

const WEB_APP_COLUMNS: Array<{
  icon: LucideIcon;
  title: string;
  text: string;
  steps: string[];
}> = [
  {
    icon: Smartphone,
    title: "iPhone și Android",
    text: "Se deschide direct în browser și poate fi salvat pe ecran ca icon.",
    steps: ["deschizi linkul", "adaugi pe home screen", "intri ca într-o aplicație"],
  },
  {
    icon: MonitorSmartphone,
    title: "Laptop și desktop",
    text: "Folosești exact același spațiu atunci când e mai comod să vezi totul pe ecran mare.",
    steps: ["deschizi în browser", "instalezi shortcut-ul", "revii rapid oricând"],
  },
  {
    icon: BellRing,
    title: "Fără App Store, fără fricțiune",
    text: "Important pentru familii: acces imediat, fără pași complicați sau update-uri care blochează.",
    steps: ["fără conturi suplimentare", "fără instalări greoaie", "fără așteptare inutilă"],
  },
];

export function LandingWebApp() {
  return (
    <section id="web-app" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <SectionHeading
            eyebrow="Web app"
            title="Arată premium, dar intri instant."
            text="Landing-ul poate fi emoțional și produsul poate rămâne extrem de practic. HomeSplit merge pe telefon, tabletă și laptop, fără instalare din store."
          />
        </AnimateOnScroll>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <AnimateOnScroll>
            <div className="rounded-[2.4rem] border border-white/70 bg-[linear-gradient(135deg,#fff3e7_0%,#edf6f3_100%)] p-5 shadow-[0_22px_50px_rgba(28,25,23,0.06)]">
              <div className="rounded-[2rem] bg-white/85 p-5 shadow-[0_12px_26px_rgba(28,25,23,0.06)]">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#f7a072]" />
                  <span className="h-3 w-3 rounded-full bg-[#f6d365]" />
                  <span className="h-3 w-3 rounded-full bg-[#89c2b0]" />
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-[0.48fr_0.52fr] md:items-end">
                  <div className="mx-auto w-full max-w-[15rem] rounded-[2rem] bg-[#1f3a36] p-3 text-white shadow-[0_18px_40px_rgba(31,58,54,0.18)]">
                    <div className="rounded-[1.6rem] bg-[#102523] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/60">telefon</p>
                      <div className="mt-4 space-y-3">
                        <div className="rounded-[1rem] bg-white/10 px-3 py-3 text-sm">Programul săptămânii</div>
                        <div className="rounded-[1rem] bg-white/10 px-3 py-3 text-sm">Ritual de seară 19:30</div>
                        <div className="rounded-[1rem] bg-[#f8c89f] px-3 py-3 text-sm text-[#1f3a36]">
                          notificare importantă
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1.8rem] bg-[#fff8f1] p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">ce contează aici</p>
                    <p className="landing-display mt-4 text-3xl leading-tight text-stone-900">
                      Același acces simplu pentru ambii părinți.
                    </p>
                    <p className="mt-4 text-sm leading-7 text-stone-600">
                      Fără bariere inutile la intrare. Când ai nevoie de program, documente sau context, intri imediat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          <div className="grid gap-5">
            {WEB_APP_COLUMNS.map((item, index) => (
              <AnimateOnScroll key={item.title} delay={index * 90}>
                <div className="rounded-[2rem] border border-[#ead9c8] bg-white/85 p-6 shadow-[0_18px_40px_rgba(28,25,23,0.06)]">
                  <IconBadge icon={item.icon} colorClass="bg-[#eef5f3] text-[#1f5a4e]" />
                  <h3 className="mt-4 text-xl font-extrabold text-stone-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-stone-600">{item.text}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.steps.map((step) => (
                      <span key={step} className="rounded-full bg-[#f7f0e7] px-3 py-1.5 text-xs font-semibold text-stone-600">
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const SECURITY_POINTS = [
  "Acces doar pe invitație",
  "Date sensibile tratate cu respect",
  "Export și control asupra propriilor informații",
  "Fără vânzare de date către terți",
];

export function LandingSecurity() {
  return (
    <section id="siguranta" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <div className="grid gap-6 rounded-[2.6rem] border border-[#ead9c8] bg-[linear-gradient(135deg,#fffaf4_0%,#f7f1e9_100%)] p-6 shadow-[0_22px_50px_rgba(28,25,23,0.06)] lg:grid-cols-[0.85fr_1.15fr] lg:items-center sm:p-8">
            <div className="rounded-[2rem] bg-[#1f3a36] p-7 text-white">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#f8c89f]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="landing-display mt-5 text-4xl leading-tight">
                Datele copilului nu sunt un simplu “asset”.
              </p>
              <p className="mt-4 text-sm leading-7 text-white/78">
                Dacă produsul promite claritate, trebuie să livreze și responsabilitate. Mai ales când vorbim despre informații sensibile.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {SECURITY_POINTS.map((point, index) => (
                <AnimateOnScroll key={point} delay={index * 70}>
                  <div className="rounded-[1.6rem] bg-white/85 p-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf6f3] text-[#1f5a4e]">
                      <Check className="h-4 w-4" />
                    </div>
                    <p className="mt-4 text-base font-semibold leading-7 text-stone-800">{point}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
