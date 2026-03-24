"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

export function LoginForm() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const planQuery =
    planParam === "pro" || planParam === "family" ? `?plan=${encodeURIComponent(planParam)}` : "";
  const redirectAfterLogin = planParam === "pro" || planParam === "family" ? `/?plan=${planParam}` : "/";

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
      window.location.href = redirectAfterLogin;
      return;
    }
    setMessage({ type: "error", text: "Ceva nu a mers bine." });
  }

  return (
    <AuthPageShell
      title="Conectează-te"
      subtitle="Intră în contul tău HomeSplit — același plan și calendar ca înainte."
      footer={
        <p className="text-center text-stone-500 text-sm space-y-2">
          <span className="block">
            Nu ai cont?{" "}
            <Link
              href={`/register${planQuery}`}
              className="font-medium text-amber-600 dark:text-amber-400 hover:underline"
            >
              Creează cont gratuit
            </Link>
          </span>
          <span className="block">
            <Link href="/" className="text-amber-600/90 dark:text-amber-400/90 hover:underline">
              Pagina principală
            </Link>
          </span>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleLogin}>
        <div>
          <label htmlFor="login-email" className="sr-only">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="sr-only">
            Parolă
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
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
          <p className={`text-sm ${message.type === "error" ? "text-red-600 dark:text-red-400" : "text-emerald-600"}`} role="alert">
            {message.text}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 active:scale-[0.99] disabled:opacity-50 transition shadow-md shadow-amber-500/20"
        >
          {loading ? "Se conectează…" : "Conectare"}
        </button>
      </form>
    </AuthPageShell>
  );
}
