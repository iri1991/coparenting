"use client";

import { createPortal } from "react-dom";

/**
 * Randează conținutul direct în `document.body`, scăpând de orice strămoș cu
 * `backdrop-filter` / `transform` / `filter` (care ar transforma `position: fixed`
 * într-un containing block local și ar sparge overlay-ul). Astfel modalele se
 * comportă nativ: acoperă tot ecranul, indiferent unde sunt montate în arbore.
 *
 * SSR-safe: pe server (fără `document`) randează null. Modalele apelează acest
 * wrapper doar când sunt deschise (după `if (!isOpen) return null`), deci nu există
 * nepotrivire de hidratare.
 */
export function ModalPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
