import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import type { ContactBalance, ParentContact } from "@/types/contact-balance";

const NO_STORE_JSON = { "Cache-Control": "no-store, private, must-revalidate" } as const;
const DEFAULT_THRESHOLD_DAYS = 14;

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Diferența în zile între două date YYYY-MM-DD (b - a). */
function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T12:00:00Z").getTime();
  const db = new Date(b + "T12:00:00Z").getTime();
  return Math.round((db - da) / 86_400_000);
}

/**
 * GET: analiza echilibrului de contact per părinte (din schedule_events). Derivat,
 * fără colecție nouă. Semnalează discret când un părinte care avea contact a rămas
 * fără zile (trecut + viitor) peste prag — risc de înstrăinare.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401, headers: NO_STORE_JSON });
  }
  if (!session.user.familyId) {
    return NextResponse.json({ error: "Fără familie." }, { status: 400, headers: NO_STORE_JSON });
  }
  const db = await getDb();
  const familyId = new ObjectId(session.user.familyId);
  const family = await getActiveFamily(db, familyId);
  if (!family) {
    return NextResponse.json({ error: "Familie inactivă." }, { status: 403, headers: NO_STORE_JSON });
  }

  const { searchParams } = new URL(request.url);
  const thresholdDays = Math.min(Math.max(Number(searchParams.get("threshold")) || DEFAULT_THRESHOLD_DAYS, 3), 90);

  const today = ymd(new Date());

  async function analyze(parentType: "tata" | "mama"): Promise<ParentContact> {
    const [lastDoc, nextDoc] = await Promise.all([
      db
        .collection("schedule_events")
        .find({ familyId, parent: parentType, date: { $lte: today } }, { projection: { date: 1 } })
        .sort({ date: -1 })
        .limit(1)
        .toArray(),
      db
        .collection("schedule_events")
        .find({ familyId, parent: parentType, date: { $gt: today } }, { projection: { date: 1 } })
        .sort({ date: 1 })
        .limit(1)
        .toArray(),
    ]);

    const lastContactDate = (lastDoc[0] as { date?: string } | undefined)?.date ?? null;
    const nextContactDate = (nextDoc[0] as { date?: string } | undefined)?.date ?? null;
    const daysSinceLastContact = lastContactDate ? daysBetween(lastContactDate, today) : null;
    const daysUntilNext = nextContactDate ? daysBetween(today, nextContactDate) : null;

    // Alertă: a existat contact în trecut, dar pauza > prag ȘI nimic programat curând.
    const alert =
      lastContactDate !== null &&
      daysSinceLastContact !== null &&
      daysSinceLastContact > thresholdDays &&
      (daysUntilNext === null || daysUntilNext > thresholdDays);

    return {
      parentType,
      lastContactDate,
      daysSinceLastContact,
      nextContactDate,
      daysUntilNext,
      alert,
    };
  }

  const parents = await Promise.all([analyze("tata"), analyze("mama")]);
  const result: ContactBalance = {
    parents,
    thresholdDays,
    anyAlert: parents.some((p) => p.alert),
  };
  return NextResponse.json(result, { headers: NO_STORE_JSON });
}
