"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, BellOff } from "lucide-react";

type PushStatus = "idle" | "loading" | "enabled" | "unsupported" | "denied" | "error";

interface HeaderNotificationIconProps {
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

export function HeaderNotificationIcon({ currentUserId }: HeaderNotificationIconProps) {
  const [status, setStatus] = useState<PushStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  // Detectă suportul și permisiunea curentă
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "granted") {
      setStatus("enabled");
    } else if (Notification.permission === "denied") {
      setStatus("denied");
    } else {
      setStatus("idle");
    }
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
        if (permission === "denied") setMessage("Ai refuzat notificările.");
        return;
      }
      const keyRes = await fetch("/api/push/vapid-public");
      if (!keyRes.ok) {
        setStatus("error");
        setMessage("Notificările nu sunt configurate pe server.");
        return;
      }
      const { publicKey } = await keyRes.json();
      if (!publicKey) {
        setStatus("error");
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
        setStatus("error");
        setMessage("Nu s-a putut salva abonamentul.");
        return;
      }
      // notificare de test
      await fetch("/api/push/test", { method: "POST" });
      setStatus("enabled");
      setMessage("Notificări activate.");
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Eroare la activare.");
    }
  }, [currentUserId]);

  if (status === "unsupported") {
    return null;
  }

  const isActive = status === "enabled";
  const isLoading = status === "loading";

  let title = "Notificări";
  if (status === "enabled") title = message || "Notificări activate";
  else if (status === "idle") title = "Activează notificările pentru evenimente și reminder seara.";
  else if (status === "denied") title = "Notificări blocate în browser.";
  else if (status === "error") title = message || "Eroare la activarea notificărilor.";

  return (
    <button
      type="button"
      onClick={enablePush}
      disabled={isLoading || isActive}
      className="relative p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 touch-manipulation"
      title={title}
      aria-label={title}
    >
      {isActive ? (
        <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden />
      ) : (
        <BellOff className="w-5 h-5 text-stone-400 dark:text-stone-500" aria-hidden />
      )}
      {isActive && (
        <span className="absolute top-1 right-1 inline-block w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" />
      )}
      {isLoading && (
        <span className="absolute top-1 right-1 inline-block w-2 h-2 rounded-full bg-stone-400 animate-ping" />
      )}
    </button>
  );
}

