import { NextResponse } from "next/server";
import { runTreatmentReminderJob } from "@/lib/cron-jobs";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const vercelCronHeader = request.headers.get("x-vercel-cron");
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret");
  const isVercelCron = vercelCronHeader === "1";
  const isSecretValid = !!secret && (authHeader === `Bearer ${secret}` || querySecret === secret);
  if (!(isVercelCron || isSecretValid)) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const now = new Date();
  const date = now.toLocaleDateString("en-CA", { timeZone: "Europe/Bucharest" });
  const hh = now.toLocaleTimeString("en-GB", {
    timeZone: "Europe/Bucharest",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const result = await runTreatmentReminderJob(hh, date);
  return NextResponse.json(result);
}
