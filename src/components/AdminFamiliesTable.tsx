"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { PLAN_NAMES } from "@/types/plan";
import type { PlanType } from "@/types/plan";

interface FamilyRow {
  id: string;
  plan: PlanType;
  active: boolean;
  memberCount: number;
  childrenCount: number;
  residencesCount: number;
  createdAt: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
}

interface FamilyDetails {
  members: { id: string; name: string; email: string; createdAt: string | null }[];
  children: { id: string; name: string; birthDate: string | null }[];
  eventsCount: number;
}

type SortKey = "createdAt" | "memberCount" | "childrenCount" | "plan" | "active";
type SortDir = "asc" | "desc";

function exportCsv(families: FamilyRow[]) {
  const headers = ["ID", "Plan", "Activ", "Membri", "Copii", "Locații", "Abonament", "Stripe", "Creat"];
  const rows = families.map((f) => [
    f.id,
    f.plan,
    f.active ? "da" : "nu",
    f.memberCount,
    f.childrenCount,
    f.residencesCount,
    f.subscriptionStatus ?? "",
    f.stripeCustomerId ?? "",
    f.createdAt,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `familii-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminFamiliesTable({ families: initialFamilies }: { families: FamilyRow[] }) {
  const router = useRouter();
  const [families, setFamilies] = useState(initialFamilies);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<"all" | PlanType>("all");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailsCache, setDetailsCache] = useState<Record<string, FamilyDetails>>({});
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = families;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((f) => f.id.toLowerCase().includes(q) || (f.stripeCustomerId ?? "").toLowerCase().includes(q));
    }
    if (filterPlan !== "all") list = list.filter((f) => f.plan === filterPlan);
    if (filterActive === "active") list = list.filter((f) => f.active);
    if (filterActive === "inactive") list = list.filter((f) => !f.active);
    return [...list].sort((a, b) => {
      let va: string | number = a[sortKey] as string | number;
      let vb: string | number = b[sortKey] as string | number;
      if (sortKey === "active") { va = a.active ? 1 : 0; vb = b.active ? 1 : 0; }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [families, search, filterPlan, filterActive, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-stone-400 ml-1">↕</span>;
    return <span className="text-amber-500 ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  async function toggleDetails(id: string) {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (detailsCache[id]) return;
    setLoadingDetails(id);
    try {
      const res = await fetch(`/api/admin/families/${id}/members`);
      const data = await res.json();
      setDetailsCache((prev) => ({ ...prev, [id]: data }));
    } finally {
      setLoadingDetails(null);
    }
  }

  async function handlePlanChange(familyId: string, plan: PlanType) {
    const family = families.find((f) => f.id === familyId);
    if (!family) return;
    setUpdatingId(familyId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/families/${familyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, active: family.active }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Eroare la actualizare."); return; }
      setFamilies((prev) => prev.map((f) => (f.id === familyId ? { ...f, plan } : f)));
      router.refresh();
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleActiveToggle(familyId: string, active: boolean) {
    const family = families.find((f) => f.id === familyId);
    if (!family) return;
    setUpdatingId(familyId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/families/${familyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: family.plan, active }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Eroare la actualizare."); return; }
      setFamilies((prev) => prev.map((f) => (f.id === familyId ? { ...f, active } : f)));
      router.refresh();
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-700">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="font-semibold text-stone-800 dark:text-stone-100">Familii <span className="text-stone-400 font-normal text-sm">({filtered.length}/{families.length})</span></h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm">Schimbă planul, statusul; click pe rând pentru detalii.</p>
          </div>
          <button
            type="button"
            onClick={() => exportCsv(filtered)}
            className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
          >
            Export CSV
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Caută ID sau Stripe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs px-3 py-1.5 w-52"
          />
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value as "all" | PlanType)}
            className="rounded-lg border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs px-2 py-1.5"
          >
            <option value="all">Toate planurile</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="family">Family+</option>
          </select>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as "all" | "active" | "inactive")}
            className="rounded-lg border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs px-2 py-1.5"
          >
            <option value="all">Toate statusurile</option>
            <option value="active">Active</option>
            <option value="inactive">Dezactivate</option>
          </select>
        </div>
        {error && <p className="text-red-600 dark:text-red-400 text-sm mt-2">{error}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300 w-8"></th>
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Familie</th>
              <th
                className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300 cursor-pointer select-none hover:text-stone-900 dark:hover:text-stone-100"
                onClick={() => toggleSort("active")}
              >
                Status <SortIcon col="active" />
              </th>
              <th
                className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300 cursor-pointer select-none hover:text-stone-900 dark:hover:text-stone-100"
                onClick={() => toggleSort("plan")}
              >
                Plan <SortIcon col="plan" />
              </th>
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Abonament</th>
              <th
                className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300 cursor-pointer select-none hover:text-stone-900 dark:hover:text-stone-100"
                onClick={() => toggleSort("memberCount")}
              >
                Membri <SortIcon col="memberCount" />
              </th>
              <th
                className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300 cursor-pointer select-none hover:text-stone-900 dark:hover:text-stone-100"
                onClick={() => toggleSort("childrenCount")}
              >
                Copii <SortIcon col="childrenCount" />
              </th>
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Locații</th>
              <th
                className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300 cursor-pointer select-none hover:text-stone-900 dark:hover:text-stone-100"
                onClick={() => toggleSort("createdAt")}
              >
                Creat <SortIcon col="createdAt" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-stone-400 dark:text-stone-600">Nicio familie găsită</td>
              </tr>
            )}
            {filtered.map((f) => (
              <>
                <tr key={f.id} className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/30">
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggleDetails(f.id)}
                      className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-transform duration-150"
                      style={{ display: "inline-block", transform: expandedId === f.id ? "rotate(90deg)" : "rotate(0deg)" }}
                      title="Detalii familie"
                    >
                      ▶
                    </button>
                  </td>
                  <td className="px-4 py-3 text-stone-900 dark:text-stone-100 font-mono text-xs">{f.id.slice(-8)}</td>
                  <td className="px-4 py-3">
                    <span className={f.active ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                      {f.active ? "Activă" : "Dezactivată"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleActiveToggle(f.id, !f.active)}
                      disabled={updatingId === f.id}
                      className="ml-2 text-xs px-2 py-1 rounded border border-stone-200 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-50"
                    >
                      {f.active ? "Dezactivează" : "Reactivează"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={f.plan}
                      onChange={(e) => handlePlanChange(f.id, e.target.value as PlanType)}
                      disabled={updatingId === f.id}
                      className="rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs px-2 py-1.5 disabled:opacity-50"
                    >
                      <option value="free">{PLAN_NAMES.free}</option>
                      <option value="pro">{PLAN_NAMES.pro}</option>
                      <option value="family">{PLAN_NAMES.family}</option>
                    </select>
                    {updatingId === f.id && <span className="ml-1 text-stone-400 text-xs">Se salvează…</span>}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-400 text-xs">
                    {f.subscriptionStatus ? (
                      <span title={f.stripeSubscriptionId ?? undefined}>
                        {f.subscriptionStatus}
                        {f.currentPeriodEnd && (
                          <span className="block text-stone-500">până {format(new Date(f.currentPeriodEnd), "d MMM yyyy", { locale: ro })}</span>
                        )}
                        {f.stripeCustomerId && (
                          <a
                            href={`https://dashboard.stripe.com/customers/${f.stripeCustomerId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-amber-600 dark:text-amber-400 hover:underline"
                          >
                            Stripe →
                          </a>
                        )}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{f.memberCount}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{f.childrenCount}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{f.residencesCount}</td>
                  <td className="px-4 py-3 text-stone-500 dark:text-stone-500">
                    {format(new Date(f.createdAt), "d MMM yyyy", { locale: ro })}
                  </td>
                </tr>
                {expandedId === f.id && (
                  <tr key={`${f.id}-details`} className="bg-stone-50 dark:bg-stone-800/40 border-b border-stone-100 dark:border-stone-800">
                    <td colSpan={9} className="px-8 py-4">
                      {loadingDetails === f.id ? (
                        <p className="text-stone-400 text-xs">Se încarcă detaliile…</p>
                      ) : detailsCache[f.id] ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                          <div>
                            <p className="font-semibold text-stone-700 dark:text-stone-300 mb-2">Membri ({detailsCache[f.id].members.length})</p>
                            {detailsCache[f.id].members.length === 0 ? (
                              <p className="text-stone-400">Niciun membru</p>
                            ) : (
                              <ul className="space-y-1">
                                {detailsCache[f.id].members.map((m) => (
                                  <li key={m.id} className="text-stone-600 dark:text-stone-400">
                                    <span className="font-medium text-stone-800 dark:text-stone-200">{m.name || "—"}</span>
                                    <span className="ml-1 text-stone-400">({m.email})</span>
                                    {m.createdAt && (
                                      <span className="ml-1 text-stone-400">· înregistrat {format(new Date(m.createdAt), "d MMM yyyy", { locale: ro })}</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-stone-700 dark:text-stone-300 mb-2">Copii ({detailsCache[f.id].children.length})</p>
                            {detailsCache[f.id].children.length === 0 ? (
                              <p className="text-stone-400">Niciun copil</p>
                            ) : (
                              <ul className="space-y-1">
                                {detailsCache[f.id].children.map((c) => (
                                  <li key={c.id} className="text-stone-600 dark:text-stone-400">
                                    {c.name}
                                    {c.birthDate && <span className="ml-1 text-stone-400">· {format(new Date(c.birthDate), "d MMM yyyy", { locale: ro })}</span>}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-stone-700 dark:text-stone-300 mb-2">Activitate</p>
                            <p className="text-stone-600 dark:text-stone-400">{detailsCache[f.id].eventsCount} evenimente în calendar</p>
                          </div>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
