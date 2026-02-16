import type { ObjectId } from "mongodb";
import type { Db } from "@/lib/plan";

/** Returnează familia doar dacă există și este activă (active !== false). */
export async function getActiveFamily(
  db: Db,
  familyId: ObjectId
): Promise<{ _id: ObjectId; plan?: string; memberIds?: string[]; active?: boolean; [key: string]: unknown } | null> {
  const doc = await db.collection("families").findOne({ _id: familyId });
  if (!doc) return null;
  const d = doc as { active?: boolean };
  if (d.active === false) return null;
  return doc as { _id: ObjectId; plan?: string; memberIds?: string[]; active?: boolean; [key: string]: unknown };
}
