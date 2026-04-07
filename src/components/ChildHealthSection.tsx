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
  const [conditionStartDate, setConditionStartDate] = useState(new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Bucharest" }));
  const [conditionEndDate, setConditionEndDate] = useState("");
  const [planMedication, setPlanMedication] = useState("");
  const [planDosage, setPlanDosage] = useState("");
  const [planTimes, setPlanTimes] = useState("08:00, 20:00");
  const [planStart, setPlanStart] = useState(new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Bucharest" }));
  const [planEnd, setPlanEnd] = useState("");
  const [planConditionId, setPlanConditionId] = useState("");
  const [planRecurrenceType, setPlanRecurrenceType] = useState<"daily" | "interval">("daily");
  const [planRecurrenceIntervalDays, setPlanRecurrenceIntervalDays] = useState(2);
  const [planResponsible, setPlanResponsible] = useState<HealthResponsibleParent>("both");
  const [planLead, setPlanLead] = useState(10);
  const [reportConditionId, setReportConditionId] = useState("");
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
      if (p.recurrenceType === "interval") {
        const start = new Date(`${p.startDate}T00:00:00`).getTime();
        const current = new Date(`${today}T00:00:00`).getTime();
        const interval = Math.max(1, p.recurrenceIntervalDays ?? 1);
        const days = Math.floor((current - start) / (24 * 60 * 60 * 1000));
        if (days < 0 || days % interval !== 0) continue;
      }
      for (const t of p.times) {
        const done = administrations.some((a) => a.planId === p.id && a.date === today && a.timeLabel === t && a.status === "done");
        out.push({ plan: p, timeLabel: t, done });
      }
    }
    return out.sort((a, b) => a.timeLabel.localeCompare(b.timeLabel));
  }, [plans, administrations, today]);

  const diseaseTimeline = useMemo(() => {
    return [...conditions].sort((a, b) => {
      if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate);
      const aEnd = a.endDate ?? "9999-12-31";
      const bEnd = b.endDate ?? "9999-12-31";
      return aEnd.localeCompare(bEnd);
    });
  }, [conditions]);

  const pastMedicationHistory = useMemo(() => {
    const planById = new Map(plans.map((p) => [p.id, p]));
    return administrations
      .filter((a) => a.status === "done" && a.date < today)
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.timeLabel.localeCompare(a.timeLabel);
      })
      .map((a) => {
        const plan = planById.get(a.planId);
        return {
          id: a.id,
          date: a.date,
          timeLabel: a.timeLabel,
          medicationName: plan?.medicationName ?? "Medicament",
          dosage: plan?.dosage ?? "-",
        };
      });
  }, [administrations, plans, today]);

  async function addCondition() {
    if (!conditionTitle.trim()) return;
    await fetch("/api/children/health/conditions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId,
        title: conditionTitle.trim(),
        startDate: conditionStartDate,
        endDate: conditionEndDate || null,
        notes: conditionNotes.trim() || null,
      }),
    });
    setConditionTitle("");
    setConditionNotes("");
    setConditionEndDate("");
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
        conditionId: planConditionId || null,
        times,
        startDate: planStart,
        endDate: planEnd || null,
        recurrenceType: planRecurrenceType,
        recurrenceIntervalDays: planRecurrenceType === "interval" ? planRecurrenceIntervalDays : null,
        responsibleParent: planResponsible,
        reminderLeadMinutes: planLead,
      }),
    });
    setPlanMedication("");
    setPlanDosage("");
    setPlanEnd("");
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
    if (reportConditionId) form.set("conditionId", reportConditionId);
    form.set("name", reportName.trim());
    form.set("file", reportFile);
    await fetch("/api/children/health/reports", { method: "POST", body: form });
    setReportName("");
    setReportFile(null);
    setReportConditionId("");
    reload();
  }

  return (
    <div id="health" className="app-native-surface rounded-[1.6rem] p-3 space-y-4">
      <h4 className="text-sm font-semibold text-stone-800">Istoric boli & tratament</h4>
      {loading ? <p className="text-xs text-stone-500">Se încarcă…</p> : null}

      <div className="space-y-2">
        <p className="text-xs font-medium text-stone-600">Afecțiuni</p>
        <div className="flex gap-2">
          <input className="app-native-input flex-1 px-3 py-2 text-sm" placeholder="Ex. bronșită" value={conditionTitle} onChange={(e) => setConditionTitle(e.target.value)} />
          <button type="button" onClick={addCondition} className="app-native-primary-button px-3 py-2 text-sm">Adaugă</button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <input type="date" className="app-native-input px-3 py-2 text-sm" value={conditionStartDate} onChange={(e) => setConditionStartDate(e.target.value)} />
          <input type="date" className="app-native-input px-3 py-2 text-sm" value={conditionEndDate} onChange={(e) => setConditionEndDate(e.target.value)} />
        </div>
        <textarea className="app-native-input w-full px-3 py-2 text-sm" rows={2} placeholder="Detalii/observații" value={conditionNotes} onChange={(e) => setConditionNotes(e.target.value)} />
        {conditions.length > 0 && (
          <ul className="space-y-1">
            {conditions.map((c) => (
              <li key={c.id} className="text-sm text-stone-700 rounded-[0.9rem] bg-white/80 px-2.5 py-1.5">
                {c.title} · {c.startDate}
                {c.endDate ? ` → ${c.endDate}` : " → în curs"} {c.status === "resolved" ? "(încheiată)" : "(activă)"}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-stone-600">Timeline boli</p>
        {diseaseTimeline.length === 0 ? <p className="text-xs text-stone-500">Nu există boli înregistrate încă.</p> : null}
        {diseaseTimeline.length > 0 && (
          <ul className="space-y-1">
            {diseaseTimeline.map((c) => (
              <li key={`timeline-${c.id}`} className="rounded-[0.9rem] bg-white/80 px-2.5 py-1.5 text-sm text-stone-700">
                <span className="font-medium">{c.startDate}</span>
                <span className="text-stone-500"> → </span>
                <span className="font-medium">{c.endDate ?? "în curs"}</span>
                <span className="text-stone-500"> · </span>
                <span>{c.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-stone-600">Plan tratament + notificări</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input className="app-native-input px-3 py-2 text-sm" placeholder="Medicament" value={planMedication} onChange={(e) => setPlanMedication(e.target.value)} />
          <input className="app-native-input px-3 py-2 text-sm" placeholder="Doză (ex. 5ml)" value={planDosage} onChange={(e) => setPlanDosage(e.target.value)} />
          <select className="app-native-input px-3 py-2 text-sm" value={planConditionId} onChange={(e) => setPlanConditionId(e.target.value)}>
            <option value="">Fără boală asociată</option>
            {conditions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <input className="app-native-input px-3 py-2 text-sm" placeholder="Ore (ex: 08:00,20:00)" value={planTimes} onChange={(e) => setPlanTimes(e.target.value)} />
          <input type="date" className="app-native-input px-3 py-2 text-sm" value={planStart} onChange={(e) => setPlanStart(e.target.value)} />
          <input type="date" className="app-native-input px-3 py-2 text-sm" value={planEnd} onChange={(e) => setPlanEnd(e.target.value)} />
          <select className="app-native-input px-3 py-2 text-sm" value={planRecurrenceType} onChange={(e) => setPlanRecurrenceType(e.target.value as "daily" | "interval")}>
            <option value="daily">Recurență: zilnic</option>
            <option value="interval">Recurență: la N zile</option>
          </select>
          {planRecurrenceType === "interval" ? (
            <input
              type="number"
              min={1}
              max={30}
              className="app-native-input px-3 py-2 text-sm"
              placeholder="La câte zile"
              value={planRecurrenceIntervalDays}
              onChange={(e) => setPlanRecurrenceIntervalDays(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
            />
          ) : null}
          <select className="app-native-input px-3 py-2 text-sm" value={planResponsible} onChange={(e) => setPlanResponsible(e.target.value as HealthResponsibleParent)}>
            <option value="both">Responsabil: amândoi</option>
            <option value="tata">Responsabil: {parent1Name}</option>
            <option value="mama">Responsabil: {parent2Name}</option>
          </select>
          <select className="app-native-input px-3 py-2 text-sm" value={String(planLead)} onChange={(e) => setPlanLead(Number(e.target.value))}>
            <option value="0">Notificare la oră</option>
            <option value="5">Notificare -5 min</option>
            <option value="10">Notificare -10 min</option>
            <option value="15">Notificare -15 min</option>
            <option value="30">Notificare -30 min</option>
          </select>
        </div>
        <button type="button" onClick={addPlan} className="app-native-primary-button px-3 py-2 text-sm">Adaugă plan</button>
        {plans.length > 0 && (
          <ul className="space-y-1">
            {plans.map((p) => (
              <li key={p.id} className="text-sm text-stone-700 rounded-[0.9rem] bg-white/80 px-2.5 py-1.5">
                {p.medicationName} · {p.dosage} · {p.times.join(", ")} · {p.startDate}
                {p.endDate ? ` → ${p.endDate}` : " → deschis"} ·{" "}
                {p.recurrenceType === "interval" ? `la ${p.recurrenceIntervalDays ?? 1} zile` : "zilnic"}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-stone-600">Administrare azi</p>
        {dueToday.length === 0 ? <p className="text-xs text-stone-500">Nicio doză programată azi.</p> : null}
        {dueToday.map((d) => (
          <div key={`${d.plan.id}-${d.timeLabel}`} className="flex items-center justify-between rounded-[0.9rem] bg-white/80 px-2.5 py-1.5">
            <span className="text-sm text-stone-700">
              {d.timeLabel} · {d.plan.medicationName} ({d.plan.dosage})
            </span>
            <button type="button" disabled={d.done} onClick={() => markDone(d.plan.id, d.timeLabel)} className="rounded-full bg-emerald-500 px-3 py-1 text-white text-xs font-medium disabled:opacity-50">
              {d.done ? "Administrat" : "Marchează"}
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-stone-600">Medicamente administrate în trecut</p>
        {pastMedicationHistory.length === 0 ? (
          <p className="text-xs text-stone-500">Nu există administrări finalizate în trecut.</p>
        ) : null}
        {pastMedicationHistory.length > 0 && (
          <ul className="space-y-1">
            {pastMedicationHistory.map((item) => (
              <li key={item.id} className="rounded-[0.9rem] bg-white/80 px-2.5 py-1.5 text-sm text-stone-700">
                {item.date} · {item.timeLabel} · {item.medicationName} ({item.dosage})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-stone-600">Rapoarte medicale (trasabilitate)</p>
        <form onSubmit={uploadReport} className="flex flex-wrap gap-2 items-end">
          <select className="app-native-input min-w-[180px] px-3 py-2 text-sm" value={reportConditionId} onChange={(e) => setReportConditionId(e.target.value)}>
            <option value="">Boală asociată (opțional)</option>
            {conditions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <input className="app-native-input flex-1 min-w-[120px] px-3 py-2 text-sm" placeholder="Nume raport" value={reportName} onChange={(e) => setReportName(e.target.value)} />
          <input type="file" accept=".pdf,application/pdf,image/jpeg,image/png,image/webp" onChange={(e) => setReportFile(e.target.files?.[0] ?? null)} className="text-xs" />
          <button type="submit" className="app-native-primary-button px-3 py-2 text-sm" disabled={!reportName.trim() || !reportFile}>
            Atașează
          </button>
        </form>
        {reports.length > 0 && (
          <ul className="space-y-1">
            {reports.map((r) => (
              <li key={r.id} className="rounded-[0.9rem] bg-white/80 px-2.5 py-1.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <a className="text-sm text-[#b66347] hover:underline truncate block" href={`/api/children/health/reports/${r.id}`} target="_blank" rel="noopener noreferrer">
                    {r.name}
                  </a>
                  {r.conditionId ? (
                    <p className="text-[11px] text-stone-500">
                      Boală: {conditions.find((c) => c.id === r.conditionId)?.title ?? "necunoscută"}
                    </p>
                  ) : null}
                </div>
                <span className="text-[11px] text-stone-500">{new Date(r.createdAt).toLocaleDateString("ro-RO")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
