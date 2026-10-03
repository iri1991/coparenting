"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCw } from "lucide-react";

const TRIGGER_PX = 72;
const MAX_PULL_PX = 110;

/**
 * Pull-to-refresh pentru aplicația instalată (PWA). În browser nu se activează,
 * pentru că Safari/Chrome au deja propriul gest.
 * La eliberare: reîncarcă datele serverului și anunță componentele (evenimentul `homesplit:online`).
 */
export function PullToRefresh() {
  const router = useRouter();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const start = useRef<{ y: number; x: number; active: boolean } | null>(null);
  const pullRef = useRef(0);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (!standalone) return;

    const blocked = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return true;
      // Nu în modale sau în zone care derulează singure.
      return Boolean(target.closest('[role="dialog"], [aria-modal="true"], [data-no-ptr]')) || document.body.style.overflow === "hidden";
    };

    const onStart = (e: TouchEvent) => {
      if (refreshingRef.current || window.scrollY > 0 || e.touches.length !== 1 || blocked(e.target)) {
        start.current = null;
        return;
      }
      start.current = { y: e.touches[0].clientY, x: e.touches[0].clientX, active: false };
    };
    const onMove = (e: TouchEvent) => {
      const st = start.current;
      if (!st) return;
      const dy = e.touches[0].clientY - st.y;
      const dx = e.touches[0].clientX - st.x;
      if (!st.active) {
        if (dy < 6 || Math.abs(dx) > Math.abs(dy) || window.scrollY > 0) {
          if (dy < 0 || Math.abs(dx) > Math.abs(dy)) start.current = null;
          return;
        }
        st.active = true;
      }
      // Rezistență progresivă, ca în iOS.
      const value = Math.min(MAX_PULL_PX, dy * 0.5);
      pullRef.current = value;
      setPull(value);
    };
    const onEnd = () => {
      const st = start.current;
      start.current = null;
      if (!st?.active) return;
      if (pullRef.current >= TRIGGER_PX * 0.75) {
        void doRefresh();
      } else {
        pullRef.current = 0;
        setPull(0);
      }
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshingRef = useRef(false);
  async function doRefresh() {
    refreshingRef.current = true;
    setRefreshing(true);
    pullRef.current = 48;
    setPull(48);
    navigator.vibrate?.(10);
    window.dispatchEvent(new Event("homesplit:online"));
    router.refresh();
    // Lăsăm indicatorul vizibil cât să se vadă că s-a întâmplat ceva.
    await new Promise((r) => setTimeout(r, 700));
    refreshingRef.current = false;
    setRefreshing(false);
    pullRef.current = 0;
    setPull(0);
  }

  if (pull === 0 && !refreshing) return null;
  const progress = Math.min(1, pull / (TRIGGER_PX * 0.75));
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center"
      style={{ top: `calc(env(safe-area-inset-top) + ${Math.max(8, pull)}px)`, transition: refreshing ? "top 200ms ease" : "none" }}
      aria-hidden
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#bf6a4b] shadow-[0_6px_18px_rgba(28,25,23,0.16)]">
        <RotateCw
          className={`h-4.5 w-4.5 ${refreshing ? "animate-spin" : ""}`}
          style={refreshing ? undefined : { transform: `rotate(${progress * 270}deg)`, opacity: 0.4 + progress * 0.6 }}
        />
      </div>
    </div>
  );
}
