"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Plus, X, FileText, CheckCircle2, Circle } from "lucide-react";
import type {
  ChildHealthCondition,
  ChildMedicalReportRef,
  ChildTreatmentAdministration,
  ChildTreatmentPlan,
  HealthResponsibleParent,
  TreatmentAdministrationMode,
} from "@/types/health";

interface Props {
  childId: string;
  parent1Name: string;
  parent2Name: string;
}

const TODAY = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Bucharest" });

// ─── Add-plan inline form ──────────────────────────────────────────────────
interface AddPlanFormProps {
  childId: string;
  conditionId: string | null;
  parent1Name: string;
  parent2Name: string;
  onDone: () => void;
  onCancel: () => void;
}
function AddPlanForm({ childId, conditionId, parent1Name, parent2Name, onDone, onCancel }: AddPlanFormProps) {
  const today = TODAY();
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [mode, setMode] = useState<TreatmentAdministrationMode>("scheduled");
  const [times, setTimes] = useState("08:00");
  const [startDate, setStartDate] = useState(today);
  const [recurrenceType, setRecurrenceType] = useState<"daily" | "interval">("daily");
  const [intervalDays, setIntervalDays] = useState(2);
  const [responsible, setResponsible] = useState<HealthResponsibleParent>("both");
  const [lead, setLead] = useState(10);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!medication.trim() || !dosage.trim()) return;
    if (mode === "scheduled") {
      const parsedTimes = times.split(",").map((x) => x.trim()).filter(Boolean);
      if (parsedTimes.length === 0) return;
    }
    setSaving(true);
    try {
      await fetch("/api/children/health/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          conditionId: conditionId || null,
          medicationName: medication.trim(),
          dosage: dosage.trim(),
          administrationMode: mode,
          times: mode === "scheduled" ? times.split(",").map((x) => x.trim()).filter(Boolean) : [],
          startDate,
          recurrenceType: mode === "scheduled" ? recurrenceType : "daily",
          recurrenceIntervalDays: mode === "scheduled" && recurrenceType === "interval" ? intervalDays : null,
          responsibleParent: responsible,
          reminderLeadMinutes: mode === "scheduled" ? lead : 0,
        }),
      });
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[1rem] border border-[#ead9c8] bg-[#fffcf8] p-3 space-y-2">
      <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide">Adaugă medicament</p>
      {/* Mode toggle */}
      <div className="flex rounded-[0.7rem] bg-stone-100 p-0.5 gap-0.5">
        <button type="button" onClick={() => setMode("scheduled")}
          className={`flex-1 rounded-[0.5rem] py-1.5 text-xs font-semibold transition ${mode === "scheduled" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"}`}>
          Cu program fix
        </button>
        <button type="button" onClick={() => setMode("on_demand")}
          className={`flex-1 rounded-[0.5rem] py-1.5 text-xs font-semibold transition ${mode === "on_demand" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"}`}>
          La nevoie
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <input className="app-native-input px-3 py-2 text-sm" placeholder="Medicament" value={medication} onChange={(e) => setMedication(e.target.value)} />
        <input className="app-native-input px-3 py-2 text-sm" placeholder="Doză (ex. 5ml)" value={dosage} onChange={(e) => setDosage(e.target.value)} />
        {mode === "scheduled" && (
          <>
            <input className="app-native-input px-3 py-2 text-sm" placeholder="Ore (ex: 08:00, 20:00)" value={times} onChange={(e) => setTimes(e.target.value)} />
            <input type="date" className="app-native-input px-3 py-2 text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <select className="app-native-input px-3 py-2 text-sm" value={recurrenceType} onChange={(e) => setRecurrenceType(e.target.value as "daily" | "interval")}>
              <option value="daily">Zilnic</option>
              <option value="interval">La N zile</option>
            </select>
            {recurrenceType === "interval" ? (
              <input type="number" min={1} max={30} className="app-native-input px-3 py-2 text-sm" placeholder="La câte zile" value={intervalDays}
                onChange={(e) => setIntervalDays(Math.max(1, Math.min(30, Number(e.target.value) || 1)))} />
            ) : null}
          </>
        )}
        {mode === "on_demand" && (
          <input type="date" className="app-native-input px-3 py-2 text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        )}
        <select className="app-native-input px-3 py-2 text-sm" value={responsible} onChange={(e) => setResponsible(e.target.value as HealthResponsibleParent)}>
          <option value="both">Responsabil: amândoi</option>
          <option value="tata">{parent1Name}</option>
          <option value="mama">{parent2Name}</option>
        </select>
        {mode === "scheduled" && (
          <select className="app-native-input px-3 py-2 text-sm" value={String(lead)} onChange={(e) => setLead(Number(e.target.value))}>
            <option value="0">Notificare la oră</option>
            <option value="5">-5 min</option>
            <option value="10">-10 min</option>
            <option value="15">-15 min</option>
            <option value="30">-30 min</option>
          </select>
        )}
      </div>
      {mode === "on_demand" && (
        <p className="text-[11px] text-stone-400">Medicamentul va apărea zilnic cu un buton de administrare. Ora se înregistrează automat la marcare.</p>
      )}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={save} disabled={saving || !medication.trim() || !dosage.trim()} className="app-native-primary-button px-3 py-1.5 text-xs">
          {saving ? "Se salvează…" : "Salvează"}
        </button>
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800">
          Anulează
        </button>
      </div>
    </div>
  );
}

// ─── Add-report inline form ────────────────────────────────────────────────
interface AddReportFormProps {
  childId: string;
  conditionId: string | null;
  onDone: () => void;
  onCancel: () => void;
}
function AddReportForm({ childId, conditionId, onDone, onCancel }: AddReportFormProps) {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !file) return;
    setSaving(true);
    try {
      const form = new FormData();
      form.set("childId", childId);
      if (conditionId) form.set("conditionId", conditionId);
      form.set("name", name.trim());
      form.set("file", file);
      await fetch("/api/children/health/reports", { method: "POST", body: form });
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="rounded-[1rem] border border-[#ead9c8] bg-[#fffcf8] p-3 space-y-2">
      <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide">Atașează raport medical</p>
      <div className="flex flex-wrap gap-2 items-end">
        <input className="app-native-input flex-1 min-w-[120px] px-3 py-2 text-sm" placeholder="Nume raport" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="file" accept=".pdf,application/pdf,image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-xs" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving || !name.trim() || !file} className="app-native-primary-button px-3 py-1.5 text-xs">
          {saving ? "Se încarcă…" : "Atașează"}
        </button>
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800">
          Anulează
        </button>
      </div>
    </form>
  );
}

// ─── Condition card ────────────────────────────────────────────────────────
interface ConditionCardProps {
  condition: ChildHealthCondition;
  plans: ChildTreatmentPlan[];
  reports: ChildMedicalReportRef[];
  childId: string;
  parent1Name: string;
  parent2Name: string;
  onRefresh: () => void;
}
function ConditionCard({ condition, plans, reports, childId, parent1Name, parent2Name, onRefresh }: ConditionCardProps) {
  const today = TODAY();
  const [expanded, setExpanded] = useState(false);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [showAddReport, setShowAddReport] = useState(false);
  const [stopping, setStopping] = useState<string | null>(null);

  const conditionPlans = plans.filter((p) => p.conditionId === condition.id);
  const conditionReports = reports.filter((r) => r.conditionId === condition.id);
  const isActive = condition.status !== "resolved";

  async function closeCondition() {
    setStopping("condition");
    try {
      await fetch("/api/children/health/conditions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: condition.id, endDate: today, status: "resolved" }),
      });
      onRefresh();
    } finally {
      setStopping(null);
    }
  }

  async function reactivateCondition() {
    setStopping("reactivate");
    try {
      await fetch("/api/children/health/conditions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: condition.id, endDate: null, status: "active" }),
      });
      onRefresh();
    } finally {
      setStopping(null);
    }
  }

  async function stopPlan(planId: string) {
    setStopping(planId);
    try {
      await fetch("/api/children/health/plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: planId, endDate: today, active: false }),
      });
      onRefresh();
    } finally {
      setStopping(null);
    }
  }

  const activePlans = conditionPlans.filter((p) => p.active && (!p.endDate || p.endDate >= today));

  return (
    <div className={`rounded-[1.2rem] border overflow-hidden ${isActive ? "border-[#e4c9b4] bg-white" : "border-stone-200 bg-stone-50"}`}>
      {/* Header */}
      <button type="button" onClick={() => setExpanded(!expanded)} className="w-full flex items-start justify-between gap-2 px-3 py-3 text-left">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-stone-800 text-sm">{condition.title}</span>
            {isActive ? (
              <span className="rounded-full bg-[#fef2e8] px-2 py-0.5 text-[11px] font-semibold text-[#b66347]">activă</span>
            ) : (
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-500">încheiată</span>
            )}
            {activePlans.length > 0 ? (
              <span className="rounded-full bg-[#edf6f3] px-2 py-0.5 text-[11px] font-semibold text-[#1f5a4e]">
                {activePlans.length} medicament{activePlans.length > 1 ? "e" : ""}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            {condition.startDate}{condition.endDate ? ` → ${condition.endDate}` : " → în curs"}
          </p>
          {condition.notes ? <p className="text-xs text-stone-500 mt-0.5 truncate">{condition.notes}</p> : null}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isActive ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); closeCondition(); }}
              disabled={stopping === "condition"}
              className="rounded-full border border-stone-300 px-2 py-1 text-[11px] font-semibold text-stone-600 hover:border-red-300 hover:text-red-600 transition disabled:opacity-50"
            >
              {stopping === "condition" ? "…" : "Încheie"}
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); reactivateCondition(); }}
              disabled={stopping === "reactivate"}
              className="rounded-full border border-stone-300 px-2 py-1 text-[11px] font-semibold text-stone-500 hover:border-emerald-400 hover:text-emerald-700 transition disabled:opacity-50"
            >
              {stopping === "reactivate" ? "…" : "Reactivează"}
            </button>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded ? (
        <div className="border-t border-stone-100 px-3 pb-3 pt-2 space-y-3">
          {/* Active treatment plans */}
          {activePlans.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">Medicamente active</p>
              {activePlans.map((p) => (
                <div key={p.id} className="rounded-[0.9rem] bg-[#edf6f3] px-3 py-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-800">{p.medicationName} <span className="font-normal text-stone-500">· {p.dosage}</span></p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {p.administrationMode === "on_demand" ? (
                        <>la nevoie · din {p.startDate}</>
                      ) : (
                        <>{p.times.join(", ")} · {p.recurrenceType === "interval" ? `la ${p.recurrenceIntervalDays ?? 1} zile` : "zilnic"}{" · "}din {p.startDate}</>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => stopPlan(p.id)}
                    disabled={stopping === p.id}
                    className="rounded-full border border-stone-300 px-2 py-0.5 text-[11px] font-semibold text-stone-500 hover:border-red-300 hover:text-red-600 transition disabled:opacity-50 shrink-0"
                  >
                    {stopping === p.id ? "…" : "Oprește"}
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {/* Inactive / past plans for this condition */}
          {conditionPlans.filter((p) => !p.active || (p.endDate && p.endDate < today)).length > 0 ? (
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">Medicamente oprite</p>
              {conditionPlans.filter((p) => !p.active || (p.endDate && p.endDate < today)).map((p) => (
                <div key={p.id} className="rounded-[0.9rem] bg-stone-50 px-3 py-2">
                  <p className="text-sm text-stone-500 line-through">{p.medicationName} · {p.dosage}</p>
                  <p className="text-xs text-stone-400">{p.startDate}{p.endDate ? ` → ${p.endDate}` : ""}</p>
                </div>
              ))}
            </div>
          ) : null}

          {/* Add plan form */}
          {showAddPlan ? (
            <AddPlanForm childId={childId} conditionId={condition.id} parent1Name={parent1Name} parent2Name={parent2Name}
              onDone={() => { setShowAddPlan(false); onRefresh(); }}
              onCancel={() => setShowAddPlan(false)} />
          ) : (
            <button type="button" onClick={() => setShowAddPlan(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#b66347] hover:text-[#8a4b2d]">
              <Plus className="w-3.5 h-3.5" /> Adaugă medicament
            </button>
          )}

          {/* Reports */}
          {conditionReports.length > 0 ? (
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">Rapoarte medicale</p>
              {conditionReports.map((r) => (
                <div key={r.id} className="flex items-center gap-2 rounded-[0.9rem] bg-stone-50 px-3 py-2">
                  <FileText className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                  <a className="text-sm text-[#b66347] hover:underline truncate flex-1" href={`/api/children/health/reports/${r.id}`} target="_blank" rel="noopener noreferrer">
                    {r.name}
                  </a>
                  <span className="text-[11px] text-stone-400 shrink-0">{new Date(r.createdAt).toLocaleDateString("ro-RO")}</span>
                </div>
              ))}
            </div>
          ) : null}

          {/* Add report form */}
          {showAddReport ? (
            <AddReportForm childId={childId} conditionId={condition.id}
              onDone={() => { setShowAddReport(false); onRefresh(); }}
              onCancel={() => setShowAddReport(false)} />
          ) : (
            <button type="button" onClick={() => setShowAddReport(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800">
              <Plus className="w-3.5 h-3.5" /> Atașează raport
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export function ChildHealthSection({ childId, parent1Name, parent2Name }: Props) {
  const [loading, setLoading] = useState(true);
  const [conditions, setConditions] = useState<ChildHealthCondition[]>([]);
  const [plans, setPlans] = useState<ChildTreatmentPlan[]>([]);
  const [administrations, setAdministrations] = useState<ChildTreatmentAdministration[]>([]);
  const [reports, setReports] = useState<ChildMedicalReportRef[]>([]);

  // Add condition form state
  const [showAddCondition, setShowAddCondition] = useState(false);
  const [conditionTitle, setConditionTitle] = useState("");
  const [conditionStartDate, setConditionStartDate] = useState(TODAY());
  const [conditionNotes, setConditionNotes] = useState("");
  const [savingCondition, setSavingCondition] = useState(false);

  // Plans/reports without a condition
  const [showAddOrphanPlan, setShowAddOrphanPlan] = useState(false);
  const [showAddOrphanReport, setShowAddOrphanReport] = useState(false);

  // History section
  const [showHistory, setShowHistory] = useState(false);

  const today = TODAY();

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

  useEffect(() => { reload(); }, [reload]);

  // Today's due doses (all plans) — scheduled have time slots, on_demand are always available
  const dueToday = useMemo(() => {
    const out: { plan: ChildTreatmentPlan; timeLabel: string; done: boolean; onDemandTimes?: string[] }[] = [];
    for (const p of plans) {
      if (!p.active) continue;
      if (p.startDate > today) continue;
      if (p.endDate && p.endDate < today) continue;

      if (p.administrationMode === "on_demand") {
        // On-demand: always available, collect all today's administration times
        const todayAdmins = administrations
          .filter((a) => a.planId === p.id && a.date === today && a.status === "done")
          .map((a) => a.timeLabel)
          .sort();
        out.push({ plan: p, timeLabel: "la nevoie", done: false, onDemandTimes: todayAdmins });
        continue;
      }

      // Scheduled mode
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
    // Sort: scheduled by time first, on_demand at the end
    return out.sort((a, b) => {
      const aOnDemand = a.plan.administrationMode === "on_demand" ? 1 : 0;
      const bOnDemand = b.plan.administrationMode === "on_demand" ? 1 : 0;
      if (aOnDemand !== bOnDemand) return aOnDemand - bOnDemand;
      return a.timeLabel.localeCompare(b.timeLabel);
    });
  }, [plans, administrations, today]);

  // Past medication history
  const pastHistory = useMemo(() => {
    const planById = new Map(plans.map((p) => [p.id, p]));
    return administrations
      .filter((a) => a.status === "done" && a.date < today)
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.timeLabel.localeCompare(a.timeLabel);
      })
      .map((a) => ({
        id: a.id,
        date: a.date,
        timeLabel: a.timeLabel,
        medicationName: planById.get(a.planId)?.medicationName ?? "Medicament",
        dosage: planById.get(a.planId)?.dosage ?? "-",
      }));
  }, [administrations, plans, today]);

  // Active vs resolved conditions
  const activeConditions = conditions.filter((c) => c.status !== "resolved");
  const resolvedConditions = conditions.filter((c) => c.status === "resolved");

  // Plans not linked to any condition
  const orphanActivePlans = plans.filter((p) => !p.conditionId && p.active && (!p.endDate || p.endDate >= today));
  const orphanReports = reports.filter((r) => !r.conditionId);

  async function stopOrphanPlan(planId: string) {
    await fetch("/api/children/health/plans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: planId, endDate: today, active: false }),
    });
    reload();
  }

  async function associatePlan(planId: string, conditionId: string) {
    await fetch("/api/children/health/plans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: planId, conditionId }),
    });
    reload();
  }

  async function associateReport(reportId: string, conditionId: string) {
    const form = new FormData();
    form.set("id", reportId);
    form.set("conditionId", conditionId);
    await fetch("/api/children/health/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: reportId, conditionId }),
    });
    reload();
  }

  async function addCondition() {
    if (!conditionTitle.trim()) return;
    setSavingCondition(true);
    try {
      await fetch("/api/children/health/conditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          title: conditionTitle.trim(),
          startDate: conditionStartDate,
          notes: conditionNotes.trim() || null,
        }),
      });
      setConditionTitle("");
      setConditionNotes("");
      setConditionStartDate(TODAY());
      setShowAddCondition(false);
      reload();
    } finally {
      setSavingCondition(false);
    }
  }

  async function markDone(planId: string, timeLabel: string, isOnDemand?: boolean) {
    // For on_demand, use the current time as timeLabel
    const actualTimeLabel = isOnDemand
      ? new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Bucharest" })
      : timeLabel;
    await fetch("/api/children/health/administrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, date: today, timeLabel: actualTimeLabel, status: "done" }),
    });
    reload();
  }

  if (loading) return <p className="text-xs text-stone-500 py-2">Se încarcă…</p>;

  return (
    <div id="health" className="space-y-4">

      {/* ── Zone 1: Administrare azi (proeminent, first) ── */}
      {dueToday.length > 0 ? (
        <section className="rounded-[1.2rem] border border-[#b0d8ca] bg-[#f0faf6] p-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#1f5a4e]">Administrare azi</p>
          {dueToday.map((d) => {
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
                      {isOnDemand ? (
                        <>{d.plan.medicationName} ({d.plan.dosage})</>
                      ) : (
                        <><span className="font-medium">{d.timeLabel}</span> · {d.plan.medicationName} ({d.plan.dosage})</>
                      )}
                    </span>
                  </div>
                  <button type="button" disabled={d.done} onClick={() => markDone(d.plan.id, d.timeLabel, isOnDemand)}
                    className="rounded-full bg-emerald-500 px-3 py-1 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-default shrink-0">
                    {d.done ? "✓ Administrat" : isOnDemand ? "Administrează" : "Marchează"}
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
        </section>
      ) : null}

      {/* ── Zone 2: Boli active ── */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Boli active {activeConditions.length > 0 ? `(${activeConditions.length})` : ""}
          </p>
          {!showAddCondition ? (
            <button type="button" onClick={() => setShowAddCondition(true)}
              className="flex items-center gap-1 text-xs font-semibold text-[#b66347] hover:text-[#8a4b2d]">
              <Plus className="w-3.5 h-3.5" /> Adaugă boală
            </button>
          ) : null}
        </div>

        {/* Add condition form */}
        {showAddCondition ? (
          <div className="rounded-[1.2rem] border border-[#ead9c8] bg-[#fffcf8] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide">Boală nouă</p>
              <button type="button" onClick={() => setShowAddCondition(false)}><X className="w-4 h-4 text-stone-400" /></button>
            </div>
            <input className="app-native-input w-full px-3 py-2 text-sm" placeholder="Ex. bronșită, otită, etc." value={conditionTitle} onChange={(e) => setConditionTitle(e.target.value)} />
            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-500 shrink-0">Început:</label>
              <input type="date" className="app-native-input flex-1 px-3 py-2 text-sm" value={conditionStartDate} onChange={(e) => setConditionStartDate(e.target.value)} />
            </div>
            <textarea className="app-native-input w-full px-3 py-2 text-sm" rows={2} placeholder="Observații (opțional)" value={conditionNotes} onChange={(e) => setConditionNotes(e.target.value)} />
            <div className="flex gap-2">
              <button type="button" onClick={addCondition} disabled={savingCondition || !conditionTitle.trim()} className="app-native-primary-button px-3 py-1.5 text-xs">
                {savingCondition ? "Se salvează…" : "Adaugă boala"}
              </button>
              <button type="button" onClick={() => setShowAddCondition(false)} className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800">
                Anulează
              </button>
            </div>
          </div>
        ) : null}

        {activeConditions.length === 0 && !showAddCondition ? (
          <p className="text-xs text-stone-400 py-1">Nicio boală activă înregistrată.</p>
        ) : null}

        {activeConditions.map((c) => (
          <ConditionCard key={c.id} condition={c} plans={plans} reports={reports}
            childId={childId} parent1Name={parent1Name} parent2Name={parent2Name} onRefresh={reload} />
        ))}
      </section>

      {/* ── Zone 3: Medicamente fără boală asociată ── */}
      {(orphanActivePlans.length > 0 || showAddOrphanPlan || showAddOrphanReport || orphanReports.length > 0) ? (
        <section className="rounded-[1.2rem] border border-stone-200 bg-white p-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Medicamente fără boală asociată</p>
          {orphanActivePlans.map((p) => (
            <div key={p.id} className="rounded-[0.9rem] bg-stone-50 px-3 py-2 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stone-700">{p.medicationName} · {p.dosage}</p>
                  <p className="text-xs text-stone-400">
                    {p.administrationMode === "on_demand"
                      ? `la nevoie · din ${p.startDate}`
                      : `${p.times.join(", ")} · ${p.recurrenceType === "interval" ? `la ${p.recurrenceIntervalDays ?? 1} zile` : "zilnic"} · din ${p.startDate}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => stopOrphanPlan(p.id)}
                  className="rounded-full border border-stone-300 px-2 py-0.5 text-[11px] font-semibold text-stone-500 hover:border-red-300 hover:text-red-600 transition shrink-0"
                >
                  Oprește
                </button>
              </div>
              {conditions.length > 0 ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-stone-400 shrink-0">Asociază la:</span>
                  <select
                    defaultValue=""
                    onChange={(e) => { if (e.target.value) associatePlan(p.id, e.target.value); }}
                    className="app-native-input px-2 py-0.5 text-xs flex-1"
                  >
                    <option value="">— alege boală —</option>
                    {conditions.map((c) => (
                      <option key={c.id} value={c.id}>{c.title} {c.status === "resolved" ? "(încheiată)" : ""}</option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
          ))}
          {orphanReports.map((r) => (
            <div key={r.id} className="rounded-[0.9rem] bg-stone-50 px-3 py-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                <a className="text-sm text-[#b66347] hover:underline truncate flex-1" href={`/api/children/health/reports/${r.id}`} target="_blank" rel="noopener noreferrer">{r.name}</a>
                <span className="text-[11px] text-stone-400 shrink-0">{new Date(r.createdAt).toLocaleDateString("ro-RO")}</span>
              </div>
              {conditions.length > 0 ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-stone-400 shrink-0">Asociază la:</span>
                  <select
                    defaultValue=""
                    onChange={(e) => { if (e.target.value) associateReport(r.id, e.target.value); }}
                    className="app-native-input px-2 py-0.5 text-xs flex-1"
                  >
                    <option value="">— alege boală —</option>
                    {conditions.map((c) => (
                      <option key={c.id} value={c.id}>{c.title} {c.status === "resolved" ? "(încheiată)" : ""}</option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
          ))}
          {showAddOrphanPlan ? (
            <AddPlanForm childId={childId} conditionId={null} parent1Name={parent1Name} parent2Name={parent2Name}
              onDone={() => { setShowAddOrphanPlan(false); reload(); }} onCancel={() => setShowAddOrphanPlan(false)} />
          ) : (
            <button type="button" onClick={() => setShowAddOrphanPlan(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#b66347] hover:text-[#8a4b2d]">
              <Plus className="w-3.5 h-3.5" /> Adaugă medicament
            </button>
          )}
          {showAddOrphanReport ? (
            <AddReportForm childId={childId} conditionId={null}
              onDone={() => { setShowAddOrphanReport(false); reload(); }} onCancel={() => setShowAddOrphanReport(false)} />
          ) : (
            <button type="button" onClick={() => setShowAddOrphanReport(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800">
              <Plus className="w-3.5 h-3.5" /> Atașează raport
            </button>
          )}
        </section>
      ) : (
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setShowAddOrphanPlan(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-[#b66347]">
            <Plus className="w-3.5 h-3.5" /> Medicament fără boală
          </button>
        </div>
      )}

      {/* ── Zone 4: Istoric (collapsed by default) ── */}
      <section className="rounded-[1.2rem] border border-stone-100 bg-stone-50 overflow-hidden">
        <button type="button" onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between px-3 py-3 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
            Istoric{resolvedConditions.length > 0 || pastHistory.length > 0
              ? ` · ${resolvedConditions.length} boli încheiate, ${pastHistory.length} administrări`
              : ""}
          </p>
          {showHistory ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </button>

        {showHistory ? (
          <div className="border-t border-stone-100 px-3 pb-3 pt-2 space-y-4">
            {/* Resolved conditions */}
            {resolvedConditions.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">Boli încheiate</p>
                {resolvedConditions.map((c) => (
                  <ConditionCard key={c.id} condition={c} plans={plans} reports={reports}
                    childId={childId} parent1Name={parent1Name} parent2Name={parent2Name} onRefresh={reload} />
                ))}
              </div>
            ) : null}

            {/* Past medication administrations */}
            {pastHistory.length > 0 ? (
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">Medicamente administrate</p>
                {pastHistory.slice(0, 30).map((item) => (
                  <div key={item.id} className="rounded-[0.9rem] bg-white px-3 py-2 text-xs text-stone-600">
                    <span className="font-medium">{item.date}</span> · {item.timeLabel} · {item.medicationName} ({item.dosage})
                  </div>
                ))}
                {pastHistory.length > 30 ? (
                  <p className="text-xs text-stone-400 pl-1">… și {pastHistory.length - 30} mai vechi</p>
                ) : null}
              </div>
            ) : null}

            {resolvedConditions.length === 0 && pastHistory.length === 0 ? (
              <p className="text-xs text-stone-400">Niciun istoric înregistrat.</p>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
