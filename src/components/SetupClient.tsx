"use client";

import { useState } from "react";
import Link from "next/link";

interface SetupClientProps {
  /** După crearea familiei, redirect cu plan pentru fluxul de checkout. */
  pendingPlan?: "pro" | "family";
}

export function SetupClient({ pendingPlan }: SetupClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateFamily() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/family", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
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
