"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-stone-950 dark:to-stone-900">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center flex flex-col items-center gap-3">
          <Link href="/">
            <Image src="/logo.png" alt="HomeSplit" width={64} height={64} className="rounded-2xl object-contain" />
          </Link>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            Ai uitat parola?
          </h1>
          <p className="mt-1 text-stone-600 dark:text-stone-400 text-sm">
            Introdu emailul contului și vei primi un link pentru resetare.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
          />
          {message && (
            <p className={`text-sm ${message.type === "error" ? "text-red-600" : "text-emerald-600"}`}>
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
          >
            {loading ? "Se trimite…" : "Trimite link resetare"}
          </button>
        </form>
        <p className="text-center text-stone-500 text-sm">
          <Link href="/login" className="text-amber-600 hover:underline">
            Înapoi la conectare
          </Link>
        </p>
      </div>
    </div>
  );
}
