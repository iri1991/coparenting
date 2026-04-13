"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import { enGB } from "date-fns/locale";
import type { ActivityEntry, ActivityAction } from "@/lib/activity";
import { Calendar, UserPlus, Home, Users, FileText, Ban, CheckCircle, Link2, Pencil } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { inter } from "@/lib/i18n/interpolate";
import type { Translations } from "@/lib/i18n";

type ActionT = Translations["app"]["history"]["actions"];

function fullActionSentence(
  userLabel: string,
  action: ActivityAction,
  payload: ActivityEntry["payload"],
  a: ActionT
): string {
  const who = userLabel.trim() || a.userFallback;
  switch (action) {
    case "event_created": {
      const detail =
        payload.date && payload.label
          ? `${payload.date} – ${payload.label}`
          : payload.date || payload.label || a.event;
      return inter(a.eventAdded, { who, detail });
    }
    case "event_updated": {
      const d =
        payload.date && payload.label
          ? `${payload.date} – ${payload.label}`
          : payload.date || payload.label || a.event;
      const changes = Array.isArray(payload.changes)
        ? payload.changes.filter((c): c is string => typeof c === "string" && c.trim().length > 0)
        : [];
      const reason = typeof payload.reason === "string" ? payload.reason.trim() : "";
      const pastTag = payload.wasPastEvent ? a.pastSuffix : "";
      const changeText = changes.length > 0 ? ` ${a.changesPrefix}${changes.join("; ")}.` : "";
      const reasonText = reason ? ` ${a.reasonPrefix}${reason}.` : "";
      return inter(a.eventUpdated, { who, detail: d, pastTag, changeText, reasonText });
    }
    case "event_deleted": {
      const detail = payload.date || payload.label || a.event;
      return inter(a.eventDeleted, { who, detail });
    }
    case "child_added": {
      const name = typeof payload.name === "string" ? payload.name : a.child;
      return inter(a.childAdded, { who, name });
    }
    case "child_updated": {
      const name = typeof payload.name === "string" ? payload.name : a.child;
      return inter(a.childUpdated, { who, name });
    }
    case "child_deleted": {
      const name = typeof payload.name === "string" ? payload.name : a.child;
      return inter(a.childDeleted, { who, name });
    }
    case "residence_added": {
      const name = typeof payload.name === "string" ? payload.name : a.residence;
      return inter(a.residenceAdded, { who, name });
    }
    case "residence_deleted": {
      const name = typeof payload.name === "string" ? payload.name : a.residence;
      return inter(a.residenceDeleted, { who, name });
    }
    case "family_updated":
      return inter(a.familyUpdated, { who });
    case "proposal_applied": {
      const week = typeof payload.weekLabel === "string" ? payload.weekLabel : "";
      return week
        ? inter(a.proposalAppliedWeek, { who, week })
        : inter(a.proposalApplied, { who });
    }
    case "proposal_approved": {
      const week = typeof payload.weekLabel === "string" ? payload.weekLabel : "";
      return week
        ? inter(a.proposalApprovedWeek, { who, week })
        : inter(a.proposalApproved, { who });
    }
    case "proposal_updated": {
      const week = typeof payload.weekLabel === "string" ? payload.weekLabel : "";
      return week
        ? inter(a.proposalUpdatedWeek, { who, week })
        : inter(a.proposalUpdated, { who });
    }
    case "child_activity_added": {
      const name = typeof payload.name === "string" ? payload.name : a.activity;
      const actDate = typeof payload.date === "string" ? payload.date : "";
      return actDate
        ? inter(a.activityAddedDate, { who, name, date: actDate })
        : inter(a.activityAdded, { who, name });
    }
    case "useful_link_added": {
      const name = typeof payload.name === "string" ? payload.name : a.material;
      return inter(a.linkAdded, { who, name });
    }
    case "useful_link_deleted":
      return inter(a.linkDeleted, { who });
    case "member_joined":
      return inter(a.memberJoined, { who });
    case "blocked_period_added": {
      const start = typeof payload.startDate === "string" ? payload.startDate : "";
      const end = typeof payload.endDate === "string" ? payload.endDate : "";
      return start && end
        ? inter(a.blockedAddedRange, { who, start, end })
        : inter(a.blockedAdded, { who });
    }
    case "blocked_period_deleted":
      return inter(a.blockedDeleted, { who });
    default:
      return inter(a.generic, { who });
  }
}

function iconForAction(action: ActivityAction) {
  switch (action) {
    case "event_created":
    case "event_updated":
    case "event_deleted":
      return <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    case "child_added":
    case "child_updated":
    case "child_deleted":
      return <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    case "residence_added":
    case "residence_deleted":
      return <Home className="w-4 h-4 text-stone-600 dark:text-stone-400" />;
    case "family_updated":
      return <FileText className="w-4 h-4 text-stone-600 dark:text-stone-400" />;
    case "proposal_applied":
    case "proposal_approved":
      return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
    case "proposal_updated":
      return <Pencil className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    case "child_activity_added":
      return <Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />;
    case "useful_link_added":
    case "useful_link_deleted":
      return <Link2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
    case "member_joined":
      return <UserPlus className="w-4 h-4 text-green-600 dark:text-green-400" />;
    case "blocked_period_added":
    case "blocked_period_deleted":
      return <Ban className="w-4 h-4 text-red-500" />;
    default:
      return <FileText className="w-4 h-4 text-stone-500" />;
  }
}

export function ActivityHistory() {
  const { t, lang } = useLanguage();
  const h = t.app.history;
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/activity?limit=80");
        if (!res.ok) throw new Error(h.error);
        const data = await res.json();
        if (!cancelled) setEntries(data.entries ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : h.fetchError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [h.error, h.fetchError]);

  if (loading) {
    return <div className="py-8 text-center text-stone-500 text-sm">{h.loading}</div>;
  }
  if (error) {
    return (
      <div className="py-8 text-center text-red-600 text-sm">
        {error}
      </div>
    );
  }
  if (entries.length === 0) {
    return <div className="py-12 text-center"><p className="text-stone-500 text-sm">{h.empty}</p></div>;
  }

  const dateLocale = lang === "en" ? enGB : ro;

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-px bg-stone-200 dark:bg-stone-700" aria-hidden />
      <ul className="space-y-0">
        {entries.map((entry) => {
          const sentence = fullActionSentence(entry.userLabel, entry.action, entry.payload, h.actions);
          return (
            <li key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
              <span className="relative z-10 flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-stone-900 border-2 border-stone-200 shadow-sm">
                {iconForAction(entry.action)}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-stone-800 leading-snug">{sentence}</p>
                <p className="mt-1 text-xs text-stone-400">
                  {format(parseISO(entry.createdAt), "d MMM yyyy, HH:mm", { locale: dateLocale })}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
