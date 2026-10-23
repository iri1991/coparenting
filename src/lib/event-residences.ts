/**
 * Legarea evenimentelor de locuințe printr-un ID stabil (`residenceId`).
 *
 * Istoric, locația unui eveniment era un „slot”: `tunari` = prima locuință, `otopeni` = a doua,
 * `other` = text liber. Slotul depinde de ordinea locuințelor, deci ștergerea / reordonarea lor
 * schimba locația evenimentelor vechi. Acum evenimentul ține `residenceId` + `locationLabel`
 * (numele locuinței la momentul salvării, ca rezervă) și `location: "other"`.
 *
 * `ensureEventResidenceIds` convertește evenimentele încă pe sloturi, folosind ordinea curentă a
 * locuințelor. E idempotentă și ieftină (câteva updateMany), deci se apelează înainte de orice
 * citire a evenimentelor și obligatoriu înainte de a modifica locuințele.
 */
import type { ObjectId } from "mongodb";
import type { Db } from "@/lib/plan";

export interface ResidenceRef {
  id: string;
  name: string;
}

export async function getFamilyResidences(db: Db, familyId: ObjectId): Promise<ResidenceRef[]> {
  const docs = await db.collection("residences").find({ familyId }).sort({ order: 1, createdAt: 1 }).project({ name: 1 }).toArray();
  return docs.map((d) => ({ id: String(d._id), name: String((d as { name?: string }).name ?? "").trim() }));
}

export async function ensureEventResidenceIds(db: Db, familyId: ObjectId, residences?: ResidenceRef[]): Promise<void> {
  const list = residences ?? (await getFamilyResidences(db, familyId));
  const events = db.collection("schedule_events");
  const noResidence = { $or: [{ residenceId: { $exists: false } }, { residenceId: null }] };

  // Evenimente foarte vechi: doar `type` ("tunari" / "otopeni"), fără parent/location.
  await Promise.all([
    events.updateMany({ familyId, parent: { $exists: false }, type: "tunari" }, { $set: { parent: "tata", location: "tunari" } }),
    events.updateMany({ familyId, parent: { $exists: false }, type: "otopeni" }, { $set: { parent: "mama", location: "otopeni" } }),
  ]);

  const ops: Promise<unknown>[] = [];
  const slots: [string, ResidenceRef | undefined][] = [
    ["tunari", list[0]],
    ["otopeni", list[1]],
  ];
  for (const [slot, res] of slots) {
    if (!res) continue;
    ops.push(
      events.updateMany(
        { familyId, location: slot, ...noResidence },
        { $set: { location: "other", locationLabel: res.name, residenceId: res.id } }
      )
    );
  }
  // Locație scrisă de mână identică cu numele unei locuințe (inclusiv locuințele 3+ salvate așa).
  for (const res of list) {
    if (!res.name) continue;
    ops.push(
      events.updateMany(
        { familyId, location: "other", locationLabel: res.name, ...noResidence },
        { $set: { residenceId: res.id } }
      )
    );
  }
  await Promise.all(ops);
}

/** Numele afișat al locației: locuința curentă după ID, altfel eticheta salvată. */
export function resolveResidenceName(
  residenceId: string | null | undefined,
  residences: ResidenceRef[]
): string | null {
  if (!residenceId) return null;
  return residences.find((r) => r.id === residenceId)?.name || null;
}
