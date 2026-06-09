import { NextResponse } from "next/server";
import { runPendingInvitationReminderJob } from "@/lib/cron-jobs";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const vercelCronHeader = request.headers.get("x-vercel-cron");
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret");
  const isVercelCron = vercelCronHeader === "1";
  const isSecretValid = !!secret && (authHeader === `Bearer ${secret}` || querySecret === secret);
  if (!isVercelCron && !isSecretValid) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const result = await runPendingInvitationReminderJob();
  return NextResponse.json(result);
}
