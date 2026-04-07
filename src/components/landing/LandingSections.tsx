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

const STOCK_IMAGES = {
  warmHome:
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1400&q=80",
  outsideCalm:
    "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1400&q=80",
  childFocus:
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1400&q=80",
};

const SOCIAL_SCENES: Array<{
  icon: LucideIcon;
  title: string;
  text: string;
  accent: string;
  iconTone: string;
  image: string;
  alt: string;
  position?: string;
}> = [
  {
    icon: House,
    title: "Două case, aceeași versiune a programului",
    text: "Nu mai există „credeam că rămâne altfel”. Programul și schimbările sensibile rămân sincronizate.",
    accent: "from-[#fff4e8] to-[#fffdf9]",
    iconTone: "bg-[#f6dcc0] text-[#8a4b2d]",
    image: STOCK_IMAGES.outsideCalm,
    alt: "Părinte și copil într-un moment calm afară",
  },
  {
    icon: MoonStar,
    title: "O casă, dar fără liste risipite prin cap",
    text: "Ritualurile, activitățile, documentele și ideile utile stau împreună, într-un spațiu care respiră.",
    accent: "from-[#edf6f3] to-[#fffdf9]",
    iconTone: "bg-[#d9eee8] text-[#1f5a4e]",
    image: STOCK_IMAGES.warmHome,
    alt: "Părinte și copil într-un moment cald acasă",
  },
  {
    icon: ShieldCheck,
    title: "Schimbările importante au memorie",
    text: "Ce s-a mutat, cine a editat și când a fost notificat celălalt părinte nu mai rămân ambigue.",
    accent: "from-[#f9f0da] to-[#fffdf9]",
    iconTone: "bg-[#f4e3b2] text-[#7a5620]",
    image: STOCK_IMAGES.childFocus,
    alt: "Copil atent într-un moment de joacă",
    position: "object-center",
  },
];

export function LandingSocialProof() {
  return (
    <section className="py-10 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {SOCIAL_SCENES.map((scene, index) => (
            <AnimateOnScroll key={scene.title} delay={index * 90}>
              <div className={`h-full overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br ${scene.accent} p-4 shadow-[0_20px_45px_rgba(28,25,23,0.06)]`}>
                <div className="overflow-hidden rounded-[1.6rem]">
                  <img
                    src={scene.image}
                    alt={scene.alt}
                    className={`h-56 w-full object-cover transition-transform duration-700 hover:scale-[1.04] ${scene.position ?? "object-center"}`}
                    loading="lazy"
                  />
                </div>
                <div className="px-2 pb-2 pt-5">
                  <IconBadge icon={scene.icon} colorClass={scene.iconTone} />
                  <h3 className="mt-5 text-xl font-extrabold text-stone-900">{scene.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-stone-600">{scene.text}</p>
                </div>
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
    problem: "Programul circulă în mesaje și versiuni diferite",
    solution: "Calendar unic, cu aceeași informație pentru ambii părinți",
  },
  {
    problem: "Un singur părinte ține minte tot: acte, alergii, ritualuri",
    solution: "Ritualuri, documente și informații medicale vizibile pentru amândoi",
  },
  {
    problem: "Schimbările importante rămân neclare după câteva zile",
    solution: "Istoric cu context și notificare când se modifică ceva relevant",
  },
];

export function LandingProblemSolution() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
        <AnimateOnScroll className="lg:sticky lg:top-28">
          <SectionHeading
            eyebrow="Problema pe care o rezolvăm"
            title="Coordonare clară pentru decizii de zi cu zi, fără conflicte inutile."
            text="Când programul copilului, ritualurile și documentele sunt în locuri diferite, apar neînțelegeri. HomeSplit le adună într-un flux comun, ușor de urmărit și de actualizat."
            align="left"
          />

          <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 shadow-[0_22px_56px_rgba(28,25,23,0.08)]">
            <div className="relative">
              <img
                src={STOCK_IMAGES.warmHome}
                alt="Părinte și copil într-un moment liniștit acasă"
                className="h-[18rem] w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,12,10,0.02)_0%,rgba(14,12,10,0.3)_100%)]" />
              <div className="absolute bottom-4 left-4 rounded-full bg-white/88 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-700 backdrop-blur">
                mai puține ambiguități în program
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[2rem] bg-[#1f3a36] p-7 text-white shadow-[0_28px_70px_rgba(31,58,54,0.18)]">
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">impact în practică</p>
            <p className="landing-display mt-4 text-4xl leading-tight">Mai puțin „cine a spus ce”.</p>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/78">
              Programul, excepțiile și informațiile medicale rămân în același loc, cu context și trasabilitate.
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
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">rezultat</p>
                <p className="landing-display mt-4 text-3xl leading-tight text-stone-900">
                  Un singur loc pentru program, context și sănătatea copilului.
                </p>
                <p className="mt-4 text-sm leading-7 text-stone-600">
                  Când apare o schimbare, nu mai căutați în chat: decizia, motivul și data sunt deja acolo.
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

const FEATURE_GALLERY = [
  {
    title: "Ritualuri și administrări zilnice",
    text: "Checklist de seară, administrări zilnice și istoric de medicație, cu reminder pentru părintele responsabil.",
    image: STOCK_IMAGES.warmHome,
    alt: "Părinte și copil într-un moment de seară acasă",
    className: "md:col-span-2",
  },
  {
    title: "Decizii rapide pe telefon",
    text: "Când apare o modificare, actualizezi imediat programul, fără pași inutili.",
    image: STOCK_IMAGES.childFocus,
    alt: "Copil într-un moment calm și concentrat",
    className: "",
  },
];

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
    icon: ShieldCheck,
    title: "Istoric medical și plan de tratament",
    text: "Gestionezi boala cap-coadă: perioadă de evoluție, rapoarte atașate, medicamente recurente și istoricul administrărilor.",
    bullets: ["timeline boli (start/sfârșit)", "recurență tratament (zilnic / la N zile)", "istoric medicamente administrate"],
    className: "",
    tone: "bg-[linear-gradient(135deg,#edf6f3_0%,#fffdf9_100%)]",
    iconTone: "bg-[#d9eee8] text-[#1f5a4e]",
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

const HEALTH_HIGHLIGHTS = [
  {
    title: "Timeline boli",
    text: "Vezi evoluția fiecărei afecțiuni cu dată de început și dată de sfârșit/încheiere.",
    tone: "bg-[#fff4e8]",
  },
  {
    title: "Rapoarte pe boală",
    text: "Atașezi documente medicale direct pe boala relevantă, pentru context clar.",
    tone: "bg-[#eef4fb]",
  },
  {
    title: "Recurrență tratament",
    text: "Setezi administrare zilnic sau la N zile, cu ore exacte și reminder.",
    tone: "bg-[#edf6f3]",
  },
  {
    title: "Istoric administrări",
    text: "Ai lista cu medicamente administrate în trecut, utilă pentru urmărire și discuții medicale.",
    tone: "bg-[#f8f1dc]",
  },
];

export function LandingFeatures() {
  return (
    <section id="functionalitati" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <SectionHeading
            eyebrow="Ce face produsul"
            title="Tot ce ține de copil, într-un singur loc clar pentru ambii părinți."
            text="HomeSplit adună programul, ritualurile, informațiile medicale, documentele și istoricul deciziilor într-o structură ușor de urmărit. Mai puține întrebări repetitive, mai puține neînțelegeri și mai mult timp pentru ce contează."
          />
        </AnimateOnScroll>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {FEATURE_GALLERY.map((item, index) => (
            <AnimateOnScroll key={item.title} delay={index * 80}>
              <div className={`overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_20px_45px_rgba(28,25,23,0.06)] ${item.className}`}>
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="h-64 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,12,10,0.03)_0%,rgba(14,12,10,0.38)_100%)]" />
                  <div className="absolute bottom-5 left-5 right-5 rounded-[1.5rem] bg-white/88 p-4 backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-stone-700">{item.text}</p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
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

        <AnimateOnScroll delay={180}>
          <div className="mt-8 rounded-[2.2rem] border border-[#ead9c8] bg-[linear-gradient(135deg,#fffdf9_0%,#edf6f3_100%)] p-6 shadow-[0_20px_45px_rgba(28,25,23,0.06)]">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Sănătate & tratament</p>
              <h3 className="mt-3 text-2xl font-extrabold text-stone-900 sm:text-3xl">
                Modul medical complet, explicat pe scurt.
              </h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                Nu este doar o listă de medicamente. Este un flux cap-coadă pentru boală, tratament, documente și administrări.
              </p>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {HEALTH_HIGHLIGHTS.map((item) => (
                <div key={item.title} className={`rounded-[1.5rem] border border-white/70 ${item.tone} p-4`}>
                  <p className="text-sm font-extrabold text-stone-900">{item.title}</p>
                  <p className="mt-2 text-xs leading-6 text-stone-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimateOnScroll>
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
            title="Configurare în câteva minute, beneficii din prima săptămână."
            text="Setezi familia, copilul și regulile de bază, apoi aveți același context pentru program, ritualuri, tratament și documente."
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
    quote: "“Ce tratament urmează și cine l-a administrat?”",
    answer:
      "Ai timeline de boli (cu început/sfârșit), planuri de tratament cu recurență, rapoarte medicale atașate și listă cu medicamente administrate în trecut.",
    tone: "bg-[#edf6f3]",
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
            title="Situații reale în care diferența se vede imediat."
            text="De la mutări de program și handover, până la tratament, acte și rutină de seară, HomeSplit ține aceeași imagine pentru toți cei implicați."
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
                <p className="text-xs uppercase tracking-[0.24em] text-white/55">de ce funcționează</p>
                <h2 className="landing-display mt-4 text-4xl leading-tight sm:text-5xl">
                  Un produs util când aveți nevoie de claritate, nu de încă un canal de comunicare.
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-8 text-white/75 sm:text-base">
                  Fiecare zonă este construită pentru decizii concrete: cine este cu copilul, ce urmează, ce s-a schimbat, ce tratament se administrează și unde sunt documentele.
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
            title="Intri imediat, de pe orice dispozitiv — fără instalare, fără pași inutili."
            text="Când apare o schimbare de program sau o nevoie urgentă, ultimul lucru de care ai nevoie e fricțiune tehnică. HomeSplit funcționează direct din browser pe telefon, tabletă și laptop, ca să poți acționa rapid și să rămâneți sincronizați."
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
