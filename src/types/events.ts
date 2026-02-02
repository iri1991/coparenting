/** Cu cine e Eva */
export type ParentType = "tata" | "mama" | "together";

/** Locație */
export type LocationType = "tunari" | "otopeni" | "other";

export interface ScheduleEvent {
  id: string;
  date: string; // YYYY-MM-DD
  /** Cu cine e Eva */
  parent: ParentType;
  /** Locație */
  location: LocationType;
  /** Locație custom când location === "other" */
  locationLabel?: string;
  title?: string;
  notes?: string;
  startTime?: string;
  endTime?: string;
  created_by: string;
  created_at: string;
  /** @deprecated Folosit pentru backward compat; preferă parent + location */
  type?: string;
}

/** Numele afișat pentru fiecare părinte (Irinel = tata, Andreea = mama) */
export const PARENT_LABELS: Record<ParentType, string> = {
  tata: "Irinel",
  mama: "Andreea",
  together: "Cu toții",
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
};

export function getEventDisplayLabel(event: ScheduleEvent): string {
  const parent = PARENT_LABELS[event.parent];
  const loc =
    event.location === "other" && event.locationLabel?.trim()
      ? event.locationLabel.trim()
      : LOCATION_LABELS[event.location];
  return `Eva cu ${parent}, ${loc}`;
}

export function getEventColor(event: ScheduleEvent): string {
  return PARENT_COLORS[event.parent];
}

/** Etichetă scurtă pentru sumar săptămână / celule mici (fără „Eva cu”, fără truncare) */
export function getEventShortLabel(event: ScheduleEvent): string {
  const parent = PARENT_LABELS[event.parent];
  const loc =
    event.location === "other" && event.locationLabel?.trim()
      ? event.locationLabel.trim()
      : LOCATION_LABELS[event.location];
  return `${parent} · ${loc}`;
}
