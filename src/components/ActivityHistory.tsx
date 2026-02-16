"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import type { ActivityEntry, ActivityAction } from "@/lib/activity";
import { Calendar, UserPlus, Home, Users, FileText, Ban, CheckCircle } from "lucide-react";

/** Propoziție completă: [Cine] [acțiune] [detalii]. */
function fullActionSentence(
  userLabel: string,
  action: ActivityAction,
  payload: ActivityEntry["payload"]
): string {
  const who = userLabel.trim() || "Utilizator";
  switch (action) {
    case "event_created": {
      const d = payload.date && payload.label ? `${payload.date} – ${payload.label}` : payload.date || payload.label || "eveniment";
      return `${who} a adăugat evenimentul: ${d}.`;
    }
    case "event_updated": {
      const d = payload.date && payload.label ? `${payload.date} – ${payload.label}` : payload.date || payload.label || "eveniment";
      return `${who} a modificat evenimentul: ${d}.`;
    }
    case "event_deleted": {
      const d = payload.date || payload.label || "eveniment";
      return `${who} a șters evenimentul: ${d}.`;
    }
    case "child_added": {
      const n = typeof payload.name === "string" ? payload.name : "copil";
      return `${who} a adăugat copilul ${n}.`;
    }
    case "child_updated": {
      const n = typeof payload.name === "string" ? payload.name : "copil";
      return `${who} a actualizat datele copilului ${n}.`;
    }
    case "child_deleted": {
      const n = typeof payload.name === "string" ? payload.name : "copil";
      return `${who} a șters copilul ${n}.`;
    }
    case "residence_added": {
      const n = typeof payload.name === "string" ? payload.name : "locuință";
      return `${who} a adăugat locuința „${n}".`;
    }
    case "residence_deleted": {
      const n = typeof payload.name === "string" ? payload.name : "locuință";
      return `${who} a șters locuința „${n}".`;
    }
    case "family_updated":
      return `${who} a actualizat datele familiei.`;
    case "proposal_applied":
      return payload.weekLabel ? `${who} a aplicat programul pentru ${payload.weekLabel}.` : `${who} a aplicat programul săptămânii.`;
    case "member_joined":
      return `${who} s-a alăturat familiei.`;
    case "blocked_period_added":
      return payload.startDate && payload.endDate
        ? `${who} a adăugat perioada blocată ${payload.startDate} – ${payload.endDate}.`
        : `${who} a adăugat o perioadă blocată.`;
    case "blocked_period_deleted":
      return `${who} a șters o perioadă blocată.`;
    default:
      return `${who} – acțiune în aplicație.`;
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
          const sentence = fullActionSentence(entry.userLabel, entry.action, entry.payload);
          return (
            <li key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
              <span className="relative z-10 flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-600 shadow-sm">
                {iconForAction(entry.action)}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-stone-800 dark:text-stone-100 leading-snug">
                  {sentence}
                </p>
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
