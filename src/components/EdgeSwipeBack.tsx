"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useIsStandalone } from "@/lib/use-standalone";

const EDGE_PX = 24;
const TRIGGER_PX = 90;
const MAX_PX = 140;

/** Ecranele de pe care nu are sens „înapoi” (rădăcini) sau unde nu vrem gestul. */
function isRootPath(path: string): boolean {
  return path === "/" || path === "/app" || path === "/login" || path === "/register" || path === "/setup";
}

/** Unde mergem dacă nu există istoric în aplicație (ex. deschisă direct dintr-o notificare). */
function fallbackFor(path: string): string {
  if (path.startsWith("/blog/")) return "/blog";
  if (path.startsWith("/admin/")) return "/admin";
  return "/app";
}

/**
 * Swipe de la marginea stângă = înapoi, ca în aplicațiile iOS.
 * Activ doar în aplicația instalată: în Safari/Chrome browserul are deja gestul lui.
 */
export function EdgeSwipeBack() {
  const router = useRouter();
  const pathname = usePathname();
  const standalone = useIsStandalone();
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const start = useRef<{ x: number; y: number; locked: "h" | "v" | null } | null>(null);
  const dxRef = useRef(0);

  // Stiva paginilor vizitate în aplicație: dacă există pagină anterioară, folosim history.back();
  // altfel (ex. deschisă direct dintr-o notificare) mergem la ecranul-părinte.
  const stack = useRef<string[]>([]);
  useEffect(() => {
    const st = stack.current;
    if (st.length >= 2 && st[st.length - 2] === pathname) st.pop();
    else if (st[st.length - 1] !== pathname) st.push(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!standalone || isRootPath(pathname)) return;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (e.touches.length !== 1 || t.clientX > EDGE_PX) {
        start.current = null;
        return;
      }
      start.current = { x: t.clientX, y: t.clientY, locked: null };
    };
    const onMove = (e: TouchEvent) => {
      const st = start.current;
      if (!st) return;
      const t = e.touches[0];
      const mx = t.clientX - st.x;
      const my = t.clientY - st.y;
      if (!st.locked) {
        if (Math.abs(mx) < 6 && Math.abs(my) < 6) return;
        st.locked = mx > 0 && Math.abs(mx) > Math.abs(my) ? "h" : "v";
        if (st.locked === "v") {
          start.current = null;
          return;
        }
      }
      if (e.cancelable) e.preventDefault();
      const v = Math.max(0, Math.min(MAX_PX, mx));
      dxRef.current = v;
      setDx(v);
      setDy(t.clientY);
    };
    const onEnd = () => {
      const st = start.current;
      start.current = null;
      if (!st || st.locked !== "h") return;
      const fire = dxRef.current >= TRIGGER_PX;
      dxRef.current = 0;
      setDx(0);
      if (!fire) return;
      navigator.vibrate?.(10);
      if (stack.current.length > 1) router.back();
      else router.push(fallbackFor(pathname));
    };

    // Capture: rulează înaintea handler-elor din pagină (ex. swipe pe mesaj în chat).
    window.addEventListener("touchstart", onStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onMove, { passive: false, capture: true });
    window.addEventListener("touchend", onEnd, { capture: true });
    window.addEventListener("touchcancel", onEnd, { capture: true });
    return () => {
      window.removeEventListener("touchstart", onStart, { capture: true });
      window.removeEventListener("touchmove", onMove, { capture: true });
      window.removeEventListener("touchend", onEnd, { capture: true });
      window.removeEventListener("touchcancel", onEnd, { capture: true });
    };
  }, [standalone, pathname, router]);

  if (dx === 0) return null;
  const progress = Math.min(1, dx / TRIGGER_PX);
  return (
    <div className="pointer-events-none fixed inset-0 z-[200]" aria-hidden>
      <div className="absolute inset-0 bg-black" style={{ opacity: progress * 0.08 }} />
      <div
        className={`absolute left-0 flex h-11 w-11 items-center justify-center rounded-full shadow-[0_6px_18px_rgba(28,25,23,0.2)] transition-colors ${
          progress >= 1 ? "bg-[#bf6a4b] text-white" : "bg-white text-[#bf6a4b]"
        }`}
        style={{ top: dy - 22, transform: `translateX(${Math.min(dx, TRIGGER_PX) * 0.6 - 10}px) scale(${0.7 + progress * 0.3})` }}
      >
        <ChevronLeft className="h-6 w-6" />
      </div>
    </div>
  );
}
