"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Key, Download, FileJson, Calendar } from "lucide-react";

type ParentType = "tata" | "mama" | null;

interface AccountClientProps {
  initialEmail: string;
  initialName: string;
  initialParentType: ParentType;
}

export function AccountClient({
  initialEmail,
  initialName,
  initialParentType,
}: AccountClientProps) {
  const [name, setName] = useState(initialName);
  const [parentType, setParentType] = useState<ParentType>(initialParentType);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    setName(initialName);
    setParentType(initialParentType);
  }, [initialName, initialParentType]);

  async function saveProfile(overrideParentType?: ParentType) {
    setSaving(true);
    setMessage(null);
    const nextParent = overrideParentType ?? parentType;
    try {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || null,
          ...(nextParent ? { parentType: nextParent } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Eroare la salvare." });
        return;
      }
      setMessage({ type: "ok", text: "Salvat." });
      if (overrideParentType !== undefined) setParentType(overrideParentType);
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Parola nouă și confirmarea nu coincid." });
      return;
    }
    setPasswordSaving(true);
    setPasswordMessage(null);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPasswordMessage({ type: "error", text: data.error || "Eroare la schimbarea parolei." });
        return;
      }
      setPasswordMessage({ type: "ok", text: "Parola a fost actualizată." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-4">
        <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-3 flex items-center gap-2">
          <User className="w-4 h-4" />
          Profil
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Email</label>
            <p className="px-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-sm">
              {initialEmail}
            </p>
            <p className="text-xs text-stone-400 mt-1">Emailul nu poate fi schimbat.</p>
          </div>
          <div>
            <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Nume afișat (opțional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => (name !== initialName || parentType !== initialParentType) && saveProfile(undefined)}
              placeholder="Ex. Irinel"
              className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Ești în calendar</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => saveProfile("tata")}
                className={`flex-1 py-2.5 px-4 rounded-xl border-2 font-medium transition ${
                  parentType === "tata"
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                    : "border-stone-200 dark:border-stone-600 hover:border-stone-300 text-stone-600 dark:text-stone-400"
                }`}
              >
                Tata
              </button>
              <button
                type="button"
                onClick={() => saveProfile("mama")}
                className={`flex-1 py-2.5 px-4 rounded-xl border-2 font-medium transition ${
                  parentType === "mama"
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                    : "border-stone-200 dark:border-stone-600 hover:border-stone-300 text-stone-600 dark:text-stone-400"
                }`}
              >
                Mama
              </button>
            </div>
            <p className="text-xs text-stone-400 mt-1">Folosit pentru salut și zile blocate.</p>
          </div>
        </div>
        {message && (
          <p className={`mt-2 text-sm ${message.type === "error" ? "text-red-600" : "text-emerald-600"}`}>
            {message.text}
          </p>
        )}
        {saving && <p className="mt-2 text-sm text-stone-500">Se salvează…</p>}
      </section>

      <section className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-4">
        <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-3 flex items-center gap-2">
          <Key className="w-4 h-4" />
          Schimbă parola
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Parola curentă</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Parolă nouă (min. 6 caractere)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Confirmă parola nouă</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800"
            />
          </div>
          {passwordMessage && (
            <p className={`text-sm ${passwordMessage.type === "error" ? "text-red-600" : "text-emerald-600"}`}>
              {passwordMessage.text}
            </p>
          )}
          <button
            type="submit"
            disabled={passwordSaving}
            className="w-full py-2.5 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
          >
            {passwordSaving ? "Se actualizează…" : "Schimbă parola"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-4">
        <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-3 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exportă datele
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
          Descarcă evenimentele familiei tale ca backup sau pentru import în altă aplicație.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/api/calendar/ics"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800 font-medium text-stone-700 dark:text-stone-300"
          >
            <Calendar className="w-4 h-4" />
            Calendar (.ics)
          </Link>
          <Link
            href="/api/user/export-json"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800 font-medium text-stone-700 dark:text-stone-300"
          >
            <FileJson className="w-4 h-4" />
            Evenimente (JSON)
          </Link>
        </div>
      </section>

      <div className="flex gap-3">
        <Link
          href="/"
          className="flex-1 py-3 text-center rounded-xl border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-300 font-medium"
        >
          Înapoi la calendar
        </Link>
      </div>
    </div>
  );
}
