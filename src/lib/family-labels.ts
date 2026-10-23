/**
 * Etichete pentru evenimente pe server (notificări, jurnal, ICS), construite din datele
 * fiecărei familii: numele părinților, al copilului și al locuințelor.
 * Înlocuiește constantele implicite din types/events (PARENT_LABELS / LOCATION_LABELS).
 */
import type { ObjectId } from "mongodb";
import type { Db } from "@/lib/plan";
import type { LocationType, ParentType } from "@/types/events";
import { getFamilyResidences, resolveResidenceName, type ResidenceRef } from "@/lib/event-residences";

export interface FamilyEventLabels {
  childName: string;
  parentLabels: Record<ParentType, string>;
  residenceNames: string[];
  residences: ResidenceRef[];
}

export async function getFamilyEventLabels(db: Db, familyId: ObjectId): Promise<FamilyEventLabels> {
  const [family, child, residences] = await Promise.all([
    db.collection("families").findOne({ _id: familyId }, { projection: { parent1Name: 1, parent2Name: 1 } }),
    db.collection("children").findOne({ familyId }, { sort: { createdAt: 1 }, projection: { name: 1 } }),
    getFamilyResidences(db, familyId),
  ]);
  const f = (family ?? {}) as { parent1Name?: string; parent2Name?: string };
  return {
    childName: (child as { name?: string } | null)?.name?.trim() || "Copilul",
    parentLabels: {
      tata: f.parent1Name?.trim() || "Părinte 1",
      mama: f.parent2Name?.trim() || "Părinte 2",
      together: "Cu toții",
      other: "Alt responsabil",
    },
    residenceNames: residences.map((r) => r.name).filter(Boolean),
    residences,
  };
}

/** Numele locației: „tunari”/„otopeni” sunt sloturile primei/celei de-a doua locuințe ale familiei. */
export function locationName(
  location: LocationType | string,
  locationLabel: string | null | undefined,
  labels: Pick<FamilyEventLabels, "residenceNames"> & Partial<Pick<FamilyEventLabels, "residences">>,
  residenceId?: string | null
): string {
  const live = resolveResidenceName(residenceId, labels.residences ?? []);
  if (live) return live;
  if (location === "other") return locationLabel?.trim() || "Altă locație";
  if (location === "tunari") return labels.residenceNames[0] || "Locația 1";
  if (location === "otopeni") return labels.residenceNames[1] || "Locația 2";
  return String(location);
}

export function formatEventLabel(
  event: { parent: ParentType; location: LocationType; locationLabel?: string | null; caretakerLabel?: string | null; residenceId?: string | null },
  labels: FamilyEventLabels
): string {
  const parent =
    event.parent === "other" ? event.caretakerLabel?.trim() || labels.parentLabels.other : labels.parentLabels[event.parent];
  return `${labels.childName} cu ${parent}, ${locationName(event.location, event.locationLabel, labels, event.residenceId)}`;
}
