"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Key, Download, FileJson, Calendar, LogOut } from "lucide-react";

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
    <div className="space-y-5">
      <section className="app-native-surface-strong rounded-[2rem] p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[1.4rem] bg-[#fff1df] text-[#b85c3e]">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Profil</p>
            <h2 className="mt-1 text-lg font-semibold text-stone-900">Identitate în aplicație</h2>
            <p className="mt-1 text-sm leading-6 text-stone-500">
              Numele afișat și rolul tău sunt folosite în program, notificări și istoric.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Email</label>
            <p className="app-native-input px-4 py-3 text-sm text-stone-700">{initialEmail}</p>
            <p className="mt-1 text-xs text-stone-400">Emailul nu poate fi schimbat.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
              Nume afișat
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => (name !== initialName || parentType !== initialParentType) && saveProfile(undefined)}
              placeholder="Ex. Irinel"
              className="app-native-input w-full px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
              Ești în calendar
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => saveProfile("tata")}
                className={`rounded-[1.3rem] px-4 py-3 text-sm font-semibold transition ${
                  parentType === "tata"
                    ? "bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-white shadow-[0_14px_28px_rgba(191,106,75,0.22)]"
                    : "app-native-secondary-button text-stone-700"
                }`}
              >
                Tata
              </button>
              <button
                type="button"
                onClick={() => saveProfile("mama")}
                className={`rounded-[1.3rem] px-4 py-3 text-sm font-semibold transition ${
                  parentType === "mama"
                    ? "bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-white shadow-[0_14px_28px_rgba(191,106,75,0.22)]"
                    : "app-native-secondary-button text-stone-700"
                }`}
              >
                Mama
              </button>
            </div>
            <p className="mt-1 text-xs text-stone-400">Folosit pentru salut, blocaje și alocări rapide.</p>
          </div>
        </div>

        {message && (
          <p className={`mt-3 text-sm ${message.type === "error" ? "text-red-600" : "text-emerald-700"}`}>
            {message.text}
          </p>
        )}
        {saving && <p className="mt-2 text-sm text-stone-500">Se salvează…</p>}
      </section>

      <section className="app-native-surface rounded-[2rem] p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[1.4rem] bg-[#f8e4da] text-[#b96a4b]">
            <Key className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Securitate</p>
            <h2 className="mt-1 text-lg font-semibold text-stone-900">Schimbă parola</h2>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="mt-5 space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Parola curentă</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="app-native-input w-full px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Parolă nouă</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="app-native-input w-full px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Confirmă parola nouă</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="app-native-input w-full px-4 py-3 text-sm"
            />
          </div>

          {passwordMessage && (
            <p className={`text-sm ${passwordMessage.type === "error" ? "text-red-600" : "text-emerald-700"}`}>
              {passwordMessage.text}
            </p>
          )}

          <button
            type="submit"
            disabled={passwordSaving}
            className="app-native-primary-button w-full px-4 py-3 text-sm font-semibold disabled:opacity-50"
          >
            {passwordSaving ? "Se actualizează…" : "Schimbă parola"}
          </button>
        </form>
      </section>

      <section className="app-native-surface rounded-[2rem] p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[1.4rem] bg-[#f7f0e7] text-[#8a6330]">
            <Download className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Export</p>
            <h2 className="mt-1 text-lg font-semibold text-stone-900">Descarcă datele familiei</h2>
            <p className="mt-1 text-sm leading-6 text-stone-500">
              Pentru backup, transparență sau migrare în altă aplicație.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/api/calendar/ics"
            target="_blank"
            rel="noopener noreferrer"
            className="app-native-secondary-button inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-stone-700"
          >
            <Calendar className="h-4 w-4" />
            Calendar (.ics)
          </Link>
          <Link
            href="/api/user/export-json"
            target="_blank"
            rel="noopener noreferrer"
            className="app-native-secondary-button inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-stone-700"
          >
            <FileJson className="h-4 w-4" />
            Evenimente (JSON)
          </Link>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/"
          className="app-native-secondary-button inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-stone-700"
        >
          Înapoi la calendar
        </Link>
        <a
          href="/api/auth/signout"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-red-100 bg-white/76 px-4 py-3 text-sm font-semibold text-red-700 shadow-[0_12px_28px_rgba(28,25,23,0.06)]"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden />
          Deconectare
        </a>
      </div>
    </div>
  );
}
