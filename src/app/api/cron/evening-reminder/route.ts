import { isCronAuthorized } from "@/lib/cron-auth";
import { NextResponse } from "next/server";
import { runEveningReminderJob } from "@/lib/cron-jobs";

/**
 * Cron: rulează seara (ex. 21:00 Romania) și trimite notificări per familie
 * cu evenimentele de mâine (preluare / program).
 * Protejat cu CRON_SECRET.
 */
export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const result = await runEveningReminderJob();
  return NextResponse.json(result);
}
