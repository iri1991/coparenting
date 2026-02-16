"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setMessage({ type: "error", text: "Email sau parolă incorectă." });
      return;
    }
    if (res?.ok) {
      window.location.href = "/";
      return;
    }
    setMessage({ type: "error", text: "Ceva nu a mers bine." });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setMessage({ type: "error", text: data.error || "Eroare la înregistrare." });
      return;
    }
    setMessage({ type: "ok", text: "Cont creat. Conectează-te cu parola setată." });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-stone-950 dark:to-stone-900">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center flex flex-col items-center gap-3">
          <Link href="/">
            <Image src="/logo.png" alt="HomeSplit" width={72} height={72} className="rounded-2xl object-contain" />
          </Link>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            HomeSplit
          </h1>
          <p className="mt-1 text-stone-600 dark:text-stone-400 text-sm">
            Conectează-te la HomeSplit
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
          <div>
            <input
              type="password"
              placeholder="Parolă"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
            <p className="mt-1.5 text-right">
              <Link href="/forgot-password" className="text-sm text-amber-600 dark:text-amber-400 hover:underline">
                Ai uitat parola?
              </Link>
            </p>
          </div>
          {message && (
            <p
              className={`text-sm ${
                message.type === "error" ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {message.text}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Se încarcă..." : "Conectare"}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 py-3 rounded-xl border border-amber-500 text-amber-600 dark:text-amber-400 font-medium hover:bg-amber-50 dark:hover:bg-amber-950/30 active:scale-[0.98] disabled:opacity-50"
            >
              Înregistrare
            </button>
          </div>
        </form>
        <p className="text-center text-stone-500 text-sm">
          <Link href="/" className="text-amber-600 hover:underline">
            Înapoi la aplicație
          </Link>
        </p>
      </div>
    </div>
  );
}
