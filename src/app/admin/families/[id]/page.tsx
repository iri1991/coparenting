import { requireAdminPage } from "@/lib/admin";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getAdminFamilyDetail } from "@/lib/admin-data";
import { ActivityBadge, Badge, Card, PlanBadge, SubscriptionBadge, fmtDate, fmtRelative } from "@/components/admin/ui";
import {
  AdminNotes,
  FamilyPlanControls,
  InvitationActions,
  InvitationStatusBadge,
  NotifyFamilyForm,
  RemoveMemberButton,
} from "@/components/admin/AdminFamilyActions";

export default async function AdminFamilyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const f = await getAdminFamilyDetail(id);
  if (!f) notFound();

  const devices = f.members.reduce((sum, m) => sum + m.pushDevices, 0);
  const totalUsage = f.usage.reduce((sum, u) => sum + u.count, 0);

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/families" className="mb-2 inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200">
          <ArrowLeft className="h-3.5 w-3.5" /> Familii
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">{f.name}</h1>
          <PlanBadge plan={f.plan} />
          {!f.active && <Badge tone="bad">dezactivată</Badge>}
        </div>
        <p className="mt-1 text-xs text-stone-500">
          <span className="font-mono">{f.id}</span> · creată {fmtDate(f.createdAt)} ({fmtRelative(f.createdAt)})
          {f.householdMode && ` · mod: ${f.householdMode}`}
          {f.activityCity && ` · oraș: ${f.activityCity}`}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card title="Plan și abonament">
            <FamilyPlanControls familyId={f.id} plan={f.plan} active={f.active} hasStripeSubscription={Boolean(f.stripe.subscriptionId)} />
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-xs text-stone-500">Status Stripe</dt>
                <dd>
                  <SubscriptionBadge status={f.stripe.status} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-stone-500">Perioadă până la</dt>
                <dd>{fmtDate(f.stripe.currentPeriodEnd)}</dd>
              </div>
              <div>
                <dt className="text-xs text-stone-500">Client</dt>
                <dd>
                  {f.stripe.customerId ? (
                    <a
                      href={`https://dashboard.stripe.com/customers/${f.stripe.customerId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-amber-700 hover:underline dark:text-amber-400"
                    >
                      Stripe <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-stone-500">Abonament</dt>
                <dd>
                  {f.stripe.subscriptionId ? (
                    <a
                      href={`https://dashboard.stripe.com/subscriptions/${f.stripe.subscriptionId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-amber-700 hover:underline dark:text-amber-400"
                    >
                      Stripe <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
            </dl>
          </Card>

          <Card title={`Membri (${f.members.length})`} subtitle={f.parent1Name || f.parent2Name ? `Părinte 1: ${f.parent1Name ?? "—"} · Părinte 2: ${f.parent2Name ?? "—"}` : undefined}>
            {f.members.length === 0 && f.orphanMemberIds.length === 0 ? (
              <p className="text-sm text-stone-400">Niciun membru.</p>
            ) : (
              <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                {f.members.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <div className="min-w-0">
                      <Link href={`/admin/users?q=${encodeURIComponent(m.email)}`} className="font-medium hover:underline">
                        {m.email}
                      </Link>
                      <p className="text-xs text-stone-500">
                        {m.name || "fără nume"}
                        {m.parentType && ` · ${m.parentType}`}
                        {m.id === f.createdByUserId && " · a creat familia"} · înregistrat {fmtDate(m.createdAt)} · {m.pushDevices} disp. push
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ActivityBadge lastActiveAt={m.lastActiveAt} />
                      <RemoveMemberButton familyId={f.id} userId={m.id} label={m.email} />
                    </div>
                  </li>
                ))}
                {f.orphanMemberIds.map((oid) => (
                  <li key={oid} className="flex items-center justify-between gap-2 py-2.5">
                    <div>
                      <p className="font-mono text-xs">{oid}</p>
                      <p className="text-xs text-red-600">ID în memberIds fără cont existent</p>
                    </div>
                    <RemoveMemberButton familyId={f.id} userId={oid} label={oid} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title={`Invitații (${f.invitations.length})`}>
            {f.invitations.length === 0 ? (
              <p className="text-sm text-stone-400">Nicio invitație trimisă.</p>
            ) : (
              <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                {f.invitations.map((inv) => (
                  <li key={inv.id} className="flex flex-wrap items-start justify-between gap-2 py-2.5">
                    <div className="min-w-0">
                      <p className="font-medium">{inv.email}</p>
                      <p className="text-xs text-stone-500">
                        trimisă {fmtDate(inv.createdAt)}
                        {inv.lastReminderSentAt && ` · ultimul reminder ${fmtRelative(inv.lastReminderSentAt)}`}
                      </p>
                      <div className="mt-1">
                        <InvitationStatusBadge status={inv.status} expiresAt={inv.expiresAt} />
                      </div>
                    </div>
                    <InvitationActions invitationId={inv.id} status={inv.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Utilizare" subtitle={`${totalUsage} înregistrări · ultimul eveniment adăugat ${fmtRelative(f.lastEventCreatedAt)} · ultimul mesaj ${fmtRelative(f.lastMessageAt)}`}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {f.usage.map((u) => (
                <div key={u.label} className={`rounded-xl px-3 py-2 ${u.count > 0 ? "bg-stone-50 dark:bg-stone-800/60" : "bg-stone-50/40 opacity-60 dark:bg-stone-800/20"}`}>
                  <p className="truncate text-xs text-stone-500">{u.label}</p>
                  <p className="text-lg font-semibold tabular-nums">{u.count}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Ultimele evenimente din calendar" subtitle="După data evenimentului">
            {f.recentEvents.length === 0 ? (
              <p className="text-sm text-stone-400">Niciun eveniment.</p>
            ) : (
              <ul className="divide-y divide-stone-100 text-sm dark:divide-stone-800">
                {f.recentEvents.map((e) => (
                  <li key={e.id} className="flex justify-between gap-2 py-1.5">
                    <span>
                      <span className="font-medium tabular-nums">{fmtDate(e.date, "EEE d MMM yyyy")}</span>
                      {e.title && <span className="text-stone-500"> · {e.title}</span>}
                    </span>
                    <span className="text-xs text-stone-500">{e.parent ?? "—"}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Note interne" subtitle="Vizibile doar adminilor">
            <AdminNotes familyId={f.id} initialNotes={f.notes} />
          </Card>

          <Card title="Trimite notificare" subtitle="Push către toți membrii familiei">
            <NotifyFamilyForm familyId={f.id} devices={devices} />
          </Card>

          <Card title="Copii și locații">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500">Copii</p>
            {f.children.length === 0 ? (
              <p className="mb-3 text-sm text-amber-600">Niciun copil adăugat</p>
            ) : (
              <ul className="mb-3 space-y-1 text-sm">
                {f.children.map((c) => (
                  <li key={c.id}>
                    {c.name}
                    {c.birthDate && <span className="text-xs text-stone-500"> · {fmtDate(c.birthDate)}</span>}
                  </li>
                ))}
              </ul>
            )}
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500">Locații</p>
            {f.residences.length === 0 ? (
              <p className="text-sm text-amber-600">Nicio locație adăugată</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {f.residences.map((r) => (
                  <li key={r.id}>{r.name}</li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Istoric admin">
            {f.audit.length === 0 ? (
              <p className="text-sm text-stone-400">Nicio acțiune pe această familie.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {f.audit.map((a) => (
                  <li key={a.id}>
                    <p className="font-medium">{a.action}</p>
                    <p className="text-xs text-stone-500">
                      {fmtDate(a.createdAt, "d MMM yyyy, HH:mm")} · {a.adminEmail}
                    </p>
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
