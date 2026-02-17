"use client";

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
}

interface AdminUsersTableProps {
  users: UserRow[];
}

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  return (
    <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-700">
        <h2 className="font-semibold text-stone-800 dark:text-stone-100">Utilizatori și abonamente</h2>
        <p className="text-stone-500 dark:text-stone-400 text-sm">
          Lista utilizatori cu email, familie, plan și status abonament Stripe.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Email</th>
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Nume</th>
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Familie</th>
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Plan</th>
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Status abonament</th>
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Perioadă până la</th>
              <th className="text-left px-4 py-3 font-medium text-stone-700 dark:text-stone-300">Stripe</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-stone-100 dark:border-stone-800">
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
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
