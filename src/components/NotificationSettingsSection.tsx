"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, BellOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type PushStatus = "idle" | "loading" | "enabled" | "unsupported" | "denied" | "error";

interface NotificationSettingsSectionProps {
  currentUserId?: string;
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function NotificationSettingsSection({ currentUserId }: NotificationSettingsSectionProps) {
  const { t } = useLanguage();
  const n = t.app.notifications;
  const [status, setStatus] = useState<PushStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") { setStatus("denied"); return; }
    if (Notification.permission !== "granted") { setStatus("idle"); return; }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setStatus(sub ? "enabled" : "idle"))
      .catch(() => setStatus("idle"));
  }, []);

  const enablePush = useCallback(async () => {
    if (!currentUserId) return;
    setStatus("loading");
    setMessage(null);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "idle");
        if (permission === "denied") setMessage(n.denied);
        return;
      }
      const keyRes = await fetch("/api/push/vapid-public");
      if (!keyRes.ok) { setStatus("error"); setMessage(n.notConfigured); return; }
      const { publicKey } = await keyRes.json();
      if (!publicKey) { setStatus("error"); return; }
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource });
      const subscribeRes = await fetch("/api/push/subscribe", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub.toJSON()),
      });
      if (!subscribeRes.ok) { setStatus("error"); setMessage(n.saveError); return; }
      await fetch("/api/push/test", { method: "POST" });
      setStatus("enabled");
      setMessage(n.activated);
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : n.activateError);
    }
  }, [currentUserId, n]);

  if (status === "unsupported") return null;

  const isActive = status === "enabled";
  const isLoading = status === "loading";

  return (
    <section className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/50 p-4 mb-6">
      <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-1 flex items-center gap-2">
        {isActive ? <Bell className="w-4 h-4 text-amber-600" aria-hidden /> : <BellOff className="w-4 h-4 text-stone-500" aria-hidden />}
        {n.title}
      </h2>
      <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">{n.desc}</p>
      {message && (
        <p className={`text-xs mb-3 ${status === "error" ? "text-red-600" : "text-stone-600"}`}>{message}</p>
      )}
      {isActive ? (
        <p className="text-sm text-amber-700">{n.active}</p>
      ) : status === "denied" ? (
        <p className="text-sm text-stone-500">{n.blockedBrowser}</p>
      ) : (
        <button type="button" onClick={enablePush} disabled={isLoading || !currentUserId}
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium">
          {isLoading ? n.activating : n.activate}
        </button>
      )}
    </section>
  );
}
