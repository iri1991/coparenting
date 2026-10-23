import { isCronAuthorized } from "@/lib/cron-auth";
import { NextResponse } from "next/server";
import { runWeeklyProposalJob } from "@/lib/cron-jobs";

/**
 * Cron: rulează duminica (ex. 20:00 Romania).
 * Pentru fiecare familie cu 2 membri: generează propunerea pentru săptămâna următoare,
 * o salvează și notifică ambii părinți să o aprobe.
 * Protejat cu CRON_SECRET.
 */
export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const result = await runWeeklyProposalJob();
  return NextResponse.json(result);
}
