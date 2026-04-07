"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ChildHealthCondition,
  ChildMedicalReportRef,
  ChildTreatmentAdministration,
  ChildTreatmentPlan,
  HealthResponsibleParent,
} from "@/types/health";

interface Props {
  childId: string;
  parent1Name: string;
  parent2Name: string;
}

export function ChildHealthSection({ childId, parent1Name, parent2Name }: Props) {
  const [loading, setLoading] = useState(true);
  const [conditions, setConditions] = useState<ChildHealthCondition[]>([]);
  const [plans, setPlans] = useState<ChildTreatmentPlan[]>([]);
  const [administrations, setAdministrations] = useState<ChildTreatmentAdministration[]>([]);
  const [reports, setReports] = useState<ChildMedicalReportRef[]>([]);

  const [conditionTitle, setConditionTitle] = useState("");
  const [conditionNotes, setConditionNotes] = useState("");
  const [planMedication, setPlanMedication] = useState("");
  const [planDosage, setPlanDosage] = useState("");
  const [planTimes, setPlanTimes] = useState("08:00, 20:00");
  const [planStart, setPlanStart] = useState(new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Bucharest" }));
  const [planResponsible, setPlanResponsible] = useState<HealthResponsibleParent>("both");
  const [planLead, setPlanLead] = useState(10);
  const [reportName, setReportName] = useState("");
  const [reportFile, setReportFile] = useState<File | null>(null);

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Bucharest" });

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/children/health/summary?childId=${encodeURIComponent(childId)}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return;
      setConditions(Array.isArray(json.conditions) ? json.conditions : []);
      setPlans(Array.isArray(json.plans) ? json.plans : []);
      setAdministrations(Array.isArray(json.administrations) ? json.administrations : []);
      setReports(Array.isArray(json.reports) ? json.reports : []);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const dueToday = useMemo(() => {
    const out: { plan: ChildTreatmentPlan; timeLabel: string; done: boolean }[] = [];
    for (const p of plans) {
      if (!p.active) continue;
      if (p.startDate > today) continue;
      if (p.endDate && p.endDate < today) continue;
      for (const t of p.times) {
        const done = administrations.some((a) => a.planId === p.id && a.date === today && a.timeLabel === t && a.status === "done");
        out.push({ plan: p, timeLabel: t, done });
      }
    }
    return out.sort((a, b) => a.timeLabel.localeCompare(b.timeLabel));
  }, [plans, administrations, today]);

  async function addCondition() {
    if (!conditionTitle.trim()) return;
    await fetch("/api/children/health/conditions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, title: conditionTitle.trim(), notes: conditionNotes.trim() || null }),
    });
    setConditionTitle("");
    setConditionNotes("");
    reload();
  }

  async function addPlan() {
    const times = planTimes
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    if (!planMedication.trim() || !planDosage.trim() || times.length === 0) return;
    await fetch("/api/children/health/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId,
        medicationName: planMedication.trim(),
        dosage: planDosage.trim(),
        times,
        startDate: planStart,
        responsibleParent: planResponsible,
        reminderLeadMinutes: planLead,
      }),
    });
    setPlanMedication("");
    setPlanDosage("");
    reload();
  }

  async function markDone(planId: string, timeLabel: string) {
    await fetch("/api/children/health/administrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, date: today, timeLabel, status: "done" }),
    });
    reload();
  }

  async function uploadReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportName.trim() || !reportFile) return;
    const form = new FormData();
    form.set("childId", childId);
    form.set("name", reportName.trim());
    form.set("file", reportFile);
    await fetch("/api/children/health/reports", { method: "POST", body: form });
    setReportName("");
    setReportFile(null);
    reload();
  }

  return (
    <div id="health" className="rounded-xl border border-stone-200 dark:border-stone-700 p-3 space-y-4">
      <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100">Istoric boli & tratament</h4>
      {loading ? <p className="text-xs text-stone-500">Se încarcă…</p> : null}

      <div className="space-y-2">
        <p className="text-xs font-medium text-stone-600 dark:text-stone-300">Afecțiuni</p>
        <div className="flex gap-2">
          <input className="flex-1 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-sm" placeholder="Ex. bronșită" value={conditionTitle} onChange={(e) => setConditionTitle(e.target.value)} />
          <button type="button" onClick={addCondition} className="px-3 py-2 rounded-lg bg-amber-500 text-white text-sm">Adaugă</button>
        </div>
        <textarea className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-sm" rows={2} placeholder="Detalii/observații" value={conditionNotes} onChange={(e) => setConditionNotes(e.target.value)} />
        {conditions.length > 0 && (
          <ul className="space-y-1">
            {conditions.map((c) => (
              <li key={c.id} className="text-sm text-stone-700 dark:text-stone-300 rounded-lg bg-stone-100 dark:bg-stone-800 px-2.5 py-1.5">
                {c.title} {c.status === "resolved" ? "(rezolvată)" : "(activă)"}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-stone-600 dark:text-stone-300">Plan tratament + notificări</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input className="px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-sm" placeholder="Medicament" value={planMedication} onChange={(e) => setPlanMedication(e.target.value)} />
          <input className="px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-sm" placeholder="Doză (ex. 5ml)" value={planDosage} onChange={(e) => setPlanDosage(e.target.value)} />
          <input className="px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-sm" placeholder="Ore (ex: 08:00,20:00)" value={planTimes} onChange={(e) => setPlanTimes(e.target.value)} />
          <input type="date" className="px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-sm" value={planStart} onChange={(e) => setPlanStart(e.target.value)} />
          <select className="px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-sm" value={planResponsible} onChange={(e) => setPlanResponsible(e.target.value as HealthResponsibleParent)}>
            <option value="both">Responsabil: amândoi</option>
            <option value="tata">Responsabil: {parent1Name}</option>
            <option value="mama">Responsabil: {parent2Name}</option>
          </select>
          <select className="px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-sm" value={String(planLead)} onChange={(e) => setPlanLead(Number(e.target.value))}>
            <option value="0">Notificare la oră</option>
            <option value="5">Notificare -5 min</option>
            <option value="10">Notificare -10 min</option>
            <option value="15">Notificare -15 min</option>
            <option value="30">Notificare -30 min</option>
          </select>
        </div>
        <button type="button" onClick={addPlan} className="px-3 py-2 rounded-lg bg-amber-500 text-white text-sm">Adaugă plan</button>
        {plans.length > 0 && (
          <ul className="space-y-1">
            {plans.map((p) => (
              <li key={p.id} className="text-sm text-stone-700 dark:text-stone-300 rounded-lg bg-stone-100 dark:bg-stone-800 px-2.5 py-1.5">
                {p.medicationName} · {p.dosage} · {p.times.join(", ")}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-stone-600 dark:text-stone-300">Administrare azi</p>
        {dueToday.length === 0 ? <p className="text-xs text-stone-500">Nicio doză programată azi.</p> : null}
        {dueToday.map((d) => (
          <div key={`${d.plan.id}-${d.timeLabel}`} className="flex items-center justify-between rounded-lg bg-stone-100 dark:bg-stone-800 px-2.5 py-1.5">
            <span className="text-sm text-stone-700 dark:text-stone-300">
              {d.timeLabel} · {d.plan.medicationName} ({d.plan.dosage})
            </span>
            <button type="button" disabled={d.done} onClick={() => markDone(d.plan.id, d.timeLabel)} className="px-2 py-1 rounded bg-emerald-500 text-white text-xs disabled:opacity-50">
              {d.done ? "Administrat" : "Marchează"}
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-stone-600 dark:text-stone-300">Rapoarte medicale (trasabilitate)</p>
        <form onSubmit={uploadReport} className="flex flex-wrap gap-2 items-end">
          <input className="flex-1 min-w-[120px] px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-sm" placeholder="Nume raport" value={reportName} onChange={(e) => setReportName(e.target.value)} />
          <input type="file" accept=".pdf,application/pdf,image/jpeg,image/png,image/webp" onChange={(e) => setReportFile(e.target.files?.[0] ?? null)} className="text-xs" />
          <button type="submit" className="px-3 py-2 rounded-lg bg-amber-500 text-white text-sm" disabled={!reportName.trim() || !reportFile}>
            Atașează
          </button>
        </form>
        {reports.length > 0 && (
          <ul className="space-y-1">
            {reports.map((r) => (
              <li key={r.id} className="rounded-lg bg-stone-100 dark:bg-stone-800 px-2.5 py-1.5 flex items-center justify-between gap-2">
                <a className="text-sm text-amber-700 dark:text-amber-300 hover:underline truncate" href={`/api/children/health/reports/${r.id}`} target="_blank" rel="noopener noreferrer">
                  {r.name}
                </a>
                <span className="text-[11px] text-stone-500">{new Date(r.createdAt).toLocaleDateString("ro-RO")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
