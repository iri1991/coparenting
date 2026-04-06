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
  onProposalLoaded?: (proposal: WeekProposal | null, weekLabel?: string) => void;
}

export function WeeklyProposalCard({ onApplied, onProposalLoaded }: WeeklyProposalCardProps) {
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
        onProposalLoaded?.(json.proposal ?? null, json.proposal?.weekLabel);
      } else {
        setData({ proposal: null });
        onProposalLoaded?.(null);
      }
    } catch {
      setData({ proposal: null });
      onProposalLoaded?.(null);
    } finally {
      setLoading(false);
    }
  }, [onProposalLoaded]);

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
      <div className="app-native-surface rounded-[2rem] p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b85c3e]">Plan Pro</p>
        <h3 className="mt-2 text-base font-semibold text-stone-900">Propunere program săptămână</h3>
        <p className="mt-2 text-sm text-stone-600">{data.upgradeMessage}</p>
        <p className="mb-3 mt-1 text-xs text-stone-500">Planul Pro include propunerea automată în fiecare duminică.</p>
        <UpgradeCta variant="button" />
      </div>
    );
  }
  if (!proposal) return null;

  const { weekLabel, days, myApproved, otherApproved, parentLabels } = proposal;
  const renderDays = editing ? editableDays : days;

  return (
    <div className="app-native-surface-strong rounded-[2rem] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b85c3e]">Propunere automată</p>
          <h3 className="mt-1 text-base font-semibold text-stone-900">Program pentru săptămâna următoare</h3>
        </div>
        <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium text-stone-500">{weekLabel}</span>
      </div>
      <ul className="mb-4 mt-4 space-y-2">
        {renderDays.map((day, idx) => (
          <li
            key={day.date}
            className="flex items-center justify-between gap-3 rounded-[1.2rem] bg-white/76 px-3 py-3 text-sm text-stone-700"
          >
            <span className="font-medium text-stone-800">
              {format(new Date(day.date + "T12:00:00"), "EEEE, d MMM", { locale: ro })}
            </span>
            {editing ? (
              <button
                type="button"
                onClick={() => cycleParent(idx)}
                className="app-native-secondary-button px-3 py-1.5 text-xs font-semibold text-stone-700"
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
            className="app-native-secondary-button flex-1 px-4 py-3 text-sm font-semibold text-stone-700 disabled:opacity-50"
          >
            Renunță
          </button>
          <button
            type="button"
            onClick={saveEdit}
            disabled={savingEdit}
            className="app-native-primary-button flex-1 px-4 py-3 text-sm font-semibold disabled:opacity-50"
          >
            {savingEdit ? "Se salvează…" : "Salvează modificarea"}
          </button>
        </div>
      ) : myApproved ? (
        <p className="rounded-[1.2rem] bg-[#fff4e9] px-3 py-3 text-sm text-[#9f5a40]">
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
            className="app-native-secondary-button flex-1 px-4 py-3 text-sm font-semibold text-stone-700 disabled:opacity-50"
          >
            Modifică propunerea
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={approving}
            className="app-native-primary-button flex-1 px-4 py-3 text-sm font-semibold disabled:opacity-50"
          >
            {approving ? "Se înregistrează…" : "Aprob programul"}
          </button>
        </div>
      )}
    </div>
  );
}
