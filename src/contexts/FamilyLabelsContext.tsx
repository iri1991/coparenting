"use client";

import { createContext, useContext } from "react";
import type { ParentType } from "@/types/events";
import type { ScheduleEvent } from "@/types/events";

export interface FamilyLabelsContextValue {
  parent1Name: string;
  parent2Name: string;
  childName: string;
  residenceNames: string[];
  /** Locuințele cu ID (pentru evenimente legate prin residenceId). */
  residences: { id: string; name: string }[];
  parentLabels: Record<ParentType, string>;
  locationLabels: Record<string, string>;
}

const defaultLabels: FamilyLabelsContextValue = {
  parent1Name: "Părinte 1",
  parent2Name: "Părinte 2",
  childName: "copilul",
  residenceNames: [],
  residences: [],
  parentLabels: { tata: "Părinte 1", mama: "Părinte 2", together: "Cu toții", other: "Alt responsabil" },
  locationLabels: { tunari: "Locația 1", otopeni: "Locația 2", other: "Altă locație" },
};

const FamilyLabelsContext = createContext<FamilyLabelsContextValue>(defaultLabels);

export function FamilyLabelsProvider({
  parent1Name,
  parent2Name,
  childName,
  residenceNames,
  residences = [],
  children,
}: {
  parent1Name: string;
  parent2Name: string;
  childName: string;
  residenceNames: string[];
  residences?: { id: string; name: string }[];
  children: React.ReactNode;
}) {
  const value: FamilyLabelsContextValue = {
    parent1Name,
    parent2Name,
    childName,
    residenceNames,
    residences,
    parentLabels: {
      tata: parent1Name,
      mama: parent2Name,
      together: "Cu toții",
      other: "Alt responsabil",
    },
    locationLabels: {
      // „tunari”/„otopeni” sunt sloturile primei / celei de-a doua locuințe ale familiei.
      tunari: residenceNames[0] || "Locația 1",
      otopeni: residenceNames[1] || "Locația 2",
      other: "Altă locație",
    },
  };
  return (
    <FamilyLabelsContext.Provider value={value}>
      {children}
    </FamilyLabelsContext.Provider>
  );
}

export function useFamilyLabels(): FamilyLabelsContextValue {
  return useContext(FamilyLabelsContext);
}

/** Numele responsabilului: pentru „other” folosește caretakerLabel dacă există. */
function parentLabelForEvent(event: ScheduleEvent, labels: FamilyLabelsContextValue): string {
  if (event.parent === "other") return event.caretakerLabel?.trim() || labels.parentLabels.other;
  return labels.parentLabels[event.parent];
}

/** Numele locației: locuința curentă după residenceId, altfel eticheta salvată / slotul istoric. */
export function eventLocationName(event: ScheduleEvent, labels: FamilyLabelsContextValue): string {
  if (event.residenceId) {
    const live = labels.residences.find((r) => r.id === event.residenceId)?.name;
    if (live) return live;
  }
  if (event.location === "other" && event.locationLabel?.trim()) return event.locationLabel.trim();
  return labels.locationLabels[event.location] ?? "Altă locație";
}

/** Etichetă lungă pentru eveniment (folosește etichete din context) */
export function getEventDisplayLabelWithLabels(
  event: ScheduleEvent,
  labels: FamilyLabelsContextValue
): string {
  const parent = parentLabelForEvent(event, labels);
  const loc = eventLocationName(event, labels);
  return `${labels.childName} cu ${parent}, ${loc}`;
}

/** Etichetă scurtă pentru sumar săptămână (folosește etichete din context) */
export function getEventShortLabelWithLabels(
  event: ScheduleEvent,
  labels: FamilyLabelsContextValue
): string {
  const parent = parentLabelForEvent(event, labels);
  const loc = eventLocationName(event, labels);
  return `${parent} · ${loc}`;
}
