"use client";

import { useState } from "react";
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
}

interface AdminFamiliesTableProps {
  families: FamilyRow[];
}

export function AdminFamiliesTable({ families: initialFamilies }: AdminFamiliesTableProps) {
  const router = useRouter();
  const [families, setFamilies] = useState(initialFamilies);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      if (!res.ok) {
        setError(data.error || "Eroare la actualizare.");
        return;
      }
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
      if (!res.ok) {
        setError(data.error || "Eroare la actualizare.");
        return;
      }
      setFamilies((prev) => prev.map((f) => (f.id === familyId ? { ...f, active } : f)));
      router.refresh();
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-700">
        <h2 className="font-semibold text-stone-800 dark:text-stone-100">Familii</h2>
        <p className="text-stone-500 dark:text-stone-400 text-sm">
          Schimbă planul din dropdown; dezactivează sau reactivează familia. Doar contul admin poate face modificări.
        </p>
        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Familie</th>
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Status</th>
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Plan</th>
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Membri</th>
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Copii</th>
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Locații</th>
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Creat</th>
            </tr>
          </thead>
          <tbody>
            {families.map((f) => (
              <tr key={f.id} className="border-b border-stone-100 dark:border-stone-800">
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
                    {f.active ? "Dezactivează" : "Reactivatează"}
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
                  {updatingId === f.id && (
                    <span className="ml-1 text-stone-400 text-xs">Se salvează…</span>
                  )}
                </td>
                <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{f.memberCount}</td>
                <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{f.childrenCount}</td>
                <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{f.residencesCount}</td>
                <td className="px-4 py-3 text-stone-500 dark:text-stone-500">
                  {format(new Date(f.createdAt), "d MMM yyyy", { locale: ro })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
