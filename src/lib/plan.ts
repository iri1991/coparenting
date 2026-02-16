import type { ObjectId } from "mongodb";
import type { PlanType } from "@/types/plan";
import { PLAN_LIMITS, PLAN_FEATURES } from "@/types/plan";

const DEFAULT_PLAN: PlanType = "free";

export type Db = Awaited<ReturnType<typeof import("@/lib/mongodb").getDb>>;

export async function getFamilyPlan(db: Db, familyId: ObjectId): Promise<PlanType> {
  const family = await db.collection("families").findOne(
    { _id: familyId },
    { projection: { plan: 1 } }
  );
  return getPlanFromFamily(family as { plan?: string | null } | null);
}

export function getPlanFromFamily(family: { plan?: string | null } | null): PlanType {
  const p = family?.plan;
  if (p === "pro" || p === "family") return p;
  return DEFAULT_PLAN;
}

export function getMaxChildren(plan: PlanType): number {
  return PLAN_LIMITS[plan].maxChildren;
}

export function getMaxBlockedDaysPerMonth(plan: PlanType): number {
  return PLAN_LIMITS[plan].maxBlockedDaysPerMonth;
}

export function getMaxResidences(plan: PlanType): number {
  return PLAN_LIMITS[plan].maxResidences;
}

export function canUseWeeklyProposal(plan: PlanType): boolean {
  return PLAN_FEATURES[plan].weeklyProposal;
}

export function canUseDocuments(plan: PlanType): boolean {
  return PLAN_FEATURES[plan].documents;
}

export function canUseMultipleLocations(plan: PlanType): boolean {
  return PLAN_FEATURES[plan].multipleLocations;
}

export function canUseChildProfileExtended(plan: PlanType): boolean {
  return PLAN_FEATURES[plan].childProfileExtended;
}

export function canUseExportPdf(plan: PlanType): boolean {
  return PLAN_FEATURES[plan].exportPdf;
}

/** -1 = nelimitat. */
export function isWithinLimit(plan: PlanType, limitKey: "maxChildren" | "maxResidences", currentCount: number): boolean {
  const max = PLAN_LIMITS[plan][limitKey];
  if (max === -1) return true;
  return currentCount < max;
}

/** Verifică dacă familia poate adăuga încă o perioadă blocată în luna curentă (Free: max 5/lună). */
export function canAddBlockedDayThisMonth(plan: PlanType, countThisMonth: number): boolean {
  const max = PLAN_LIMITS[plan].maxBlockedDaysPerMonth;
  if (max === -1) return true;
  return countThisMonth < max;
}
