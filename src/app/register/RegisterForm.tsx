"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { Sparkles, Shield, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function RegisterForm() {
  const { t } = useLanguage();
  const a = t.app.auth;
  const perks = [
    { icon: Users, text: a.perk1 },
    { icon: Sparkles, text: a.perk2 },
    { icon: Shield, text: a.perk3 },
  ];
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
      setMessage({ type: "error", text: a.passwordsMismatch });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: "error", text: a.passwordShort });
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
        setMessage({ type: "error", text: typeof data.error === "string" ? data.error : a.registerError });
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
          text: a.accountCreatedManual,
        });
        return;
      }
      if (signInRes?.ok) {
        window.location.href = redirectAfterLogin;
        return;
      }
      setMessage({ type: "error", text: a.accountCreatedSignInFail });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell
      title={a.registerTitle}
      subtitle={a.registerSubtitle}
      footer={
        <p className="text-center text-stone-500 text-sm">
          {a.haveAccount}{" "}
          <Link href={`/login${planQuery}`} className="font-medium text-amber-600 dark:text-amber-400 hover:underline">
            {a.signIn}
          </Link>
          {" · "}
          <Link href="/" className="text-amber-600/90 dark:text-amber-400/90 hover:underline">
            {a.homePage}
          </Link>
        </p>
      }
    >
      <ul className="app-native-surface rounded-[1.8rem] px-4 py-4 space-y-2.5">
        {perks.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-300">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span>{text}</span>
          </li>
        ))}
      </ul>

      <form className="app-native-surface-strong rounded-[1.8rem] p-4 sm:p-5 space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="reg-email" className="sr-only">
            {a.email}
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            placeholder={a.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="app-native-input w-full px-4 py-3 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="reg-password" className="sr-only">
            {a.password}
          </label>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            placeholder={a.passwordChoose}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="app-native-input w-full px-4 py-3 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="reg-confirm" className="sr-only">
            {a.passwordConfirm}
          </label>
          <input
            id="reg-confirm"
            type="password"
            autoComplete="new-password"
            placeholder={a.passwordConfirm}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
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
            role={message.type === "error" ? "alert" : "status"}
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="app-native-primary-button w-full py-3.5 font-semibold disabled:opacity-50"
        >
          {loading ? a.creatingAccount : a.submitRegister}
        </button>

        <p className="text-xs text-center text-stone-500 dark:text-stone-400 leading-relaxed">
          {a.legalPrefix}{" "}
          <Link href="/terms" className="text-amber-600 dark:text-amber-400 hover:underline">
            {a.terms}
          </Link>{" "}
          {a.legalAnd}{" "}
          <Link href="/privacy" className="text-amber-600 dark:text-amber-400 hover:underline">
            {a.privacy}
          </Link>
          .
        </p>
      </form>
    </AuthPageShell>
  );
}
