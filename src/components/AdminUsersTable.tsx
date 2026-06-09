"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { PLAN_NAMES } from "@/types/plan";
import type { PlanType } from "@/types/plan";

interface UserRow {
  id: string;
  email: string;
  name: string;
  familyId: string | null;
  plan: PlanType;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  createdAt: string | null;
}

type SortKey = "email" | "name" | "plan" | "createdAt";
type SortDir = "asc" | "desc";

function exportCsv(users: UserRow[]) {
  const headers = ["Email", "Nume", "Familie", "Plan", "Status abonament", "Perioadă până la", "Înregistrat"];
  const rows = users.map((u) => [
    u.email,
    u.name,
    u.familyId ?? "",
    u.plan,
    u.subscriptionStatus ?? "",
    u.currentPeriodEnd ?? "",
    u.createdAt ?? "",
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `utilizatori-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminUsersTable({ users }: { users: UserRow[] }) {
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<"all" | PlanType>("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    let list = users;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.name.toLowerCase().includes(q) ||
          (u.familyId ?? "").toLowerCase().includes(q)
      );
    }
    if (filterPlan !== "all") list = list.filter((u) => u.plan === filterPlan);
    return [...list].sort((a, b) => {
      const va = (a[sortKey] ?? "") as string;
      const vb = (b[sortKey] ?? "") as string;
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, search, filterPlan, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-stone-400 ml-1">↕</span>;
    return <span className="text-amber-500 ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-700">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="font-semibold text-stone-800 dark:text-stone-100">
              Utilizatori <span className="text-stone-400 font-normal text-sm">({filtered.length}/{users.length})</span>
            </h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm">Lista cu email, familie, plan și status abonament.</p>
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
            placeholder="Caută email, nume sau familie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs px-3 py-1.5 w-64"
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
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
              <th
                className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300 cursor-pointer select-none hover:text-stone-900 dark:hover:text-stone-100"
                onClick={() => toggleSort("email")}
              >
                Email <SortIcon col="email" />
              </th>
              <th
                className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300 cursor-pointer select-none hover:text-stone-900 dark:hover:text-stone-100"
                onClick={() => toggleSort("name")}
              >
                Nume <SortIcon col="name" />
              </th>
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Familie</th>
              <th
                className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300 cursor-pointer select-none hover:text-stone-900 dark:hover:text-stone-100"
                onClick={() => toggleSort("plan")}
              >
                Plan <SortIcon col="plan" />
              </th>
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Status abonament</th>
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Perioadă până la</th>
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Stripe</th>
              <th
                className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300 cursor-pointer select-none hover:text-stone-900 dark:hover:text-stone-100"
                onClick={() => toggleSort("createdAt")}
              >
                Înregistrat <SortIcon col="createdAt" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-stone-400 dark:text-stone-600">Niciun utilizator găsit</td>
              </tr>
            )}
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/30">
                <td className="px-4 py-3 text-stone-900 dark:text-stone-100 font-mono text-xs">{u.email}</td>
                <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{u.name || "—"}</td>
                <td className="px-4 py-3 text-stone-500 dark:text-stone-500 font-mono text-xs">{u.familyId ? u.familyId.slice(-8) : "—"}</td>
                <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{PLAN_NAMES[u.plan]}</td>
                <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{u.subscriptionStatus ?? "—"}</td>
                <td className="px-4 py-3 text-stone-500 dark:text-stone-500">
                  {u.currentPeriodEnd ? format(new Date(u.currentPeriodEnd), "d MMM yyyy", { locale: ro }) : "—"}
                </td>
                <td className="px-4 py-3">
                  {u.stripeCustomerId ? (
                    <a
                      href={`https://dashboard.stripe.com/customers/${u.stripeCustomerId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 dark:text-amber-400 hover:underline text-xs"
                    >
                      Customer →
                    </a>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 text-stone-500 dark:text-stone-500 text-xs">
                  {u.createdAt ? format(new Date(u.createdAt), "d MMM yyyy", { locale: ro }) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
