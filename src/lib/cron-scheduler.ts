import { runEveningReminderJob, runWeeklyProposalJob, runRitualReminderJob, runTreatmentReminderJob, runActivityReminderJob, runInactivityReminderJob, runPendingInvitationReminderJob } from "@/lib/cron-jobs";

declare global {
  // eslint-disable-next-line no-var
  var __homesplitCronStarted: boolean | undefined;
  // eslint-disable-next-line no-var
  var __homesplitCronLastTickKey: string | undefined;
}

function getBucharestNowParts() {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: process.env.CRON_TIMEZONE || "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const pick = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
    hour: Number(pick("hour")),
    minute: Number(pick("minute")),
    weekday: pick("weekday").toLowerCase(), // "sun", "mon", ...
  };
}

export function startInternalCronScheduler() {
  if (globalThis.__homesplitCronStarted) return;
  globalThis.__homesplitCronStarted = true;

  const enabled = (process.env.INTERNAL_CRON_ENABLED ?? "true").toLowerCase() !== "false";
  if (!enabled) {
    console.log("[cron] internal scheduler disabled by INTERNAL_CRON_ENABLED=false");
    return;
  }

  const eveningHour = Number(process.env.EVENING_REMINDER_HOUR ?? 21);
  const weeklyHour = Number(process.env.WEEKLY_PROPOSAL_HOUR ?? 20);
  const inactivityHour = Number(process.env.INACTIVITY_REMINDER_HOUR ?? 10);
  const invitationReminderHour = Number(process.env.INVITATION_REMINDER_HOUR ?? 11);
  const tickMs = 30_000;

  const tick = async () => {
    const now = getBucharestNowParts();
    const key = `${now.year}-${now.month}-${now.day}-${now.hour}-${now.minute}`;
    if (globalThis.__homesplitCronLastTickKey === key) return;
    globalThis.__homesplitCronLastTickKey = key;

    const nowDate = `${now.year}-${now.month}-${now.day}`;
    const nowTimeLabel = `${String(now.hour).padStart(2, "0")}:${String(now.minute).padStart(2, "0")}`;

    try {
      const result = await runRitualReminderJob(nowTimeLabel, nowDate);
      if (result.remindersSent > 0) {
        console.log("[cron] ritual-reminder ok", result);
      }
    } catch (e) {
      console.error("[cron] ritual-reminder failed", e);
    }

    try {
      const result = await runTreatmentReminderJob(nowTimeLabel, nowDate);
      if (result.remindersSent > 0) {
        console.log("[cron] treatment-reminder ok", result);
      }
    } catch (e) {
      console.error("[cron] treatment-reminder failed", e);
    }

    try {
      const result = await runActivityReminderJob(nowTimeLabel, nowDate);
      if (result.remindersSent > 0) {
        console.log("[cron] activity-reminder ok", result);
      }
    } catch (e) {
      console.error("[cron] activity-reminder failed", e);
    }

    if (now.minute !== 0) return;

    try {
      if (now.hour === eveningHour) {
        const result = await runEveningReminderJob();
        console.log("[cron] evening-reminder ok", result);
      }
    } catch (e) {
      console.error("[cron] evening-reminder failed", e);
    }

    try {
      if (now.weekday === "sun" && now.hour === weeklyHour) {
        const result = await runWeeklyProposalJob();
        console.log("[cron] weekly-proposal ok", result);
      }
    } catch (e) {
      console.error("[cron] weekly-proposal failed", e);
    }

    try {
      if (now.hour === inactivityHour) {
        const result = await runInactivityReminderJob();
        if (result.emailSent > 0 || result.pushSent > 0) {
          console.log("[cron] inactivity-reminder ok", result);
        }
      }
    } catch (e) {
      console.error("[cron] inactivity-reminder failed", e);
    }

    try {
      if (now.hour === invitationReminderHour) {
        const result = await runPendingInvitationReminderJob();
        if (result.emailSent > 0) {
          console.log("[cron] invitation-reminder ok", result);
        }
      }
    } catch (e) {
      console.error("[cron] invitation-reminder failed", e);
    }
  };

  // Run one initial tick after startup, then periodic checks.
  setTimeout(() => {
    tick().catch((e) => console.error("[cron] initial tick failed", e));
  }, 5000);
  setInterval(() => {
    tick().catch((e) => console.error("[cron] tick failed", e));
  }, tickMs);

  console.log(
    `[cron] internal scheduler started (tz=${process.env.CRON_TIMEZONE || "Europe/Bucharest"}, evening=${eveningHour}:00, weekly=Sun ${weeklyHour}:00, inactivity=${inactivityHour}:00, invitation=${invitationReminderHour}:00)`
  );
}
