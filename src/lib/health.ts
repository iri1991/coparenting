import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import type {
  ChildHealthCondition,
  ChildMedicalReportRef,
  ChildTreatmentAdministration,
  ChildTreatmentPlan,
  HealthResponsibleParent,
  TreatmentRecurrenceType,
} from "@/types/health";

export interface HealthContext {
  db: Awaited<ReturnType<typeof getDb>>;
  familyId: ObjectId;
  userId: string;
}

export async function getHealthContext(userId: string): Promise<HealthContext | null> {
  const db = await getDb();
  const user = await db.collection("users").findOne(
    { _id: new ObjectId(userId) },
    { projection: { familyId: 1 } }
  );
  const rawFamilyId = (user as { familyId?: unknown } | null)?.familyId;
  if (!rawFamilyId) return null;
  let familyId: ObjectId;
  try {
    familyId = new ObjectId(String(rawFamilyId));
  } catch {
    return null;
  }
  const family = await getActiveFamily(db, familyId);
  if (!family) return null;
  const members = (family.memberIds ?? []).map(String);
  if (!members.includes(userId)) return null;
  return { db, familyId, userId };
}

export async function ensureChildInFamily(
  db: Awaited<ReturnType<typeof getDb>>,
  familyId: ObjectId,
  childIdRaw: string
): Promise<ObjectId | null> {
  let childId: ObjectId;
  try {
    childId = new ObjectId(childIdRaw);
  } catch {
    return null;
  }
  const child = await db.collection("children").findOne({ _id: childId, familyId }, { projection: { _id: 1 } });
  if (!child) return null;
  return childId;
}

export function isValidYmd(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isValidHhMm(value: string): boolean {
  return /^\d{2}:\d{2}$/.test(value);
}

export function diffDaysYmd(startYmd: string, currentYmd: string): number {
  const start = new Date(`${startYmd}T00:00:00`);
  const current = new Date(`${currentYmd}T00:00:00`);
  const diff = current.getTime() - start.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}

export function isPlanActiveOnDate(
  plan: Pick<ChildTreatmentPlan, "startDate" | "endDate" | "recurrenceType" | "recurrenceIntervalDays">,
  ymd: string
): boolean {
  if (plan.startDate > ymd) return false;
  if (plan.endDate && plan.endDate < ymd) return false;
  if (plan.recurrenceType === "interval") {
    const interval = Math.max(1, plan.recurrenceIntervalDays ?? 1);
    const days = diffDaysYmd(plan.startDate, ymd);
    if (days < 0) return false;
    return days % interval === 0;
  }
  return true;
}

export function toCondition(doc: {
  _id: unknown;
  childId: unknown;
  title: string;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ChildHealthCondition {
  const startDate = typeof doc.startDate === "string" && isValidYmd(doc.startDate) ? doc.startDate : "1970-01-01";
  return {
    id: String(doc._id),
    childId: String(doc.childId),
    title: doc.title,
    startDate,
    endDate: typeof doc.endDate === "string" && isValidYmd(doc.endDate) ? doc.endDate : undefined,
    status: doc.status === "resolved" ? "resolved" : "active",
    notes: doc.notes?.trim() || undefined,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toPlan(doc: {
  _id: unknown;
  childId: unknown;
  conditionId?: unknown;
  medicationName: string;
  dosage: string;
  instructions?: string | null;
  startDate: string;
  endDate?: string | null;
  times?: string[] | null;
  recurrenceType?: string | null;
  recurrenceIntervalDays?: number | null;
  reminderLeadMinutes?: number | null;
  responsibleParent?: string | null;
  active?: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ChildTreatmentPlan {
  const times = Array.isArray(doc.times) ? doc.times.filter((t) => typeof t === "string" && isValidHhMm(t)) : [];
  const lead =
    typeof doc.reminderLeadMinutes === "number" && Number.isFinite(doc.reminderLeadMinutes)
      ? Math.max(0, Math.floor(doc.reminderLeadMinutes))
      : 0;
  const resp: HealthResponsibleParent =
    doc.responsibleParent === "tata" || doc.responsibleParent === "mama" || doc.responsibleParent === "both"
      ? doc.responsibleParent
      : "both";
  const recurrenceType: TreatmentRecurrenceType = doc.recurrenceType === "interval" ? "interval" : "daily";
  const recurrenceIntervalDays =
    recurrenceType === "interval" && typeof doc.recurrenceIntervalDays === "number" && Number.isFinite(doc.recurrenceIntervalDays)
      ? Math.max(1, Math.floor(doc.recurrenceIntervalDays))
      : undefined;
  return {
    id: String(doc._id),
    childId: String(doc.childId),
    conditionId: doc.conditionId ? String(doc.conditionId) : undefined,
    medicationName: doc.medicationName,
    dosage: doc.dosage,
    instructions: doc.instructions?.trim() || undefined,
    startDate: doc.startDate,
    endDate: doc.endDate?.trim() || undefined,
    times,
    recurrenceType,
    recurrenceIntervalDays,
    reminderLeadMinutes: lead,
    responsibleParent: resp,
    active: doc.active !== false,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toAdministration(doc: {
  _id: unknown;
  childId: unknown;
  planId: unknown;
  date: string;
  timeLabel: string;
  status?: string | null;
  notes?: string | null;
  administeredByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}): ChildTreatmentAdministration {
  return {
    id: String(doc._id),
    childId: String(doc.childId),
    planId: String(doc.planId),
    date: doc.date,
    timeLabel: doc.timeLabel,
    status: doc.status === "skipped" ? "skipped" : "done",
    notes: doc.notes?.trim() || undefined,
    administeredByUserId: doc.administeredByUserId,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toMedicalReport(doc: {
  _id: unknown;
  childId: unknown;
  conditionId?: unknown;
  name: string;
  contentType: string;
  createdAt: Date;
}): ChildMedicalReportRef {
  return {
    id: String(doc._id),
    childId: String(doc.childId),
    conditionId: doc.conditionId ? String(doc.conditionId) : undefined,
    name: doc.name,
    contentType: doc.contentType,
    createdAt: doc.createdAt.toISOString(),
  };
}
