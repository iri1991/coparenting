"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import type { PlanType } from "@/types/plan";
import type { AdminFamilyRow } from "@/lib/admin-data";
import { ActivityBadge, Badge, PlanBadge, SortHeader, SubscriptionBadge, buttonClass, fmtDate, inputClass } from "@/components/admin/ui";

type SortKey = "createdAt" | "lastActiveAt" | "eventsCount" | "featuresUsed" | "name";
type StatusFilter = "all" | "active" | "inactive" | "incomplete" | "single" | "paymentIssue";

function csvCell(v: unknown): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportCsv(families: AdminFamilyRow[]) {
  const headers = ["ID", "Nume", "Plan", "Activă", "Membri", "Emailuri", "Copii", "Locații", "Evenimente", "Mesaje", "Funcționalități", "Ultima activitate", "Abonament", "Stripe", "Creată"];
  const rows = families.map((f) => [
    f.id,
    f.name,
    f.plan,
    f.active ? "da" : "nu",
    f.memberCount,
    f.memberEmails.join(" "),
    f.childrenCount,
    f.residencesCount,
    f.eventsCount,
    f.messagesCount,
    f.featuresUsed,
    f.lastActiveAt ?? "",
    f.subscriptionStatus ?? "",
    f.stripeCustomerId ?? "",
    f.createdAt ?? "",
  ]);
  const csv = [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `familii-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminFamiliesTable({ families }: { families: AdminFamilyRow[] }) {
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<"all" | PlanType>("all");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let list = families;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (f) =>
          f.id.includes(q) ||
          f.name.toLowerCase().includes(q) ||
          f.memberEmails.some((e) => e.toLowerCase().includes(q)) ||
          (f.stripeCustomerId ?? "").toLowerCase().includes(q)
      );
    }
    if (filterPlan !== "all") list = list.filter((f) => f.plan === filterPlan);
    if (filterStatus === "active") list = list.filter((f) => f.active);
    if (filterStatus === "inactive") list = list.filter((f) => !f.active);
    if (filterStatus === "incomplete") list = list.filter((f) => f.active && (f.childrenCount === 0 || f.residencesCount === 0));
    if (filterStatus === "single") list = list.filter((f) => f.active && f.memberCount < 2);
    if (filterStatus === "paymentIssue") list = list.filter((f) => ["past_due", "unpaid", "incomplete"].includes(f.subscriptionStatus ?? ""));
    return [...list].sort((a, b) => {
      const va = a[sortKey] ?? "";
      const vb = b[sortKey] ?? "";
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [families, search, filterPlan, filterStatus, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }


  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-100 px-4 py-3 dark:border-stone-800">
        <input
          type="search"
          placeholder="Caută nume, email membru, ID, Stripe…"
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
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as StatusFilter)} className={inputClass}>
          <option value="all">Toate statusurile</option>
          <option value="active">Active</option>
          <option value="inactive">Dezactivate</option>
          <option value="incomplete">Neconfigurate</option>
          <option value="single">Un singur părinte</option>
          <option value="paymentIssue">Probleme de plată</option>
        </select>
        <span className="text-xs text-stone-500">
          {filtered.length}/{families.length}
        </span>
        <button type="button" onClick={() => exportCsv(filtered)} className={`${buttonClass} ml-auto`}>
          <Download className="h-3.5 w-3.5" /> CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-xs text-stone-600 dark:bg-stone-800/50 dark:text-stone-300">
            <tr>
              <SortHeader col="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}>Familie</SortHeader>
              <th className="px-3 py-2.5 text-left font-medium">Plan</th>
              <th className="px-3 py-2.5 text-left font-medium">Configurare</th>
              <SortHeader col="eventsCount" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}>Utilizare</SortHeader>
              <SortHeader col="lastActiveAt" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}>Activitate</SortHeader>
              <SortHeader col="createdAt" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}>Creată</SortHeader>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                  Nicio familie găsită
                </td>
              </tr>
            )}
            {filtered.map((f) => (
                <tr key={f.id} className="border-t border-stone-100 hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800/40">
                  <td className="px-3 py-2.5">
                    <Link href={`/admin/families/${f.id}`} className="font-medium text-stone-900 hover:text-amber-700 hover:underline dark:text-stone-100 dark:hover:text-amber-400">
                      {f.name}
                    </Link>
                    {!f.active && (
                      <span className="ml-1.5">
                        <Badge tone="bad">dezactivată</Badge>
                      </span>
                    )}
                    <p className="max-w-[18rem] truncate text-xs text-stone-500">{f.memberEmails.join(", ") || "fără membri"}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <PlanBadge plan={f.plan} /> <SubscriptionBadge status={f.subscriptionStatus} />
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    <div className="flex flex-wrap gap-1">
                      <Badge tone={f.memberCount >= 2 ? "good" : "warn"}>{f.memberCount} părinți</Badge>
                      <Badge tone={f.childrenCount > 0 ? "neutral" : "warn"}>{f.childrenCount} copii</Badge>
                      <Badge tone={f.residencesCount > 0 ? "neutral" : "warn"}>{f.residencesCount} locații</Badge>
                      {f.pendingInvites > 0 && <Badge tone="info">invitație</Badge>}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-stone-600 dark:text-stone-400">
                    {f.eventsCount} ev. · {f.messagesCount} mesaje
                    <span className="block text-stone-400">{f.featuresUsed} funcționalități</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <ActivityBadge lastActiveAt={f.lastActiveAt} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-stone-500">{fmtDate(f.createdAt)}</td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
