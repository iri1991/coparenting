"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import type { WeekProposal } from "@/types/proposal";
import { UpgradeCta } from "@/components/UpgradeCta";

interface ProposalResponse {
  proposal: (WeekProposal & {
    weekLabel: string;
    myApproved: boolean;
    otherApproved: boolean;
    parentLabels: Record<string, string>;
  }) | null;
  plan?: string;
  upgradeMessage?: string;
}

interface WeeklyProposalCardProps {
  onApplied?: () => void;
}

export function WeeklyProposalCard({ onApplied }: WeeklyProposalCardProps) {
  const [data, setData] = useState<ProposalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editableDays, setEditableDays] = useState<WeekProposal["days"]>([]);

  const fetchProposal = useCallback(async () => {
    try {
      const res = await fetch("/api/proposals/current");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setData({ proposal: null });
      }
    } catch {
      setData({ proposal: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposal();
  }, [fetchProposal]);

  async function handleApprove() {
    if (!data?.proposal || approving) return;
    setApproving(true);
    try {
      const res = await fetch("/api/proposals/approve", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        if (json.applied) onApplied?.();
        await fetchProposal();
      } else {
        alert(json.error || "Nu s-a putut aproba.");
      }
    } finally {
      setApproving(false);
    }
  }

  function startEdit() {
    if (!data?.proposal) return;
    setEditableDays(data.proposal.days.map((d) => ({ ...d })));
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setEditableDays([]);
  }

  function cycleParent(idx: number) {
    setEditableDays((prev) =>
      prev.map((d, i) => {
        if (i !== idx) return d;
        const nextParent = d.parent === "tata" ? "mama" : d.parent === "mama" ? "together" : "tata";
        const nextLocation = nextParent === "tata" ? "tunari" : nextParent === "mama" ? "otopeni" : "other";
        return { ...d, parent: nextParent, location: nextLocation };
      })
    );
  }

  async function saveEdit() {
    if (!data?.proposal) return;
    setSavingEdit(true);
    try {
      const res = await fetch("/api/proposals/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: editableDays }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json.error || "Nu s-a putut salva modificarea.");
        return;
      }
      setEditing(false);
      await fetchProposal();
      alert("Propunerea a fost actualizată. Aprobările au fost resetate și trebuie reconfirmată.");
    } finally {
      setSavingEdit(false);
    }
  }

  if (loading || !data) return null;
  const proposal = data.proposal;
  if (!proposal && data.upgradeMessage) {
    return (
      <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30 p-4">
        <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-1">Propunere program săptămână</h3>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">{data.upgradeMessage}</p>
        <p className="text-xs text-stone-500 dark:text-stone-500 mb-3">Planul Pro include propunerea automată în fiecare duminică.</p>
        <UpgradeCta variant="button" />
      </div>
    );
  }
  if (!proposal) return null;

  const { weekLabel, days, myApproved, otherApproved, parentLabels } = proposal;
  const renderDays = editing ? editableDays : days;

  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30 p-4">
      <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-1">
        Propunere program săptămâna următoare
      </h3>
      <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">{weekLabel}</p>
      <ul className="space-y-1.5 mb-4">
        {renderDays.map((day, idx) => (
          <li
            key={day.date}
            className="flex items-center justify-between text-sm text-stone-700 dark:text-stone-300"
          >
            <span className="font-medium">
              {format(new Date(day.date + "T12:00:00"), "EEEE, d MMM", { locale: ro })}
            </span>
            {editing ? (
              <button
                type="button"
                onClick={() => cycleParent(idx)}
                className="rounded-lg border border-stone-300 dark:border-stone-600 px-2 py-1 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
                title="Apasă pentru a schimba: tata → mama → cu toții"
              >
                {parentLabels[day.parent] ?? day.parent}
              </button>
            ) : (
              <span>{parentLabels[day.parent] ?? day.parent}</span>
            )}
          </li>
        ))}
      </ul>
      {editing ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={cancelEdit}
            disabled={savingEdit}
            className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-50"
          >
            Renunță
          </button>
          <button
            type="button"
            onClick={saveEdit}
            disabled={savingEdit}
            className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 text-white font-medium text-sm hover:bg-amber-600 disabled:opacity-50"
          >
            {savingEdit ? "Se salvează…" : "Salvează modificarea"}
          </button>
        </div>
      ) : myApproved ? (
        <p className="text-sm text-amber-700 dark:text-amber-300">
          {otherApproved
            ? "Ambele aprobări au fost înregistrate. Programul se aplică automat."
            : "Ai aprobat. Așteptăm aprobarea celuilalt părinte."}
        </p>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={startEdit}
            disabled={approving}
            className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 font-medium text-sm hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-50"
          >
            Modifică propunerea
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={approving}
            className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 text-white font-medium text-sm hover:bg-amber-600 disabled:opacity-50"
          >
            {approving ? "Se înregistrează…" : "Aprob programul"}
          </button>
        </div>
      )}
    </div>
  );
}
