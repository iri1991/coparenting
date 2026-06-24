"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Eroare la trimitere." });
        return;
      }
      setMessage({ type: "ok", text: data.message || "Dacă există un cont cu acest email, vei primi un link de resetare." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell
      title="Ai uitat parola?"
      subtitle="Introdu emailul contului și vei primi un link pentru resetare."
      footer={
        <p className="text-center text-stone-500 text-sm">
          <Link href="/login" className="text-amber-600 dark:text-amber-400 hover:underline">
            Înapoi la conectare
          </Link>
        </p>
      }
    >
      <form className="app-native-surface-strong rounded-[1.8rem] p-4 sm:p-5 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="forgot-email" className="sr-only">
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="app-native-input w-full px-4 py-3 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
        {message && (
          <p
            className={`text-sm rounded-xl px-3 py-2 ${
              message.type === "error"
                ? "text-red-700 dark:text-red-300 bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50"
                : "text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50"
            }`}
            role="alert"
          >
            {message.text}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="app-native-primary-button w-full py-3.5 font-semibold disabled:opacity-50"
        >
          {loading ? "Se trimite…" : "Trimite link resetare"}
        </button>
      </form>
    </AuthPageShell>
  );
}
