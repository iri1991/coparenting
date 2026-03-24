"use client";

import { useState } from "react";
import Link from "next/link";
import type { FamilyHouseholdMode } from "@/types/family";

interface SetupClientProps {
  /** După crearea familiei, redirect cu plan pentru fluxul de checkout. */
  pendingPlan?: "pro" | "family";
}

export function SetupClient({ pendingPlan }: SetupClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [householdMode, setHouseholdMode] = useState<FamilyHouseholdMode>("two_households");

  async function handleCreateFamily() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ householdMode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Eroare la creare familie.");
        return;
      }
      const query = pendingPlan ? `?plan=${pendingPlan}` : "";
      window.location.href = `/config${query}`;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <fieldset className="space-y-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white/60 dark:bg-stone-900/40 p-3">
        <legend className="text-xs font-medium text-stone-600 dark:text-stone-400 px-1">
          Cum folosiți HomeSplit?
        </legend>
        <label className="flex cursor-pointer gap-3 rounded-lg border border-transparent p-2 hover:bg-stone-50 dark:hover:bg-stone-800/50 has-[:checked]:border-amber-400 dark:has-[:checked]:border-amber-600">
          <input
            type="radio"
            name="householdMode"
            className="mt-1"
            checked={householdMode === "together"}
            onChange={() => setHouseholdMode("together")}
          />
          <span>
            <span className="block text-sm font-medium text-stone-800 dark:text-stone-100">Locuim împreună</span>
            <span className="block text-xs text-stone-500 dark:text-stone-400">
              Activități, idei AI, documente — fără obligația de a defini locuințe pentru predare/primire.
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer gap-3 rounded-lg border border-transparent p-2 hover:bg-stone-50 dark:hover:bg-stone-800/50 has-[:checked]:border-amber-400 dark:has-[:checked]:border-amber-600">
          <input
            type="radio"
            name="householdMode"
            className="mt-1"
            checked={householdMode === "two_households"}
            onChange={() => setHouseholdMode("two_households")}
          />
          <span>
            <span className="block text-sm font-medium text-stone-800 dark:text-stone-100">Copilul merge între două locuințe</span>
            <span className="block text-xs text-stone-500 dark:text-stone-400">
              Calendar, handover, propuneri săptămânale — adaugi locuințe la configurare.
            </span>
          </span>
        </label>
      </fieldset>
      <button
        type="button"
        onClick={handleCreateFamily}
        disabled={loading}
        className="w-full py-3 px-4 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "Se creează..." : "Creează familia ta"}
      </button>
      <p className="text-center text-stone-500 text-sm">
        Ai primit o invitație?{" "}
        <Link href="/join" className="text-amber-600 dark:text-amber-400 font-medium hover:underline">
          Intră cu linkul de invitație
        </Link>
      </p>
      {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
    </div>
  );
}
