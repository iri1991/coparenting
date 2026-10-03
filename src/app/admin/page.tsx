import { requireAdminPage } from "@/lib/admin";
import Link from "next/link";
import { getAdminOverview, getAdminAuditLog } from "@/lib/admin-data";
import { Card, StatCard, Badge, fmtDate, fmtRelative, pct } from "@/components/admin/ui";
import { PLAN_NAMES } from "@/types/plan";

export default async function AdminOverviewPage() {
  await requireAdminPage();
  const [o, audit] = await Promise.all([getAdminOverview(), getAdminAuditLog(6)]);
  const t = o.totals;
  const maxWeekly = Math.max(1, ...o.weeklySignups.map((w) => w.users));
  const funnelTop = Math.max(1, o.funnel[0]?.value ?? 1);
  const attentionCount =
    o.attention.usersWithoutFamily.length +
    o.attention.familiesUnconfigured.length +
    o.attention.familiesSingleParent.length +
    o.attention.paymentIssues.length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Prezentare generală</h1>
        <p className="text-sm text-stone-500">Starea produsului, activarea utilizatorilor și ce are nevoie de atenție.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Utilizatori" value={t.users} hint={`+${t.usersNew30} în 30 zile`} />
        <StatCard label="Activi 7 zile" value={t.usersActive7} hint={`${pct(t.usersActive7, t.users)} din total · ${t.usersActive30} în 30 zile`} tone="good" />
        <StatCard label="Familii active" value={t.familiesActive} hint={`din ${t.families} · +${t.familiesNew30} în 30 zile`} />
        <StatCard label="Familii plătitoare" value={t.paidFamilies} hint={`${pct(t.paidFamilies, t.families)} conversie`} tone="good" />
        <StatCard label="Probleme plată" value={t.paymentIssues} hint="past_due / unpaid" tone={t.paymentIssues > 0 ? "warn" : "default"} />
        <StatCard label="Invitații în așteptare" value={t.pendingInvitations} hint="neexpirate" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Înscrieri pe săptămână" subtitle="Ultimele 12 săptămâni · conturi noi (bară) și familii noi" className="lg:col-span-2">
          <div className="flex h-40 items-end gap-1.5">
            {o.weeklySignups.map((w) => (
              <div key={w.weekStart} className="group flex h-full flex-1 flex-col items-center justify-end gap-1" title={`Săpt. ${fmtDate(w.weekStart, "d MMM")}: ${w.users} conturi, ${w.families} familii`}>
                <span className="text-[10px] tabular-nums text-stone-500">{w.users || ""}</span>
                <div className="relative w-full rounded-t-md bg-amber-500/80 dark:bg-amber-500/70" style={{ height: `${(w.users / maxWeekly) * 100}%`, minHeight: w.users ? 4 : 1 }}>
                  {w.families > 0 && (
                    <div className="absolute inset-x-0 bottom-0 rounded-t-md bg-emerald-600/80" style={{ height: `${Math.min(100, (w.families / Math.max(1, w.users)) * 100)}%` }} />
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-1 flex gap-1.5">
            {o.weeklySignups.map((w) => (
              <span key={w.weekStart} className="flex-1 truncate text-center text-[9px] text-stone-400">{fmtDate(w.weekStart, "d.MM")}</span>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-stone-500">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-500/80" />Conturi</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-600/80" />Familii</span>
          </div>
        </Card>

        <Card title="Planuri" subtitle={`${t.families} familii`}>
          <div className="space-y-3">
            {(["free", "pro", "family"] as const).map((p) => (
              <div key={p}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{PLAN_NAMES[p]}</span>
                  <span className="tabular-nums text-stone-500">{o.plans[p]} · {pct(o.plans[p], t.families)}</span>
                </div>
                <div className="h-2 rounded-full bg-stone-100 dark:bg-stone-800">
                  <div
                    className={`h-2 rounded-full ${p === "free" ? "bg-stone-400" : p === "pro" ? "bg-amber-500" : "bg-emerald-600"}`}
                    style={{ width: pct(o.plans[p], t.families) }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-stone-500">Evenimente</p>
              <p className="font-semibold tabular-nums">{t.events}</p>
              <p className="text-xs text-stone-400">+{t.eventsNew7} în 7 zile</p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Mesaje chat</p>
              <p className="font-semibold tabular-nums">{t.messages}</p>
              <p className="text-xs text-stone-400">+{t.messagesNew7} în 7 zile</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Pâlnie de activare" subtitle="De la cont creat la familie activă">
          <ol className="space-y-2.5">
            {o.funnel.map((step, i) => (
              <li key={step.label}>
                <div className="mb-1 flex justify-between gap-2 text-sm">
                  <span>
                    <span className="mr-1.5 text-stone-400">{i + 1}.</span>
                    {step.label}
                    {step.hint && <span className="ml-1 text-xs text-stone-400">({step.hint})</span>}
                  </span>
                  <span className="tabular-nums font-medium">{step.value}</span>
                </div>
                <div className="h-2 rounded-full bg-stone-100 dark:bg-stone-800">
                  <div className="h-2 rounded-full bg-amber-500" style={{ width: `${Math.min(100, (step.value / funnelTop) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-stone-400">Pașii 3–6 sunt numărați pe familii; primii doi pe utilizatori.</p>
        </Card>

        <Card title="Utilizare funcționalități" subtitle="Câte familii au folosit fiecare funcționalitate cel puțin o dată">
          <ul className="space-y-2">
            {o.features.map((f) => (
              <li key={f.label} className="text-sm">
                <div className="mb-0.5 flex justify-between gap-2">
                  <span>{f.label}</span>
                  <span className="tabular-nums text-stone-500">
                    {f.families} fam. · {f.items} înreg.
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-stone-100 dark:bg-stone-800">
                  <div className="h-1.5 rounded-full bg-sky-500" style={{ width: pct(f.families, t.families) }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title={<>Necesită atenție {attentionCount > 0 && <Badge tone="warn">{attentionCount}</Badge>}</>} subtitle="Utilizatori blocați în onboarding, familii incomplete și plăți eșuate">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <AttentionList
            title="Fără familie (> 2 zile)"
            empty="Toți utilizatorii au familie."
            items={o.attention.usersWithoutFamily.map((u) => ({
              key: u.id,
              href: `/admin/users?q=${encodeURIComponent(u.email)}`,
              label: u.email,
              meta: `cont creat ${fmtRelative(u.createdAt)}`,
            }))}
          />
          <AttentionList
            title="Familii neconfigurate"
            empty="Toate familiile au copil și locație."
            items={o.attention.familiesUnconfigured.map((f) => ({
              key: f.id,
              href: `/admin/families/${f.id}`,
              label: f.name,
              meta: `creată ${fmtRelative(f.createdAt)}`,
            }))}
          />
          <AttentionList
            title="Un singur părinte"
            empty="Nicio familie cu un singur părinte."
            items={o.attention.familiesSingleParent.map((f) => ({
              key: f.id,
              href: `/admin/families/${f.id}`,
              label: f.name,
              meta: f.hasPendingInvite ? "invitație trimisă" : "fără invitație activă",
            }))}
          />
          <AttentionList
            title="Probleme de plată"
            empty="Nicio plată eșuată."
            items={o.attention.paymentIssues.map((f) => ({
              key: f.id,
              href: `/admin/families/${f.id}`,
              label: f.name,
              meta: f.status,
            }))}
          />
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Înscrieri recente" actions={<Link href="/admin/users" className="text-xs text-amber-700 hover:underline dark:text-amber-400">Toți →</Link>} className="lg:col-span-2">
          <ul className="divide-y divide-stone-100 dark:divide-stone-800">
            {o.recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{u.email}</p>
                  <p className="truncate text-xs text-stone-500">{u.name || "fără nume"} · {fmtRelative(u.createdAt)}</p>
                </div>
                {u.familyId ? (
                  <Link href={`/admin/families/${u.familyId}`} className="shrink-0 text-xs text-amber-700 hover:underline dark:text-amber-400">Familie →</Link>
                ) : (
                  <Badge tone="warn">fără familie</Badge>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-5">
          <Card title="Sistem">
            <ul className="space-y-2 text-sm">
              {o.system.map((s) => (
                <li key={s.label} className="flex items-center justify-between gap-2">
                  <span>
                    {s.label}
                    {s.detail && <span className="block text-xs text-stone-400">{s.detail}</span>}
                  </span>
                  <Badge tone={s.ok ? "good" : "bad"}>{s.ok ? "configurat" : "lipsă"}</Badge>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Acțiuni admin recente" actions={<Link href="/admin/tools#audit" className="text-xs text-amber-700 hover:underline dark:text-amber-400">Jurnal →</Link>}>
            {audit.length === 0 ? (
              <p className="text-sm text-stone-400">Nicio acțiune încă.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {audit.map((a) => (
                  <li key={a.id}>
                    <p className="font-medium">{a.action}</p>
                    <p className="text-xs text-stone-500">{fmtRelative(a.createdAt)} · {a.adminEmail}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function AttentionList({ title, empty, items }: { title: string; empty: string; items: { key: string; href: string; label: string; meta: string }[] }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-stone-400">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((it) => (
            <li key={it.key}>
              <Link href={it.href} className="block rounded-lg px-2 py-1.5 hover:bg-stone-50 dark:hover:bg-stone-800">
                <p className="truncate text-sm font-medium">{it.label}</p>
                <p className="truncate text-xs text-stone-500">{it.meta}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
