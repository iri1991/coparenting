import { NextResponse } from "next/server";
import { requireAdminApi, logAdminAction } from "@/lib/admin";
import {
  runEveningReminderJob,
  runInactivityReminderJob,
  runPendingInvitationReminderJob,
  runWeeklyProposalJob,
} from "@/lib/cron-jobs";

const JOBS = {
  "weekly-proposal": { label: "Propuneri săptămânale", run: runWeeklyProposalJob },
  "evening-reminder": { label: "Reminder de seară", run: runEveningReminderJob },
  "inactivity-reminder": { label: "Reminder inactivitate", run: runInactivityReminderJob },
  "invitation-reminder": { label: "Reminder invitații", run: runPendingInvitationReminderJob },
} as const;

/** POST { job }: rulează manual un job programat. */
export async function POST(request: Request) {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;
  const body = await request.json().catch(() => ({}));
  const job = JOBS[body.job as keyof typeof JOBS];
  if (!job) return NextResponse.json({ error: "Job necunoscut." }, { status: 400 });
  try {
    const result = await job.run();
    await logAdminAction(session, `Job rulat manual: ${job.label}`, { type: "system" }, { result: result as unknown as Record<string, unknown> });
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    console.error("[admin] cron job failed", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Jobul a eșuat." }, { status: 500 });
  }
}
