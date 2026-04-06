"use client";

import { useEffect, useState } from "react";

export function PwaRuntime() {
  const [isOffline, setIsOffline] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    setIsOffline(typeof navigator !== "undefined" ? !navigator.onLine : false);
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // noop
    });

    const onSwMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; url?: string } | undefined;
      if (!data || data.type !== "homesplit:navigate" || !data.url || typeof window === "undefined") return;
      try {
        const nextUrl = new URL(data.url, window.location.origin).href;
        if (window.location.href !== nextUrl) {
          window.location.assign(nextUrl);
        }
      } catch {
        // ignore invalid URL payload
      }
    };
    navigator.serviceWorker.addEventListener("message", onSwMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", onSwMessage);
    };
  }, []);

  useEffect(() => {
    const onOffline = () => {
      setIsOffline(true);
      setJustReconnected(false);
    };
    const onOnline = () => {
      setIsOffline(false);
      setJustReconnected(true);
      window.dispatchEvent(new Event("homesplit:online"));
      window.setTimeout(() => setJustReconnected(false), 2500);
    };
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  if (!isOffline && !justReconnected) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[120] pointer-events-none">
      <div
        className={`rounded-full px-3 py-1.5 text-xs font-medium shadow-lg border ${
          isOffline
            ? "bg-red-50/95 text-red-700 border-red-200 dark:bg-red-950/80 dark:text-red-300 dark:border-red-900"
            : "bg-emerald-50/95 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-900"
        }`}
      >
        {isOffline
          ? "Offline: vezi ultimele date salvate."
          : "Conexiune restabilită. Se sincronizează..."}
      </div>
    </div>
  );
}
