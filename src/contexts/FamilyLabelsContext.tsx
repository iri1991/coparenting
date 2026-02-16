"use client";

import { createContext, useContext } from "react";
import type { ParentType } from "@/types/events";
import type { ScheduleEvent } from "@/types/events";

export interface FamilyLabelsContextValue {
  parent1Name: string;
  parent2Name: string;
  childName: string;
  residenceNames: string[];
  parentLabels: Record<ParentType, string>;
  locationLabels: Record<string, string>;
}

const defaultLabels: FamilyLabelsContextValue = {
  parent1Name: "Părinte 1",
  parent2Name: "Părinte 2",
  childName: "copilul",
  residenceNames: ["Tunari", "Otopeni"],
  parentLabels: { tata: "Părinte 1", mama: "Părinte 2", together: "Cu toții" },
  locationLabels: { tunari: "Tunari", otopeni: "Otopeni", other: "Alte locații" },
};

const FamilyLabelsContext = createContext<FamilyLabelsContextValue>(defaultLabels);

export function FamilyLabelsProvider({
  parent1Name,
  parent2Name,
  childName,
  residenceNames,
  children,
}: {
  parent1Name: string;
  parent2Name: string;
  childName: string;
  residenceNames: string[];
  children: React.ReactNode;
}) {
  const value: FamilyLabelsContextValue = {
    parent1Name,
    parent2Name,
    childName,
    residenceNames,
    parentLabels: {
      tata: parent1Name,
      mama: parent2Name,
      together: "Cu toții",
    },
    locationLabels: {
      tunari: residenceNames[0] ?? "Tunari",
      otopeni: residenceNames[1] ?? "Otopeni",
      other: "Alte locații",
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

/** Etichetă lungă pentru eveniment (folosește etichete din context) */
export function getEventDisplayLabelWithLabels(
  event: ScheduleEvent,
  labels: FamilyLabelsContextValue
): string {
  const parent = labels.parentLabels[event.parent];
  const loc =
    event.location === "other" && event.locationLabel?.trim()
      ? event.locationLabel.trim()
      : labels.locationLabels[event.location] ?? "Alte locații";
  return `${labels.childName} cu ${parent}, ${loc}`;
}

/** Etichetă scurtă pentru sumar săptămână (folosește etichete din context) */
export function getEventShortLabelWithLabels(
  event: ScheduleEvent,
  labels: FamilyLabelsContextValue
): string {
  const parent = labels.parentLabels[event.parent];
  const loc =
    event.location === "other" && event.locationLabel?.trim()
      ? event.locationLabel.trim()
      : labels.locationLabels[event.location] ?? "Alte locații";
  return `${parent} · ${loc}`;
}
