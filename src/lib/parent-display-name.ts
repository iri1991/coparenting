import type { Db } from "mongodb";

/**
 * Returnează numele afișat al părintelui pentru emailuri și istoric:
 * parent1Name / parent2Name din familie (dacă userul are parentType tata/mama),
 * altfel numele din profil sau partea din email înainte de @.
 */
export async function getParentDisplayName(
  db: Db,
  familyId: import("mongodb").ObjectId,
  userId: string,
  parentType?: string | null
): Promise<string> {
  const family = await db.collection("families").findOne(
    { _id: familyId },
    { projection: { parent1Name: 1, parent2Name: 1 } }
  );
  const f = family as { parent1Name?: string | null; parent2Name?: string | null } | null;
  const parent1Name = f?.parent1Name?.trim();
  const parent2Name = f?.parent2Name?.trim();
  if (parentType === "tata" && parent1Name) return parent1Name;
  if (parentType === "mama" && parent2Name) return parent2Name;
  const user = await db.collection("users").findOne(
    { _id: new (await import("mongodb")).ObjectId(userId) },
    { projection: { name: 1, email: 1 } }
  );
  const u = user as { name?: string | null; email?: string | null } | null;
  const name = u?.name?.trim();
  if (name) return name;
  const email = u?.email;
  if (email && typeof email === "string") return email.split("@")[0] || "Un părinte";
  return "Un părinte";
}
