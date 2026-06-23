import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import type { CoparentingScore, ScoreComponent } from "@/types/coparenting-score";

const NO_STORE_JSON = { "Cache-Control": "no-store, private, must-revalidate" } as const;

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * GET: scorul de co-parenting, derivat din date existente (program, mesaje, decizii,
 * cheltuieli). Non-judicativ față de aranjament — măsoară predictibilitate, contact
 * regulat, rezolvarea deciziilor și decontarea cheltuielilor.
 */
export async function GET() {
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

  const now = new Date();
  const today = ymd(now);
  const in14 = ymd(new Date(now.getTime() + 13 * 86_400_000));
  const since14 = new Date(now.getTime() - 14 * 86_400_000);

  const [events, msgCount, decisions, expenses] = await Promise.all([
    db
      .collection("schedule_events")
      .find({ familyId, date: { $gte: today, $lte: in14 } }, { projection: { date: 1 } })
      .toArray(),
    db.collection("messages").countDocuments({ familyId, createdAt: { $gte: since14 } }),
    db
      .collection("joint_decisions")
      .find({ familyId }, { projection: { status: 1 } })
      .toArray(),
    db
      .collection("shared_expenses")
      .find({ familyId }, { projection: { settled: 1 } })
      .toArray(),
  ]);

  // 1) Predictibilitate program: % din următoarele 14 zile cu cel puțin un eveniment.
  const plannedDays = new Set((events as { date?: string }[]).map((e) => e.date).filter(Boolean));
  const scheduleScore = clampScore((plannedDays.size / 14) * 100);

  // 2) Comunicare: mesaje în ultimele 14 zile (8+ = maxim).
  const communicationScore = clampScore((msgCount / 8) * 100);

  // 3) Decizii comune: % rezolvate (aprobate/declinate vs. în așteptare). Fără decizii → neutru 100.
  const totalDec = decisions.length;
  const resolvedDec = (decisions as { status?: string }[]).filter((d) => d.status && d.status !== "pending").length;
  const decisionsScore = totalDec === 0 ? 100 : clampScore((resolvedDec / totalDec) * 100);

  // 4) Cheltuieli decontate: % decontate. Fără cheltuieli → neutru 100.
  const totalExp = expenses.length;
  const settledExp = (expenses as { settled?: boolean }[]).filter((e) => e.settled === true).length;
  const expensesScore = totalExp === 0 ? 100 : clampScore((settledExp / totalExp) * 100);

  const components: ScoreComponent[] = [
    {
      key: "schedule",
      score: scheduleScore,
      detail: `${plannedDays.size} din 14 zile planificate`,
    },
    {
      key: "communication",
      score: communicationScore,
      detail: msgCount === 0 ? "niciun mesaj în 14 zile" : `${msgCount} mesaje în 14 zile`,
    },
    {
      key: "decisions",
      score: decisionsScore,
      detail: totalDec === 0 ? "nicio decizie în curs" : `${resolvedDec}/${totalDec} rezolvate`,
    },
    {
      key: "expenses",
      score: expensesScore,
      detail: totalExp === 0 ? "nicio cheltuială" : `${settledExp}/${totalExp} decontate`,
    },
  ];

  const overall = clampScore(components.reduce((s, c) => s + c.score, 0) / components.length);
  const hasData = plannedDays.size > 0 || msgCount > 0 || totalDec > 0 || totalExp > 0;

  const result: CoparentingScore = { overall, components, hasData };
  return NextResponse.json(result, { headers: NO_STORE_JSON });
}
