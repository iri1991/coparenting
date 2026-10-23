import { isCronAuthorized } from "@/lib/cron-auth";
import { NextResponse } from "next/server";
import { runPendingInvitationReminderJob } from "@/lib/cron-jobs";

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const result = await runPendingInvitationReminderJob();
  return NextResponse.json(result);
}
