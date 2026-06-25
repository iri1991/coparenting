"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { BellRing, X } from "lucide-react";
import { ModalPortal } from "@/components/ModalPortal";
import { useLanguage } from "@/contexts/LanguageContext";

interface NotificationActivationDialogProps {
  currentUserId?: string;
}

const SNOOZE_KEY = "notif-prompt-snooze-until";
const SNOOZE_MS = 6 * 60 * 60 * 1000; // 6 ore
const RECHECK_MS = 60 * 1000; // verificare la 60s

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function isSnoozed(): boolean {
  try {
    const until = Number(localStorage.getItem(SNOOZE_KEY) || 0);
    return Date.now() < until;
  } catch {
    return false;
  }
}

/**
 * Verifică constant dacă notificările push sunt active pe acest dispozitiv și,
 * dacă nu (și nu sunt blocate din browser), afișează un dialog de activare.
 * Re-verifică la montare, la revenirea în tab și periodic. „Mai târziu” amână 6 ore.
 */
export function NotificationActivationDialog({ currentUserId }: NotificationActivationDialogProps) {
  const { t } = useLanguage();
  const n = t.app.notifications;
  const [open, setOpen] = useState(false);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checkingRef = useRef(false);

  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  /** Decide dacă dialogul trebuie afișat (notificări inactive, neblocate, neamânate). */
  const check = useCallback(async () => {
    if (!currentUserId || !supported || checkingRef.current) return;
    checkingRef.current = true;
    try {
      if (Notification.permission === "denied") {
        setOpen(false);
        return;
      }
      // Permisiune acordată → verifică abonamentul existent.
      if (Notification.permission === "granted") {
        try {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            setOpen(false);
            return;
          }
        } catch {
          // continuă: tratăm ca neabonat
        }
      }
      // Aici: neabonat (permisiune „default” sau „granted” fără abonament).
      if (isSnoozed()) {
        setOpen(false);
        return;
      }
      setOpen(true);
    } finally {
      checkingRef.current = false;
    }
  }, [currentUserId, supported]);

  useEffect(() => {
    if (!currentUserId || !supported) return;
    check();
    const interval = setInterval(check, RECHECK_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [currentUserId, supported, check]);

  const activate = useCallback(async () => {
    if (!currentUserId) return;
    setActivating(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        if (permission === "denied") setOpen(false);
        setError(permission === "denied" ? n.denied : null);
        return;
      }
      const keyRes = await fetch("/api/push/vapid-public");
      if (!keyRes.ok) {
        setError(n.notConfigured);
        return;
      }
      const { publicKey } = await keyRes.json();
      if (!publicKey) {
        setError(n.notConfigured);
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
      const subscribeRes = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!subscribeRes.ok) {
        setError(n.saveError);
        return;
      }
      await fetch("/api/push/test", { method: "POST" }).catch(() => {});
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : n.activateError);
    } finally {
      setActivating(false);
    }
  }, [currentUserId, n]);

  const snooze = useCallback(() => {
    try {
      localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
    } catch {
      // ignoră
    }
    setOpen(false);
  }, []);

  if (!open) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={snooze}>
        <div
          className="app-native-surface-strong w-full max-w-sm rounded-[2rem] p-5 shadow-xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="notif-dialog-title"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff1df] text-[#b85c3e]">
              <BellRing className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="notif-dialog-title" className="text-base font-semibold text-stone-900">
                {n.promptTitle}
              </h2>
              <p className="mt-1 text-sm leading-6 text-stone-600">{n.promptBody}</p>
            </div>
            <button
              type="button"
              onClick={snooze}
              className="shrink-0 rounded-lg p-1.5 text-stone-400 hover:bg-white/70"
              aria-label={n.later}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={snooze}
              className="flex-1 rounded-full border border-[#e7d6c4] px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-white/60"
            >
              {n.later}
            </button>
            <button
              type="button"
              onClick={activate}
              disabled={activating}
              className="app-native-primary-button flex-1 px-4 py-3 text-sm font-semibold disabled:opacity-50"
            >
              {activating ? n.activating : n.activate}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
