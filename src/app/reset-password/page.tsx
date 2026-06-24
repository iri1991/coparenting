"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { AuthSuspenseFallback } from "@/components/auth/AuthSuspenseFallback";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setToken(searchParams.get("token") ?? "");
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Parolele nu coincid." });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Parola trebuie să aibă cel puțin 6 caractere." });
      return;
    }
    if (!token) {
      setMessage({ type: "error", text: "Link invalid. Solicită din nou resetarea." });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Eroare la resetare." });
        return;
      }
      setSuccess(true);
      setMessage({ type: "ok", text: data.message || "Parola a fost actualizată." });
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "app-native-input w-full px-4 py-3 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-400 focus:border-transparent";
  const messageCls = (type: "ok" | "error") =>
    `text-sm rounded-xl px-3 py-2 ${
      type === "error"
        ? "text-red-700 dark:text-red-300 bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50"
        : "text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50"
    }`;

  const backFooter = (
    <p className="text-center text-stone-500 text-sm">
      <Link href="/login" className="text-amber-600 dark:text-amber-400 hover:underline">
        Înapoi la conectare
      </Link>
    </p>
  );

  if (!token && !message) {
    return (
      <AuthPageShell
        title="Link invalid"
        subtitle="Folosește linkul primit pe email sau solicită din nou resetarea parolei."
        footer={backFooter}
      >
        <Link
          href="/forgot-password"
          className="app-native-primary-button block w-full py-3.5 text-center font-semibold"
        >
          Resetează parola
        </Link>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell title="Parolă nouă" subtitle="Alege o parolă de cel puțin 6 caractere." footer={backFooter}>
      {success ? (
        <div className="app-native-surface-strong rounded-[1.8rem] p-4 sm:p-5 space-y-4 text-center">
          <p className={messageCls("ok")} role="alert">
            {message?.text}
          </p>
          <Link href="/login" className="app-native-primary-button block w-full py-3.5 text-center font-semibold">
            Mergi la conectare
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="app-native-surface-strong rounded-[1.8rem] p-4 sm:p-5 space-y-4">
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Parolă nouă"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className={inputCls}
          />
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Confirmă parola"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className={inputCls}
          />
          {message && (
            <p className={messageCls(message.type)} role="alert">
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="app-native-primary-button w-full py-3.5 font-semibold disabled:opacity-50"
          >
            {loading ? "Se actualizează…" : "Resetează parola"}
          </button>
        </form>
      )}
    </AuthPageShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthSuspenseFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
