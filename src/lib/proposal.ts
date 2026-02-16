import { addDays, format, startOfWeek } from "date-fns";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { ParentType, LocationType } from "@/types/events";
import type { ProposalDay } from "@/types/proposal";

/** Luni = 1. Returnează lunea săptămânii următoare. */
export function getNextMonday(): Date {
  const today = new Date();
  const thisMonday = startOfWeek(today, { weekStartsOn: 1 });
  return addDays(thisMonday, 7);
}

function isDateInBlock(dateStr: string, startDate: string, endDate: string): boolean {
  return dateStr >= startDate && dateStr <= endDate;
}

/**
 * Generează propunerea de program pentru săptămâna care începe la weekStart (Luni),
 * pe baza zilelor blocate ale fiecărui părinte.
 * Reguli: dacă un părinte e blocat, celălalt primește ziua; dacă amândoi liberi, alternăm.
 */
export async function generateProposalForWeek(
  familyId: ObjectId,
  weekStart: string
): Promise<ProposalDay[]> {
  const db = await getDb();
  const family = await db.collection("families").findOne(
    { _id: familyId },
    { projection: { memberIds: 1 } }
  );
  if (!family) return [];
  const memberIds = (family as { memberIds?: string[] }).memberIds ?? [];
  if (memberIds.length < 2) return [];

  const users = await db
    .collection("users")
    .find({ _id: { $in: memberIds.map((id) => new ObjectId(id)) } })
    .project({ _id: 1, parentType: 1 })
    .toArray();

  const userIdByParent = new Map<ParentType, string>();
  for (const u of users as { _id: unknown; parentType?: string }[]) {
    const pt = u.parentType as ParentType | undefined;
    if (pt === "tata" || pt === "mama") userIdByParent.set(pt, String(u._id));
  }
  const tataId = userIdByParent.get("tata");
  const mamaId = userIdByParent.get("mama");
  if (!tataId || !mamaId) return [];

  const blocks = await db
    .collection("blocked_periods")
    .find({ familyId })
    .toArray();
  const blockList = (blocks as { userId: string; parentType: string; startDate: string; endDate: string }[]).map(
    (b) => ({ userId: b.userId, parentType: b.parentType, startDate: b.startDate, endDate: b.endDate })
  );

  const isBlocked = (dateStr: string, parent: ParentType): boolean => {
    const uid = parent === "tata" ? tataId : mamaId;
    return blockList.some(
      (b) => b.userId === uid && b.parentType === parent && isDateInBlock(dateStr, b.startDate, b.endDate)
    );
  };

  const days: ProposalDay[] = [];
  const defaultLocation: Record<ParentType, LocationType> = {
    tata: "tunari",
    mama: "otopeni",
    together: "other",
  };

  for (let i = 0; i < 7; i++) {
    const d = addDays(new Date(weekStart + "T12:00:00"), i);
    const dateStr = format(d, "yyyy-MM-dd");

    const tataBlocked = isBlocked(dateStr, "tata");
    const mamaBlocked = isBlocked(dateStr, "mama");

    let parent: ParentType;
    if (tataBlocked && !mamaBlocked) parent = "mama";
    else if (!tataBlocked && mamaBlocked) parent = "tata";
    else if (tataBlocked && mamaBlocked) parent = i % 2 === 0 ? "tata" : "mama";
    else parent = i % 2 === 0 ? "tata" : "mama";

    const location = defaultLocation[parent];
    days.push({ date: dateStr, parent, location });
  }

  return days;
}
