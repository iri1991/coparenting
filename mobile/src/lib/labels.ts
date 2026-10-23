import type { Bootstrap, ScheduleEvent } from "@/lib/types";

type Family = NonNullable<Bootstrap["family"]>;

export function parentName(parent: ScheduleEvent["parent"], family: Family | null, caretaker?: string): string {
  if (parent === "tata") return family?.parent1Name ?? "Părinte 1";
  if (parent === "mama") return family?.parent2Name ?? "Părinte 2";
  if (parent === "together") return "Cu toții";
  return caretaker?.trim() || "Alt responsabil";
}

/** Numele locației: locuința după ID, altfel eticheta salvată / slotul istoric (ca pe web). */
export function locationName(event: ScheduleEvent, family: Family | null): string {
  const residences = family?.residences ?? [];
  if (event.residenceId) {
    const live = residences.find((r) => r.id === event.residenceId)?.name;
    if (live) return live;
  }
  if (event.location === "other") return event.locationLabel?.trim() || "Altă locație";
  if (event.location === "tunari") return residences[0]?.name ?? "Locația 1";
  return residences[1]?.name ?? "Locația 2";
}
