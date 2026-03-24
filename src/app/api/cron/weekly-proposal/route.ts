import { NextResponse } from "next/server";
import { runWeeklyProposalJob } from "@/lib/cron-jobs";

/**
 * Cron: rulează duminica (ex. 20:00 Romania).
 * Pentru fiecare familie cu 2 membri: generează propunerea pentru săptămâna următoare,
 * o salvează și notifică ambii părinți să o aprobe.
 * Protejat cu CRON_SECRET.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const vercelCronHeader = request.headers.get("x-vercel-cron");
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret");
  const isVercelCron = vercelCronHeader === "1";
  const isSecretValid =
    !!secret && (authHeader === `Bearer ${secret}` || querySecret === secret);
  const ok = isVercelCron || isSecretValid;
  if (!ok) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const result = await runWeeklyProposalJob();
  return NextResponse.json(result);
}
