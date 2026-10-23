import { isCronAuthorized } from "@/lib/cron-auth";
import { NextResponse } from "next/server";
import { runInactivityReminderJob } from "@/lib/cron-jobs";

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const result = await runInactivityReminderJob();
  return NextResponse.json(result);
}
