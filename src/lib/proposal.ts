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
 * Reguli:
 * - dacă un părinte e blocat, celălalt primește ziua;
 * - dacă ambii sunt liberi, alocăm în blocuri de 2-3 nopți/părinte (nu 1 cu 1).
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
  const blockList = (blocks as unknown as { userId: string; parentType: string; startDate: string; endDate: string }[]).map(
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

  // Heuristică stabilă pentru blocuri 2-3 nopți când ambii sunt disponibili.
  const seed = Number(weekStart.slice(-1)) % 2;
  let switchCount = 0;
  const nextStreakTarget = () => (((seed + switchCount) % 2 === 0) ? 2 : 3);
  let currentParent: ParentType | null = null;
  let streakCount = 0;
  let streakTarget = nextStreakTarget();

  for (let i = 0; i < 7; i++) {
    const d = addDays(new Date(weekStart + "T12:00:00"), i);
    const dateStr = format(d, "yyyy-MM-dd");

    const tataBlocked = isBlocked(dateStr, "tata");
    const mamaBlocked = isBlocked(dateStr, "mama");

    let parent: ParentType;
    if (tataBlocked && !mamaBlocked) {
      parent = "mama";
    } else if (!tataBlocked && mamaBlocked) {
      parent = "tata";
    } else if (tataBlocked && mamaBlocked) {
      // Caz rar: amândoi blocați -> păstrăm continuitatea pe părintele curent dacă există.
      parent = currentParent === "tata" || currentParent === "mama" ? currentParent : (i % 2 === 0 ? "tata" : "mama");
    } else {
      // Ambii disponibili: blocuri de 2-3 nopți înainte de switch.
      if (currentParent !== "tata" && currentParent !== "mama") {
        parent = i % 2 === 0 ? "tata" : "mama";
        streakCount = 1;
      } else if (streakCount >= streakTarget) {
        parent = currentParent === "tata" ? "mama" : "tata";
        switchCount += 1;
        streakTarget = nextStreakTarget();
        streakCount = 1;
      } else {
        parent = currentParent;
        streakCount += 1;
      }
    }

    if (parent !== currentParent) {
      currentParent = parent;
      // Dacă switch-ul vine din blocaje, țintim din nou blocuri 2-3 de aici înainte.
      streakCount = 1;
      streakTarget = nextStreakTarget();
    }

    const location = defaultLocation[parent];
    days.push({ date: dateStr, parent, location });
  }

  return days;
}
