"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import type { ActivityEntry, ActivityAction } from "@/lib/activity";
import { Calendar, UserPlus, Home, Users, FileText, Ban, CheckCircle } from "lucide-react";

const ACTION_LABELS: Record<ActivityAction, string> = {
  event_created: "A adăugat un eveniment",
  event_updated: "A modificat un eveniment",
  event_deleted: "A șters un eveniment",
  child_added: "A adăugat copilul",
  child_updated: "A actualizat copilul",
  child_deleted: "A șters copilul",
  residence_added: "A adăugat locuința",
  residence_deleted: "A șters locuința",
  family_updated: "A actualizat configurarea familiei",
  proposal_applied: "A aplicat programul săptămânii",
  member_joined: "S-a alăturat familiei",
  blocked_period_added: "A adăugat o perioadă blocată",
  blocked_period_deleted: "A șters o perioadă blocată",
};

function formatDetail(action: ActivityAction, payload: ActivityEntry["payload"]): string | null {
  if (action === "event_created" || action === "event_updated" || action === "event_deleted") {
    const parts: string[] = [];
    if (payload.date) parts.push(payload.date);
    if (payload.label) parts.push(payload.label);
    return parts.length ? parts.join(" – ") : null;
  }
  if (action === "child_added" || action === "child_updated" || action === "child_deleted") {
    return typeof payload.name === "string" ? payload.name : null;
  }
  if (action === "residence_added" || action === "residence_deleted") {
    return typeof payload.name === "string" ? payload.name : null;
  }
  if (action === "proposal_applied" && payload.weekLabel) {
    return String(payload.weekLabel);
  }
  return null;
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
      return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
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
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/activity?limit=80");
        if (!res.ok) throw new Error("Nu s-a putut încărca istoricul.");
        const data = await res.json();
        if (!cancelled) setEntries(data.entries ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Eroare la încărcare.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="py-8 text-center text-stone-500 dark:text-stone-400 text-sm">
        Se încarcă istoricul…
      </div>
    );
  }
  if (error) {
    return (
      <div className="py-8 text-center text-red-600 dark:text-red-400 text-sm">
        {error}
      </div>
    );
  }
  if (entries.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-stone-500 dark:text-stone-400 text-sm">
          Încă nu există acțiuni în istoric. Modificările făcute de tine și de celălalt părinte vor apărea aici.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* linie verticală */}
      <div
        className="absolute left-5 top-0 bottom-0 w-px bg-stone-200 dark:bg-stone-700"
        aria-hidden
      />
      <ul className="space-y-0">
        {entries.map((entry) => {
          const detail = formatDetail(entry.action, entry.payload);
          return (
            <li key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
              <span className="relative z-10 flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-600 shadow-sm">
                {iconForAction(entry.action)}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-stone-800 dark:text-stone-100">
                  <span className="text-amber-700 dark:text-amber-300">{entry.userLabel}</span>
                  {" · "}
                  {ACTION_LABELS[entry.action] ?? entry.action}
                </p>
                {detail && (
                  <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400 truncate">
                    {detail}
                  </p>
                )}
                <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                  {format(parseISO(entry.createdAt), "d MMM yyyy, HH:mm", { locale: ro })}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
