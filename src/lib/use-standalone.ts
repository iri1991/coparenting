"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(display-mode: standalone)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getSnapshot(): boolean {
  return (
    window.matchMedia(QUERY).matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** true când aplicația rulează instalată (PWA / „Add to Home Screen”). false pe server. */
export function useIsStandalone(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
