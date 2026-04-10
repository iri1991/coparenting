"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, HeartPulse } from "lucide-react";
import { OnDemandAdministerDialog } from "@/components/OnDemandAdministerDialog";
import type {
  ChildHealthCondition,
  ChildTreatmentAdministration,
  ChildTreatmentPlan,
} from "@/types/health";

interface Props {
  childId: string;
  childName: string;
}

const TODAY = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Bucharest" });

export function ActiveHealthCard({ childId, childName }: Props) {
  const [conditions, setConditions] = useState<ChildHealthCondition[]>([]);
  const [plans, setPlans] = useState<ChildTreatmentPlan[]>([]);
  const [administrations, setAdministrations] = useState<ChildTreatmentAdministration[]>([]);
  const [loading, setLoading] = useState(true);

  const today = TODAY();

  const reload = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/children/health/summary?childId=${encodeURIComponent(childId)}`
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return;
      setConditions(Array.isArray(json.conditions) ? json.conditions : []);
      setPlans(Array.isArray(json.plans) ? json.plans : []);
      setAdministrations(
        Array.isArray(json.administrations) ? json.administrations : []
      );
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const activeConditions = conditions.filter((c) => c.status === "active");

  // Build today's medication list (same logic as ChildHealthSection)
  const dueToday = useMemo(() => {
    const out: {
      plan: ChildTreatmentPlan;
      timeLabel: string;
      done: boolean;
      onDemandTimes?: string[];
    }[] = [];
    for (const p of plans) {
      if (!p.active) continue;
      if (p.startDate > today) continue;
      if (p.endDate && p.endDate < today) continue;

      if (p.administrationMode === "on_demand") {
        const todayAdmins = administrations
          .filter((a) => a.planId === p.id && a.date === today && a.status === "done")
          .map((a) => a.timeLabel)
          .sort();
        out.push({ plan: p, timeLabel: "la nevoie", done: false, onDemandTimes: todayAdmins });
        continue;
      }

      // Scheduled
      if (p.recurrenceType === "interval") {
        const start = new Date(`${p.startDate}T00:00:00`).getTime();
        const current = new Date(`${today}T00:00:00`).getTime();
        const interval = Math.max(1, p.recurrenceIntervalDays ?? 1);
        const days = Math.floor((current - start) / (24 * 60 * 60 * 1000));
        if (days < 0 || days % interval !== 0) continue;
      }
      for (const t of p.times) {
        const done = administrations.some(
          (a) =>
            a.planId === p.id &&
            a.date === today &&
            a.timeLabel === t &&
            a.status === "done"
        );
        out.push({ plan: p, timeLabel: t, done });
      }
    }
    return out.sort((a, b) => {
      const aOD = a.plan.administrationMode === "on_demand" ? 1 : 0;
      const bOD = b.plan.administrationMode === "on_demand" ? 1 : 0;
      if (aOD !== bOD) return aOD - bOD;
      return a.timeLabel.localeCompare(b.timeLabel);
    });
  }, [plans, administrations, today]);

  const [onDemandDialog, setOnDemandDialog] = useState<ChildTreatmentPlan | null>(null);

  async function recordAdministration(planId: string, timeLabel: string) {
    await fetch("/api/children/health/administrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId,
        date: today,
        timeLabel,
        status: "done",
      }),
    });
    reload();
  }

  function handleAdminister(plan: ChildTreatmentPlan, timeLabel: string) {
    if (plan.administrationMode === "on_demand") {
      setOnDemandDialog(plan);
    } else {
      recordAdministration(plan.id, timeLabel);
    }
  }

  // Don't render if nothing relevant
  if (loading) return null;
  if (activeConditions.length === 0 && dueToday.length === 0) return null;

  const scheduledItems = dueToday.filter((d) => d.plan.administrationMode !== "on_demand");
  const doneCount = scheduledItems.filter((d) => d.done).length;
  const totalCount = scheduledItems.length;
  const onDemandAdminCount = dueToday
    .filter((d) => d.plan.administrationMode === "on_demand")
    .reduce((sum, d) => sum + (d.onDemandTimes?.length ?? 0), 0);

  return (
    <section className="app-native-surface rounded-[2rem] p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <HeartPulse className="w-4 h-4 text-[#b66347]" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
          Sănătate {childName}
        </p>
        {(totalCount > 0 || onDemandAdminCount > 0) && (
          <span className="ml-auto rounded-full bg-[#edf6f3] px-2 py-0.5 text-[11px] font-semibold text-[#1f5a4e]">
            {totalCount > 0 ? `${doneCount}/${totalCount}` : ""}
            {totalCount > 0 && onDemandAdminCount > 0 ? " · " : ""}
            {onDemandAdminCount > 0 ? `${onDemandAdminCount} la nevoie` : ""}
          </span>
        )}
      </div>

      {/* Active conditions */}
      {activeConditions.map((c) => {
        const conditionPlans = dueToday.filter(
          (d) => d.plan.conditionId === c.id
        );
        return (
          <div
            key={c.id}
            className="rounded-[1.2rem] border border-[#e4c9b4] bg-[#fffcf8] p-3 space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-stone-800">
                {c.title}
              </span>
              <span className="rounded-full bg-[#fef2e8] px-2 py-0.5 text-[11px] font-semibold text-[#b66347]">
                activă
              </span>
            </div>
            {conditionPlans.length > 0 && (
              <div className="space-y-1">
                {conditionPlans.map((d) => {
                  const isOnDemand = d.plan.administrationMode === "on_demand";
                  return (
                    <div key={`${d.plan.id}-${d.timeLabel}`} className="rounded-[0.9rem] bg-white px-3 py-2 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {!isOnDemand && (d.done
                            ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                            : <Circle className="w-4 h-4 shrink-0 text-stone-300" />
                          )}
                          <span className="text-sm text-stone-700 truncate">
                            {isOnDemand
                              ? <>{d.plan.medicationName} ({d.plan.dosage})</>
                              : <><span className="font-medium">{d.timeLabel}</span> · {d.plan.medicationName} ({d.plan.dosage})</>
                            }
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={d.done}
                          onClick={() => handleAdminister(d.plan, d.timeLabel)}
                          className="rounded-full bg-emerald-500 px-3 py-1 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-default shrink-0"
                        >
                          {d.done ? "✓" : isOnDemand ? "Administrează" : "Marchează"}
                        </button>
                      </div>
                      {isOnDemand && d.onDemandTimes && d.onDemandTimes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pl-0.5">
                          {d.onDemandTimes.map((t) => (
                            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-[#edf6f3] px-2 py-0.5 text-[11px] font-medium text-[#1f5a4e]">
                              <CheckCircle2 className="w-3 h-3" /> {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Orphan medications (no condition) due today */}
      {dueToday.filter((d) => !d.plan.conditionId).length > 0 && (
        <div className="space-y-1">
          {dueToday
            .filter((d) => !d.plan.conditionId)
            .map((d) => {
              const isOnDemand = d.plan.administrationMode === "on_demand";
              return (
                <div key={`${d.plan.id}-${d.timeLabel}`} className="rounded-[0.9rem] bg-[#f0faf6] px-3 py-2 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {!isOnDemand && (d.done
                        ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                        : <Circle className="w-4 h-4 shrink-0 text-stone-300" />
                      )}
                      <span className="text-sm text-stone-700 truncate">
                        {isOnDemand
                          ? <>{d.plan.medicationName} ({d.plan.dosage})</>
                          : <><span className="font-medium">{d.timeLabel}</span> · {d.plan.medicationName} ({d.plan.dosage})</>
                        }
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={d.done}
                      onClick={() => handleAdminister(d.plan, d.timeLabel)}
                      className="rounded-full bg-emerald-500 px-3 py-1 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-default shrink-0"
                    >
                      {d.done ? "✓" : isOnDemand ? "Administrează" : "Marchează"}
                    </button>
                  </div>
                  {isOnDemand && d.onDemandTimes && d.onDemandTimes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-0.5">
                      {d.onDemandTimes.map((t) => (
                        <span key={t} className="inline-flex items-center gap-1 rounded-full bg-[#edf6f3] px-2 py-0.5 text-[11px] font-medium text-[#1f5a4e]">
                          <CheckCircle2 className="w-3 h-3" /> {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      <OnDemandAdministerDialog
        open={!!onDemandDialog}
        medicationName={onDemandDialog?.medicationName ?? ""}
        dosage={onDemandDialog?.dosage ?? ""}
        onClose={() => setOnDemandDialog(null)}
        onConfirm={async (timeLabel) => {
          if (onDemandDialog) await recordAdministration(onDemandDialog.id, timeLabel);
        }}
      />
    </section>
  );
}
