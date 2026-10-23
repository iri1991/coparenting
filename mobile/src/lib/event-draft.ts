import type { ScheduleEvent } from "@/lib/types";

/** Evenimentul deschis pentru editare (transmis din calendar către ecranul de eveniment). */
let current: ScheduleEvent | null = null;

export function setEventToEdit(event: ScheduleEvent | null) {
  current = event;
}

export function takeEventToEdit(): ScheduleEvent | null {
  const e = current;
  current = null;
  return e;
}

/** Semnal că lista de evenimente trebuie reîncărcată (după salvare / ștergere). */
let listeners: (() => void)[] = [];
export function onEventsChanged(fn: () => void): () => void {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}
export function notifyEventsChanged() {
  listeners.forEach((l) => l());
}
