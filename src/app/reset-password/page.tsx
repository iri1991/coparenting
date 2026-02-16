"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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

  if (!token && !message) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-stone-950 dark:to-stone-900">
        <div className="w-full max-w-sm space-y-6 text-center flex flex-col items-center">
          <Link href="/">
            <Image src="/logo.png" alt="HomeSplit" width={64} height={64} className="rounded-2xl object-contain" />
          </Link>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Link invalid</h1>
          <p className="text-stone-600 dark:text-stone-400 text-sm">
            Folosește linkul primit pe email sau solicită din nou resetarea parolei.
          </p>
          <Link href="/forgot-password" className="inline-block text-amber-600 hover:underline font-medium">
            Resetează parola
          </Link>
          <p className="text-sm">
            <Link href="/login" className="text-stone-500 hover:underline">Înapoi la conectare</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-stone-950 dark:to-stone-900">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center flex flex-col items-center gap-3">
          <Link href="/">
            <Image src="/logo.png" alt="HomeSplit" width={64} height={64} className="rounded-2xl object-contain" />
          </Link>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            Parolă nouă
          </h1>
          <p className="mt-1 text-stone-600 dark:text-stone-400 text-sm">
            Alege o parolă de cel puțin 6 caractere.
          </p>
        </div>
        {success ? (
          <div className="space-y-4 text-center">
            <p className="text-emerald-600 font-medium">{message?.text}</p>
            <Link
              href="/login"
              className="inline-block w-full py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 text-center"
            >
              Mergi la conectare
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Parolă nouă"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800"
            />
            <input
              type="password"
              placeholder="Confirmă parola"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800"
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
              {loading ? "Se actualizează…" : "Resetează parola"}
            </button>
          </form>
        )}
        <p className="text-center text-stone-500 text-sm">
          <Link href="/login" className="text-amber-600 hover:underline">
            Înapoi la conectare
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-stone-950 dark:to-stone-900">
        <p className="text-stone-500">Se încarcă…</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
