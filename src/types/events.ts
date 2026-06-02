/** Cu cine e copilul. „other” = alt responsabil (bunici, mătușă, unchi etc.) */
export type ParentType = "tata" | "mama" | "together" | "other";

/** Locație */
export type LocationType = "tunari" | "otopeni" | "other";

export interface ScheduleEvent {
  id: string;
  date: string; // YYYY-MM-DD
  /** Cu cine e copilul */
  parent: ParentType;
  /** Locație */
  location: LocationType;
  /** Locație custom când location === "other" */
  locationLabel?: string;
  title?: string;
  notes?: string;
  startTime?: string;
  endTime?: string;
  /** Numele responsabilului când parent === "other" (ex. „Bunici”, „Mătușa Ana”). */
  caretakerLabel?: string;
  created_by: string;
  created_at: string;
  /** @deprecated Folosit pentru backward compat; preferă parent + location */
  type?: string;
}

/** Numele afișat pentru fiecare părinte (implicit; în UI se folosesc numele din familia utilizatorului) */
export const PARENT_LABELS: Record<ParentType, string> = {
  tata: "Irinel",
  mama: "Andreea",
  together: "Cu toții",
  other: "Alt responsabil",
};

export const LOCATION_LABELS: Record<LocationType, string> = {
  tunari: "Tunari",
  otopeni: "Otopeni",
  other: "Alte locații",
};

/** Culoare după părinte (pentru calendar și listă) */
export const PARENT_COLORS: Record<ParentType, string> = {
  tata: "#3B82F6",
  mama: "#EC4899",
  together: "#10B981",
  other: "#8B5CF6",
};

/** Numele responsabilului: pentru „other” folosește caretakerLabel dacă există. */
function parentLabelForEvent(event: ScheduleEvent): string {
  if (event.parent === "other") return event.caretakerLabel?.trim() || PARENT_LABELS.other;
  return PARENT_LABELS[event.parent];
}

export function getEventDisplayLabel(event: ScheduleEvent): string {
  const parent = parentLabelForEvent(event);
  const loc =
    event.location === "other" && event.locationLabel?.trim()
      ? event.locationLabel.trim()
      : LOCATION_LABELS[event.location];
  return `Copil cu ${parent}, ${loc}`;
}

export function getEventColor(event: ScheduleEvent): string {
  return PARENT_COLORS[event.parent];
}

/** Etichetă scurtă pentru sumar săptămână / celule mici (fără „copil cu”, fără truncare) */
export function getEventShortLabel(event: ScheduleEvent): string {
  const parent = parentLabelForEvent(event);
  const loc =
    event.location === "other" && event.locationLabel?.trim()
      ? event.locationLabel.trim()
      : LOCATION_LABELS[event.location];
  return `${parent} · ${loc}`;
}
