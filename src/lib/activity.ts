import type { Db } from "mongodb";

const COLLECTION = "family_activity";

export type ActivityAction =
  | "event_created"
  | "event_updated"
  | "event_deleted"
  | "child_added"
  | "child_updated"
  | "child_deleted"
  | "residence_added"
  | "residence_deleted"
  | "family_updated"
  | "proposal_applied"
  | "member_joined"
  | "blocked_period_added"
  | "blocked_period_deleted";

export interface ActivityPayload {
  date?: string;
  label?: string;
  name?: string;
  weekLabel?: string;
  [key: string]: unknown;
}

/**
 * Înregistrează o acțiune în istoricul familiei. Nu aruncă – doar loghează erori.
 */
export async function logFamilyActivity(
  db: Db,
  familyId: import("mongodb").ObjectId,
  userId: string,
  userLabel: string,
  action: ActivityAction,
  payload?: ActivityPayload
): Promise<void> {
  try {
    await db.collection(COLLECTION).insertOne({
      familyId,
      userId,
      userLabel: userLabel.trim() || "Utilizator",
      action,
      payload: payload ?? {},
      createdAt: new Date(),
    });
  } catch (e) {
    console.error("[activity] log failed", e);
  }
}

export interface ActivityEntry {
  id: string;
  userId: string;
  userLabel: string;
  action: ActivityAction;
  payload: ActivityPayload;
  createdAt: string;
}

/**
 * Returnează ultimele N intrări de activitate pentru familie.
 */
export async function getFamilyActivity(
  db: Db,
  familyId: import("mongodb").ObjectId,
  limit: number = 80
): Promise<ActivityEntry[]> {
  const docs = await db
    .collection(COLLECTION)
    .find({ familyId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map((d) => {
    const doc = d as unknown as {
      _id: import("mongodb").ObjectId;
      userId: string;
      userLabel: string;
      action: ActivityAction;
      payload: ActivityPayload;
      createdAt: Date;
    };
    return {
      id: String(doc._id),
      userId: doc.userId,
      userLabel: doc.userLabel,
      action: doc.action,
      payload: doc.payload ?? {},
      createdAt: doc.createdAt.toISOString(),
    };
  });
}
