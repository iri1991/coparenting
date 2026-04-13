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
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Static visual data (icons, colors, images — language-neutral) ───────────

const STOCK_IMAGES = {
  warmHome: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1400&q=80",
  outsideCalm: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1400&q=80",
  childFocus: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1400&q=80",
};

const SOCIAL_SCENE_META = [
  { icon: House,       accent: "from-[#fff4e8] to-[#fffdf9]", iconTone: "bg-[#f6dcc0] text-[#8a4b2d]", image: STOCK_IMAGES.outsideCalm, position: undefined },
  { icon: MoonStar,    accent: "from-[#edf6f3] to-[#fffdf9]", iconTone: "bg-[#d9eee8] text-[#1f5a4e]", image: STOCK_IMAGES.warmHome,    position: undefined },
  { icon: ShieldCheck, accent: "from-[#f9f0da] to-[#fffdf9]", iconTone: "bg-[#f4e3b2] text-[#7a5620]", image: STOCK_IMAGES.childFocus,  position: "object-center" },
] as const;

const FEATURE_CARD_META: Array<{ icon: LucideIcon; className: string; tone: string; iconTone: string }> = [
  { icon: CalendarDays, className: "md:col-span-2", tone: "bg-[linear-gradient(135deg,#fff6ed_0%,#fffdf9_100%)]",  iconTone: "bg-[#f6dcc0] text-[#8a4b2d]" },
  { icon: MoonStar,     className: "",               tone: "bg-[linear-gradient(135deg,#edf6f3_0%,#fffdf9_100%)]", iconTone: "bg-[#d9eee8] text-[#1f5a4e]" },
  { icon: Sparkles,     className: "",               tone: "bg-[linear-gradient(135deg,#fff4e8_0%,#fffdf9_100%)]", iconTone: "bg-[#f6e7c7] text-[#7a5620]" },
  { icon: FileText,     className: "",               tone: "bg-[linear-gradient(135deg,#eef4fb_0%,#fffdf9_100%)]", iconTone: "bg-[#dde8f6] text-[#365d89]" },
  { icon: ShieldCheck,  className: "",               tone: "bg-[linear-gradient(135deg,#edf6f3_0%,#fffdf9_100%)]", iconTone: "bg-[#d9eee8] text-[#1f5a4e]" },
  { icon: MessageSquare,className: "",               tone: "bg-[linear-gradient(135deg,#f9f1e6_0%,#fffdf9_100%)]", iconTone: "bg-[#f5dfbe] text-[#8a6330]" },
  { icon: BellRing,     className: "md:col-span-2",  tone: "bg-[linear-gradient(135deg,#edf6f3_0%,#fff3e7_100%)]", iconTone: "bg-[#d9eee8] text-[#1f5a4e]" },
];

const HEALTH_TONES = ["bg-[#fff4e8]", "bg-[#eef4fb]", "bg-[#edf6f3]", "bg-[#f8f1dc]"];

const STEP_ICONS: LucideIcon[] = [House, CalendarDays, Repeat2, BellRing];

const USE_CASE_TONES = ["bg-[#fff3e7]", "bg-[#edf6f3]", "bg-[#f8f1dc]", "bg-[#eef4fb]", "bg-[#edf6f3]", "bg-[#fff5eb]", "bg-[#f6efe6]"];

const PRINCIPLE_ICONS: LucideIcon[] = [Clock3, Smartphone, BookOpen, ShieldCheck];

const WEB_APP_ICONS: LucideIcon[] = [Smartphone, MonitorSmartphone, BellRing];

// ─── Helper ───────────────────────────────────────────────────────────────────

function SectionHeading({ eyebrow, title, text, align = "center" }: {
  eyebrow: string; title: string; text: string; align?: "center" | "left";
}) {
  const alignment = align === "center" ? "mx-auto text-center items-center" : "text-left items-start";
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

function IconBadge({ icon: Icon, colorClass }: { icon: LucideIcon; colorClass: string }) {
  return (
    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colorClass}`}>
      <Icon className="h-5 w-5" />
    </div>
  );
}

// ─── Exported sections ────────────────────────────────────────────────────────

const SOCIAL_SCENE_TEXTS = {
  en: [
    { title: "Two homes, same version of the schedule", text: "No more guessing. The schedule and sensitive changes stay in sync.", alt: "Parent and child in a calm outdoor moment" },
    { title: "One home, but without scattered mental lists", text: "Rituals, activities, documents and useful ideas stay together in a space that breathes.", alt: "Parent and child in a warm moment at home" },
    { title: "Important changes have memory", text: "What moved, who edited and when the other parent was notified are no longer ambiguous.", alt: "Child attentive in a play moment" },
  ],
  ro: [
    { title: "Două case, aceeași versiune a programului", text: "Programul și schimbările sensibile rămân sincronizate, fără versiuni divergente.", alt: "Părinte și copil într-un moment calm afară" },
    { title: "O casă, dar fără liste risipite prin cap", text: "Ritualurile, activitățile, documentele și ideile utile stau împreună, într-un spațiu care respiră.", alt: "Părinte și copil într-un moment cald acasă" },
    { title: "Schimbările importante au memorie", text: "Ce s-a mutat, cine a editat și când a fost notificat celălalt părinte nu mai rămân ambigue.", alt: "Copil atent într-un moment de joacă" },
  ],
};

export function LandingSocialProof() {
  const { t, lang } = useLanguage();
  return (
    <section className="py-10 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {SOCIAL_SCENE_META.map((meta, index) => {
            const sceneTexts = SOCIAL_SCENE_TEXTS[lang][index];

            return (
              <AnimateOnScroll key={index} delay={index * 90}>
                <div className={`h-full overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br ${meta.accent} p-4 shadow-[0_20px_45px_rgba(28,25,23,0.06)]`}>
                  <div className="overflow-hidden rounded-[1.6rem]">
                    <img src={meta.image} alt={sceneTexts.alt} className={`h-56 w-full object-cover transition-transform duration-700 hover:scale-[1.04] ${meta.position ?? "object-center"}`} loading="lazy" />
                  </div>
                  <div className="px-2 pb-2 pt-5">
                    <IconBadge icon={meta.icon} colorClass={meta.iconTone} />
                    <h3 className="mt-5 text-xl font-extrabold text-stone-900">{sceneTexts.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-stone-600">{sceneTexts.text}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function LandingProblemSolution() {
  const { t } = useLanguage();
  const p = t.problem;
  const beforeLabel = t.lang === "en" ? "before" : "înainte";
  const afterLabel  = t.lang === "en" ? "after"  : "după";

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
        <AnimateOnScroll className="lg:sticky lg:top-28">
          <SectionHeading eyebrow={p.eyebrow} title={p.title} text={p.text} align="left" />

          <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 shadow-[0_22px_56px_rgba(28,25,23,0.08)]">
            <div className="relative">
              <img src={STOCK_IMAGES.warmHome} alt={p.imgAlt} className="h-[18rem] w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,12,10,0.02)_0%,rgba(14,12,10,0.3)_100%)]" />
              <div className="absolute bottom-4 left-4 rounded-full bg-white/88 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-700 backdrop-blur">
                {p.imgCaption}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[2rem] bg-[#1f3a36] p-7 text-white shadow-[0_28px_70px_rgba(31,58,54,0.18)]">
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">{p.impactLabel}</p>
            <p className="landing-display mt-4 text-4xl leading-tight">{p.impactTitle}</p>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/78">{p.impactText}</p>
          </div>
        </AnimateOnScroll>

        <div className="grid gap-5">
          {p.transitions.map((item, index) => (
            <AnimateOnScroll key={index} delay={index * 100}>
              <div className="rounded-[2rem] border border-[#ead9c8] bg-white/85 p-6 shadow-[0_18px_40px_rgba(28,25,23,0.06)]">
                <div className="grid gap-4 md:grid-cols-[0.9fr_auto_1.1fr] md:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">{beforeLabel}</p>
                    <p className="mt-2 text-lg font-semibold leading-7 text-stone-800">{item.problem}</p>
                  </div>
                  <div className="hidden justify-center md:flex">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff1e5] text-[#b85c3e]">
                      <Repeat2 className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="rounded-[1.4rem] bg-[#f8f3ec] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">{afterLabel}</p>
                    <p className="mt-2 text-lg font-semibold leading-7 text-stone-900">{item.solution}</p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}

          <AnimateOnScroll delay={320}>
            <div className="grid gap-5 rounded-[2.2rem] border border-[#ead9c8] bg-[linear-gradient(135deg,#fff3e7_0%,#fffdf9_55%,#edf6f3_100%)] p-6 shadow-[0_22px_50px_rgba(28,25,23,0.06)] sm:grid-cols-[1.15fr_0.85fr] sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{p.resultLabel}</p>
                <p className="landing-display mt-4 text-3xl leading-tight text-stone-900">{p.microStoryResult}</p>
                <p className="mt-4 text-sm leading-7 text-stone-600">{p.microStoryText}</p>
              </div>
              <div className="rounded-[1.8rem] bg-white/80 p-5 shadow-[0_16px_32px_rgba(28,25,23,0.06)]">
                <div className="space-y-3">
                  {p.microChips.map((chip, i) => (
                    <div key={i} className={`rounded-[1rem] px-4 py-3 text-sm font-semibold ${
                      i === 0 ? "bg-[#fff4e8] text-[#8a4b2d]" : i === 1 ? "bg-[#edf6f3] text-[#1f5a4e]" : "bg-[#f8f1dc] text-[#7a5620]"
                    }`}>{chip}</div>
                  ))}
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}

export function LandingFeatures() {
  const { t } = useLanguage();
  const f = t.features;

  return (
    <section id="functionalitati" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <SectionHeading eyebrow={f.eyebrow} title={f.title} text={f.text} />
        </AnimateOnScroll>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {f.gallery.map((item, index) => (
            <AnimateOnScroll key={index} delay={index * 80}>
              <div className={`overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_20px_45px_rgba(28,25,23,0.06)] ${index === 0 ? "md:col-span-2" : ""}`}>
                <div className="relative">
                  <img src={index === 0 ? STOCK_IMAGES.warmHome : STOCK_IMAGES.childFocus} alt={item.alt} className="h-64 w-full object-cover" loading="lazy" />
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
          {f.cards.map((card, index) => {
            const meta = FEATURE_CARD_META[index];
            return (
              <AnimateOnScroll key={index} delay={index * 70}>
                <div className={`h-full rounded-[2rem] border border-white/70 ${meta.tone} p-6 shadow-[0_20px_45px_rgba(28,25,23,0.06)] ${meta.className}`}>
                  <IconBadge icon={meta.icon} colorClass={meta.iconTone} />
                  <h3 className="mt-5 text-2xl font-extrabold text-stone-900">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-stone-600">{card.text}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {card.bullets.map((bullet, bi) => (
                      <span key={bi} className="rounded-full border border-[#ead9c8] bg-white/75 px-3 py-1.5 text-xs font-semibold text-stone-600">
                        {bullet}
                      </span>
                    ))}
                  </div>
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>

        <AnimateOnScroll delay={180}>
          <div className="mt-8 rounded-[2.2rem] border border-[#ead9c8] bg-[linear-gradient(135deg,#fffdf9_0%,#edf6f3_100%)] p-6 shadow-[0_20px_45px_rgba(28,25,23,0.06)]">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{f.healthTitle}</p>
              <h3 className="mt-3 text-2xl font-extrabold text-stone-900 sm:text-3xl">{f.healthSubtitle}</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">{f.healthDesc}</p>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {f.healthHighlights.map((item, i) => (
                <div key={i} className={`rounded-[1.5rem] border border-white/70 ${HEALTH_TONES[i]} p-4`}>
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

export function LandingHowItWorks() {
  const { t } = useLanguage();
  const h = t.howItWorks;

  return (
    <section id="cum-functioneaza" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <SectionHeading eyebrow={h.eyebrow} title={h.title} text={h.text} />
        </AnimateOnScroll>

        <div className="relative mt-14 grid gap-5 lg:grid-cols-4">
          <div className="absolute left-8 right-8 top-9 hidden border-t border-dashed border-[#d8c2ad] lg:block" />
          {h.steps.map((step, index) => {
            const Icon = STEP_ICONS[index];
            return (
              <AnimateOnScroll key={index} delay={index * 90}>
                <div className="relative h-full rounded-[2rem] border border-[#ead9c8] bg-white/85 p-6 shadow-[0_18px_40px_rgba(28,25,23,0.06)]">
                  <div className="flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff3e7] text-[#b85c3e]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="landing-display text-4xl text-[#d4b39a]">{index + 1}</span>
                  </div>
                  <h3 className="mt-6 text-xl font-extrabold text-stone-900">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-stone-600">{step.text}</p>
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function LandingUseCases() {
  const { t } = useLanguage();
  const u = t.useCases;

  return (
    <section id="scenarii" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <SectionHeading eyebrow={u.eyebrow} title={u.title} text={u.text} />
        </AnimateOnScroll>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {u.items.map((item, index) => (
            <AnimateOnScroll key={index} delay={index * 80}>
              <div className={`h-full rounded-[2rem] border border-white/70 ${USE_CASE_TONES[index]} p-6 shadow-[0_18px_40px_rgba(28,25,23,0.05)]`}>
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

export function LandingWhyUs() {
  const { t } = useLanguage();
  const w = t.whyUs;

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <div className="overflow-hidden rounded-[2.6rem] bg-[#1f3a36] px-6 py-10 text-white shadow-[0_30px_80px_rgba(31,58,54,0.2)] sm:px-10">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/55">{w.eyebrow}</p>
                <h2 className="landing-display mt-4 text-4xl leading-tight sm:text-5xl">{w.title}</h2>
                <p className="mt-5 max-w-xl text-sm leading-8 text-white/75 sm:text-base">{w.text}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {w.principles.map((item, index) => {
                  const Icon = PRINCIPLE_ICONS[index];
                  return (
                    <AnimateOnScroll key={index} delay={index * 80}>
                      <div className="h-full rounded-[1.8rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#f8c89f]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="mt-4 text-lg font-extrabold text-white">{item.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-white/72">{item.text}</p>
                      </div>
                    </AnimateOnScroll>
                  );
                })}
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}

export function LandingWebApp() {
  const { t } = useLanguage();
  const w = t.webApp;

  return (
    <section id="web-app" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <SectionHeading eyebrow={w.eyebrow} title={w.title} text={w.text} />
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
                      <p className="text-xs uppercase tracking-[0.18em] text-white/60">{w.phoneLabel}</p>
                      <div className="mt-4 space-y-3">
                        {w.phoneItems.map((item, i) => (
                          <div key={i} className={`rounded-[1rem] px-3 py-3 text-sm ${i === 2 ? "bg-[#f8c89f] text-[#1f3a36]" : "bg-white/10"}`}>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1.8rem] bg-[#fff8f1] p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                      {t.lang === "en" ? "what matters here" : "ce contează aici"}
                    </p>
                    <p className="landing-display mt-4 text-3xl leading-tight text-stone-900">{w.cardTitle}</p>
                    <p className="mt-4 text-sm leading-7 text-stone-600">{w.cardText}</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          <div className="grid gap-5">
            {w.columns.map((item, index) => {
              const Icon = WEB_APP_ICONS[index];
              return (
                <AnimateOnScroll key={index} delay={index * 90}>
                  <div className="rounded-[2rem] border border-[#ead9c8] bg-white/85 p-6 shadow-[0_18px_40px_rgba(28,25,23,0.06)]">
                    <IconBadge icon={Icon} colorClass="bg-[#eef5f3] text-[#1f5a4e]" />
                    <h3 className="mt-4 text-xl font-extrabold text-stone-900">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-stone-600">{item.text}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {item.steps.map((step, si) => (
                        <span key={si} className="rounded-full bg-[#f7f0e7] px-3 py-1.5 text-xs font-semibold text-stone-600">
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingSecurity() {
  const { t } = useLanguage();
  const s = t.security;

  return (
    <section id="siguranta" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateOnScroll>
          <div className="grid gap-6 rounded-[2.6rem] border border-[#ead9c8] bg-[linear-gradient(135deg,#fffaf4_0%,#f7f1e9_100%)] p-6 shadow-[0_22px_50px_rgba(28,25,23,0.06)] lg:grid-cols-[0.85fr_1.15fr] lg:items-center sm:p-8">
            <div className="rounded-[2rem] bg-[#1f3a36] p-7 text-white">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#f8c89f]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="landing-display mt-5 text-4xl leading-tight">{s.title}</p>
              <p className="mt-4 text-sm leading-7 text-white/78">{s.text}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {s.points.map((point, index) => (
                <AnimateOnScroll key={index} delay={index * 70}>
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
