import type { FamilyHouseholdMode } from "@/types/family";

/** Valori persistate în DB sau din API; lipsă = comportament „două adrese”. */
export function resolveHouseholdMode(
  raw: FamilyHouseholdMode | string | undefined | null
): "together" | "two_households" {
  return raw === "together" ? "together" : "two_households";
}
