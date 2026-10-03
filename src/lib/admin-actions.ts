/**
 * Operații de admin reutilizate de mai multe rute.
 */
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

/** Scoate un utilizator din familie (memberIds + user.familyId). Dezactivează familia dacă rămâne goală. */
export async function removeUserFromFamily(userId: string, familyId: ObjectId): Promise<{ familyDeactivated: boolean }> {
  const db = await getDb();
  const now = new Date();
  await db.collection("families").updateOne(
    { _id: familyId },
    { $pull: { memberIds: userId } as never, $set: { updatedAt: now } }
  );
  if (ObjectId.isValid(userId)) {
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId), familyId },
      { $unset: { familyId: "" }, $set: { updatedAt: now } }
    );
  }
  const fam = await db.collection("families").findOne({ _id: familyId }, { projection: { memberIds: 1, active: 1 } });
  const remaining = ((fam as { memberIds?: string[] } | null)?.memberIds ?? []).length;
  if (fam && remaining === 0 && (fam as { active?: boolean }).active !== false) {
    await db.collection("families").updateOne({ _id: familyId }, { $set: { active: false, updatedAt: now } });
    return { familyDeactivated: true };
  }
  return { familyDeactivated: false };
}
