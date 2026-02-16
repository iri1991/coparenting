"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

interface JoinClientProps {
  token: string;
  isLoggedIn: boolean;
}

export function JoinClient({ token, isLoggedIn }: JoinClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleAccept() {
    if (!token) {
      setMessage({ type: "error", text: "Lipsește token-ul. Folosește linkul primit prin email." });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Invitația nu a putut fi acceptată." });
        return;
      }
      router.push("/config");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

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
      window.location.href = token ? `/join?token=${encodeURIComponent(token)}` : "/join";
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
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setMessage({ type: "error", text: data.error || "Eroare la înregistrare." });
      return;
    }
    window.location.href = token ? `/join?token=${encodeURIComponent(token)}` : "/join";
  }

  if (isLoggedIn && token) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleAccept}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
        >
          {loading ? "Se acceptă..." : "Accept invitația"}
        </button>
        {message && (
          <p className={`text-sm text-center ${message.type === "error" ? "text-red-600" : "text-emerald-600"}`}>
            {message.text}
          </p>
        )}
        <p className="text-center text-sm">
          <Link href="/setup" className="text-stone-500 hover:underline">Înapoi</Link>
        </p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <p className="text-stone-500 text-sm text-center">
          Adaugă în URL token-ul din linkul de invitație: <strong>/join?token=...</strong>
        </p>
        <Link href="/login" className="block w-full py-3 text-center rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600">
          Mergi la conectare
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
      />
      <input
        type="password"
        placeholder="Parolă"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
      />
      {message && (
        <p className={`text-sm ${message.type === "error" ? "text-red-600" : "text-emerald-600"}`}>{message.text}</p>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
        >
          Conectare
        </button>
        <button
          type="button"
          onClick={handleSignUp}
          disabled={loading}
          className="flex-1 py-3 rounded-xl border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 font-medium"
        >
          Înregistrare
        </button>
      </div>
    </form>
  );
}
