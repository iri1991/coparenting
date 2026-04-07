import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import type {
  ChildHealthCondition,
  ChildMedicalReportRef,
  ChildTreatmentAdministration,
  ChildTreatmentPlan,
  HealthResponsibleParent,
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

export function toCondition(doc: {
  _id: unknown;
  childId: unknown;
  title: string;
  diagnosedAt?: string | null;
  status?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ChildHealthCondition {
  return {
    id: String(doc._id),
    childId: String(doc.childId),
    title: doc.title,
    diagnosedAt: typeof doc.diagnosedAt === "string" ? doc.diagnosedAt : undefined,
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
  name: string;
  contentType: string;
  createdAt: Date;
}): ChildMedicalReportRef {
  return {
    id: String(doc._id),
    childId: String(doc.childId),
    name: doc.name,
    contentType: doc.contentType,
    createdAt: doc.createdAt.toISOString(),
  };
}
