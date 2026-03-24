import { NextResponse } from "next/server";
import { runEveningReminderJob } from "@/lib/cron-jobs";

/**
 * Cron: rulează seara (ex. 21:00 Romania) și trimite notificări per familie
 * cu evenimentele de mâine (preluare / program).
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

  const result = await runEveningReminderJob();
  return NextResponse.json(result);
}
