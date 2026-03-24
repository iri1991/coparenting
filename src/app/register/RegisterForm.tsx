"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { Sparkles, Shield, Users } from "lucide-react";

const PERKS = [
  { icon: Users, text: "Un singur loc pentru program, activități și documente — împreună acasă sau coordonare la distanță" },
  { icon: Sparkles, text: "Propuneri săptămânale și idei AI pentru ieșit" },
  { icon: Shield, text: "Datele familiei, doar între voi" },
];

export function RegisterForm() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const planQuery =
    planParam === "pro" || planParam === "family" ? `?plan=${encodeURIComponent(planParam)}` : "";
  const redirectAfterLogin = planParam === "pro" || planParam === "family" ? `/?plan=${planParam}` : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Parolele nu coincid." });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: "error", text: "Parola trebuie să aibă cel puțin 6 caractere." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "error", text: typeof data.error === "string" ? data.error : "Eroare la înregistrare." });
        return;
      }

      const signInRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (signInRes?.error) {
        setMessage({
          type: "ok",
          text: "Cont creat. Te rugăm să te conectezi manual cu parola aleasă.",
        });
        return;
      }
      if (signInRes?.ok) {
        window.location.href = redirectAfterLogin;
        return;
      }
      setMessage({ type: "error", text: "Cont creat, dar conectarea automată a eșuat. Încearcă „Conectare”." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell
      title="Creează contul tău"
      subtitle="În câteva secunde poți avea calendarul comun și notificările la un loc — fără card, fără complicații."
      footer={
        <p className="text-center text-stone-500 text-sm">
          Ai deja cont?{" "}
          <Link href={`/login${planQuery}`} className="font-medium text-amber-600 dark:text-amber-400 hover:underline">
            Conectează-te
          </Link>
          {" · "}
          <Link href="/" className="text-amber-600/90 dark:text-amber-400/90 hover:underline">
            Pagina principală
          </Link>
        </p>
      }
    >
      <ul className="rounded-2xl border border-amber-200/80 dark:border-amber-800/50 bg-white/60 dark:bg-stone-900/60 px-4 py-3 space-y-2.5">
        {PERKS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-300">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span>{text}</span>
          </li>
        ))}
      </ul>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="reg-email" className="sr-only">
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            placeholder="Adresa ta de email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="reg-password" className="sr-only">
            Parolă
          </label>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            placeholder="Alege o parolă (min. 6 caractere)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="reg-confirm" className="sr-only">
            Confirmă parola
          </label>
          <input
            id="reg-confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Confirmă parola"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>

        {message && (
          <p
            className={`text-sm ${
              message.type === "error" ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
            }`}
            role={message.type === "error" ? "alert" : "status"}
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 active:scale-[0.99] disabled:opacity-50 transition shadow-md shadow-amber-500/20"
        >
          {loading ? "Se creează contul…" : "Creează cont și intră în app"}
        </button>

        <p className="text-xs text-center text-stone-500 dark:text-stone-400 leading-relaxed">
          Apăsând butonul, îți creezi un cont HomeSplit. Poți citi{" "}
          <Link href="/terms" className="text-amber-600 dark:text-amber-400 hover:underline">
            termenii
          </Link>{" "}
          și{" "}
          <Link href="/privacy" className="text-amber-600 dark:text-amber-400 hover:underline">
            confidențialitatea
          </Link>
          .
        </p>
      </form>
    </AuthPageShell>
  );
}
