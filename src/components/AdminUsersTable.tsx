"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Download, KeyRound, BellRing, UserMinus, Trash2, Copy } from "lucide-react";
import type { PlanType } from "@/types/plan";
import type { AdminUserRow } from "@/lib/admin-data";
import {
  ActivityBadge,
  Badge,
  PlanBadge,
  SubscriptionBadge,
  buttonClass,
  dangerButtonClass,
  fmtDate,
  inputClass,
  SortHeader,
  daysSince,
} from "@/components/admin/ui";

type SortKey = "email" | "createdAt" | "lastActiveAt";
type ActivityFilter = "all" | "active7" | "inactive30" | "never" | "noFamily";

function csvCell(v: unknown): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportCsv(users: AdminUserRow[]) {
  const headers = ["Email", "Nume", "Rol", "Familie", "Familie ID", "Plan", "Abonament", "Dispozitive push", "Ultima activitate", "Înregistrat"];
  const rows = users.map((u) => [
    u.email,
    u.name,
    u.parentType ?? "",
    u.familyName ?? "",
    u.familyId ?? "",
    u.plan,
    u.subscriptionStatus ?? "",
    u.pushDevices,
    u.lastActiveAt ?? "",
    u.createdAt ?? "",
  ]);
  const csv = [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `utilizatori-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminUsersTable({ users: initialUsers, initialQuery = "" }: { users: AdminUserRow[]; initialQuery?: string }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState(initialQuery);
  const [filterPlan, setFilterPlan] = useState<"all" | PlanType>("all");
  const [filterActivity, setFilterActivity] = useState<ActivityFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  // Deschide direct rândul când venim cu ?q=<email exact> (ex. din „Necesită atenție”).
  const [expandedId, setExpandedId] = useState<string | null>(
    () => initialUsers.find((u) => initialQuery && u.email === initialQuery)?.id ?? null
  );

  const filtered = useMemo(() => {
    let list = users;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.name.toLowerCase().includes(q) ||
          (u.familyName ?? "").toLowerCase().includes(q) ||
          (u.familyId ?? "").toLowerCase().includes(q) ||
          u.id.includes(q)
      );
    }
    if (filterPlan !== "all") list = list.filter((u) => u.plan === filterPlan);
    if (filterActivity === "active7") list = list.filter((u) => u.lastActiveAt && daysSince(u.lastActiveAt) < 7);
    if (filterActivity === "inactive30") list = list.filter((u) => !u.lastActiveAt || daysSince(u.lastActiveAt) > 30);
    if (filterActivity === "never") list = list.filter((u) => !u.lastActiveAt);
    if (filterActivity === "noFamily") list = list.filter((u) => !u.familyId);
    return [...list].sort((a, b) => {
      const va = a[sortKey] ?? "";
      const vb = b[sortKey] ?? "";
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, search, filterPlan, filterActivity, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "email" ? "asc" : "desc");
    }
  }


  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-100 px-4 py-3 dark:border-stone-800">
        <input
          type="search"
          placeholder="Caută email, nume, familie, ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClass} w-full sm:w-72`}
        />
        <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value as "all" | PlanType)} className={inputClass}>
          <option value="all">Toate planurile</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="family">Family+</option>
        </select>
        <select value={filterActivity} onChange={(e) => setFilterActivity(e.target.value as ActivityFilter)} className={inputClass}>
          <option value="all">Orice activitate</option>
          <option value="active7">Activi în 7 zile</option>
          <option value="inactive30">Inactivi 30+ zile</option>
          <option value="never">Niciodată activi</option>
          <option value="noFamily">Fără familie</option>
        </select>
        <span className="text-xs text-stone-500">
          {filtered.length}/{users.length}
        </span>
        <button type="button" onClick={() => exportCsv(filtered)} className={`${buttonClass} ml-auto`}>
          <Download className="h-3.5 w-3.5" /> CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-xs text-stone-600 dark:bg-stone-800/50 dark:text-stone-300">
            <tr>
              <th className="w-8" />
              <SortHeader col="email" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}>Utilizator</SortHeader>
              <th className="px-3 py-2.5 text-left font-medium">Familie</th>
              <th className="px-3 py-2.5 text-left font-medium">Plan</th>
              <SortHeader col="lastActiveAt" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}>Activitate</SortHeader>
              <th className="px-3 py-2.5 text-left font-medium">Push</th>
              <SortHeader col="createdAt" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}>Înregistrat</SortHeader>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-stone-400">
                  Niciun utilizator găsit
                </td>
              </tr>
            )}
            {filtered.map((u) => (
              <Fragment key={u.id}>
                <tr
                  className="cursor-pointer border-t border-stone-100 hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800/40"
                  onClick={() => setExpandedId((cur) => (cur === u.id ? null : u.id))}
                >
                  <td className="px-2 text-center text-stone-400">
                    <ChevronRight className={`inline h-4 w-4 transition-transform ${expandedId === u.id ? "rotate-90" : ""}`} />
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="font-medium">{u.email}</p>
                    <p className="text-xs text-stone-500">
                      {u.name || "fără nume"}
                      {u.parentType && ` · ${u.parentType}`}
                    </p>
                  </td>
                  <td className="px-3 py-2.5">
                    {u.familyId ? (
                      <Link href={`/admin/families/${u.familyId}`} onClick={(e) => e.stopPropagation()} className="text-amber-700 hover:underline dark:text-amber-400">
                        {u.familyName}
                      </Link>
                    ) : (
                      <Badge tone="warn">fără familie</Badge>
                    )}
                    {u.familyActive === false && <Badge tone="bad">dezactivată</Badge>}
                  </td>
                  <td className="px-3 py-2.5">
                    <PlanBadge plan={u.plan} /> <SubscriptionBadge status={u.subscriptionStatus} />
                  </td>
                  <td className="px-3 py-2.5">
                    <ActivityBadge lastActiveAt={u.lastActiveAt} />
                  </td>
                  <td className="px-3 py-2.5 text-xs text-stone-500">{u.pushDevices > 0 ? `${u.pushDevices} disp.` : "—"}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-stone-500">{fmtDate(u.createdAt)}</td>
                </tr>
                {expandedId === u.id && (
                  <tr className="border-t border-stone-100 bg-stone-50/70 dark:border-stone-800 dark:bg-stone-800/30">
                    <td colSpan={7} className="px-4 py-4">
                      <UserActions
                        user={u}
                        onChange={(patch) => setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, ...patch } : x)))}
                        onDeleted={() => {
                          setUsers((prev) => prev.filter((x) => x.id !== u.id));
                          setExpandedId(null);
                        }}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserActions({
  user,
  onChange,
  onDeleted,
}: {
  user: AdminUserRow;
  onChange: (patch: Partial<AdminUserRow>) => void;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  async function call(action: string, init: RequestInit): Promise<Record<string, unknown> | null> {
    setBusy(action);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { headers: { "Content-Type": "application/json" }, ...init });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        setMessage({ tone: "err", text: String(data.error ?? "Eroare.") });
        return null;
      }
      return data;
    } finally {
      setBusy(null);
    }
  }

  async function resetPassword() {
    const data = await call("reset", { method: "POST", body: JSON.stringify({ action: "reset-password" }) });
    if (!data) return;
    setResetUrl(String(data.resetUrl));
    setMessage({ tone: "ok", text: data.emailSent ? "Email de resetare trimis. Linkul e valabil 24h." : "Emailul NU a plecat (Resend neconfigurat?). Trimite manual linkul de mai jos." });
  }

  async function testPush() {
    const data = await call("push", { method: "POST", body: JSON.stringify({ action: "test-push" }) });
    if (data) setMessage({ tone: "ok", text: `Notificare trimisă pe ${data.devices} dispozitiv(e).` });
  }

  async function removeFromFamily() {
    if (!confirm(`Scoți ${user.email} din familia „${user.familyName}”? Datele familiei rămân.`)) return;
    const data = await call("remove", { method: "POST", body: JSON.stringify({ action: "remove-from-family" }) });
    if (!data) return;
    onChange({ familyId: null, familyName: null, familyActive: null, plan: "free", subscriptionStatus: null });
    setMessage({ tone: "ok", text: data.familyDeactivated ? "Scos din familie. Familia a rămas fără membri și a fost dezactivată." : "Scos din familie." });
    router.refresh();
  }

  async function deleteUser() {
    const data = await call("delete", { method: "DELETE", body: JSON.stringify({ confirmEmail: confirmDelete }) });
    if (data) {
      onDeleted();
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-x-6 gap-y-1 text-xs text-stone-600 dark:text-stone-400 sm:grid-cols-3">
        <p>
          ID: <span className="font-mono">{user.id}</span>
        </p>
        <p>Ultima activitate: {fmtDate(user.lastActiveAt, "d MMM yyyy, HH:mm")}</p>
        <p>
          Stripe:{" "}
          {user.stripeCustomerId ? (
            <a href={`https://dashboard.stripe.com/customers/${user.stripeCustomerId}`} target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline dark:text-amber-400">
              client →
            </a>
          ) : (
            "—"
          )}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={resetPassword} disabled={busy !== null} className={buttonClass}>
          <KeyRound className="h-3.5 w-3.5" /> {busy === "reset" ? "Se generează…" : "Resetare parolă"}
        </button>
        <button type="button" onClick={testPush} disabled={busy !== null || user.pushDevices === 0} className={buttonClass} title={user.pushDevices === 0 ? "Fără dispozitive abonate" : undefined}>
          <BellRing className="h-3.5 w-3.5" /> {busy === "push" ? "Se trimite…" : "Push de test"}
        </button>
        {user.familyId && (
          <button type="button" onClick={removeFromFamily} disabled={busy !== null} className={buttonClass}>
            <UserMinus className="h-3.5 w-3.5" /> Scoate din familie
          </button>
        )}
        <button type="button" onClick={() => setShowDelete((v) => !v)} disabled={busy !== null} className={dangerButtonClass}>
          <Trash2 className="h-3.5 w-3.5" /> Șterge contul
        </button>
      </div>

      {message && <p className={`text-sm ${message.tone === "ok" ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{message.text}</p>}

      {resetUrl && (
        <div className="flex items-center gap-2">
          <input readOnly value={resetUrl} className={`${inputClass} w-full font-mono text-xs`} onFocus={(e) => e.currentTarget.select()} />
          <button type="button" className={buttonClass} onClick={() => navigator.clipboard?.writeText(resetUrl)}>
            <Copy className="h-3.5 w-3.5" /> Copiază
          </button>
        </div>
      )}

      {showDelete && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/40">
          <p className="mb-2 text-sm text-red-800 dark:text-red-300">
            Ștergerea este definitivă: contul, sesiunile push și tokenurile de resetare dispar. Datele familiei rămân; dacă familia rămâne fără membri, va fi dezactivată. Scrie emailul pentru confirmare.
          </p>
          <div className="flex flex-wrap gap-2">
            <input value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} placeholder={user.email} className={`${inputClass} flex-1`} />
            <button
              type="button"
              onClick={deleteUser}
              disabled={busy !== null || confirmDelete.trim().toLowerCase() !== user.email.toLowerCase()}
              className={dangerButtonClass}
            >
              {busy === "delete" ? "Se șterge…" : "Șterge definitiv"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
