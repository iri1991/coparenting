"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { endOfMonth, format, parse, startOfMonth } from "date-fns";
import { Check, ChevronDown, ChevronUp, Circle, CheckCircle2, Plus, Trash2, X } from "lucide-react";
import type { FamilyRitual, RitualResponsibleParent } from "@/types/ritual";

interface SharedRitualsCardProps {
  parent1Name: string;
  parent2Name: string;
}

function todayBucharest(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Bucharest" });
}

function roDate(ymd: string): string {
  try {
    return new Date(ymd + "T12:00:00").toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return ymd;
  }
}

function ymBucharestNow(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Bucharest" }).slice(0, 7);
}

function monthYmToRange(ym: string): { from: string; to: string } | null {
  if (!/^\d{4}-\d{2}$/.test(ym)) return null;
  const base = parse(`${ym}-01`, "yyyy-MM-dd", new Date());
  if (Number.isNaN(base.getTime())) return null;
  return {
    from: format(startOfMonth(base), "yyyy-MM-dd"),
    to: format(endOfMonth(base), "yyyy-MM-dd"),
  };
}

interface RitualReportCaretakerCell { eligible: number; done: number; missed: number; }
interface RitualReportRow {
  ritualId: string;
  title: string;
  responsibleParent: RitualResponsibleParent;
  active: boolean;
  byCaretaker: { tata: RitualReportCaretakerCell; mama: RitualReportCaretakerCell; together: RitualReportCaretakerCell };
  totals: { eligible: number; done: number; missed: number };
}

function fmtCell(s: RitualReportCaretakerCell): string {
  return s.eligible === 0 ? "—" : `${s.done}/${s.eligible}`;
}
function cellTitle(s: RitualReportCaretakerCell): string {
  return s.eligible === 0
    ? "Nicio zi eligibilă"
    : `Bifat: ${s.done} · Lipsă: ${s.missed} (din ${s.eligible} zile)`;
}

const QUICK_TEMPLATES = [
  { title: "Duș de seară", timeLabel: "19:00", responsibleParent: "both" as RitualResponsibleParent, reminderLeadMinutes: 10 },
  { title: "Spălat pe dinți", timeLabel: "19:20", responsibleParent: "both" as RitualResponsibleParent, reminderLeadMinutes: 5 },
  { title: "Rugăciune / moment de liniște", timeLabel: "19:25", responsibleParent: "both" as RitualResponsibleParent, reminderLeadMinutes: 5 },
  { title: "Somn", timeLabel: "19:30", responsibleParent: "both" as RitualResponsibleParent, reminderLeadMinutes: 10 },
] as const;

export function SharedRitualsCard({ parent1Name, parent2Name }: SharedRitualsCardProps) {
  const [rituals, setRituals] = useState<FamilyRitual[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Zone 1: checkins
  const [selectedDate, setSelectedDate] = useState(() => todayBucharest());
  const [checkins, setCheckins] = useState<Record<string, string>>({});

  // Zone 3: add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newResponsibleParent, setNewResponsibleParent] = useState<RitualResponsibleParent>("both");
  const [newLeadMinutes, setNewLeadMinutes] = useState(10);

  // Zone 4: report
  const [showReport, setShowReport] = useState(false);
  const [reportMonth, setReportMonth] = useState(ymBucharestNow);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportRows, setReportRows] = useState<RitualReportRow[] | null>(null);
  const [reportDaysWithSchedule, setReportDaysWithSchedule] = useState<number | null>(null);

  // ── data fetching ──────────────────────────────────────────────────────
  const fetchRituals = useCallback(async () => {
    const res = await fetch("/api/rituals");
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof json.error === "string" ? json.error : "Nu s-au putut încărca ritualurile.");
      return;
    }
    setRituals(Array.isArray(json.rituals) ? json.rituals : []);
  }, []);

  const fetchCheckins = useCallback(async (date: string) => {
    const res = await fetch(`/api/rituals/checkins?date=${encodeURIComponent(date)}`);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return;
    setCheckins(json.checkins && typeof json.checkins === "object" ? json.checkins : {});
  }, []);

  const loadReport = useCallback(async () => {
    const range = monthYmToRange(reportMonth);
    if (!range) return;
    setReportLoading(true);
    try {
      const res = await fetch(`/api/rituals/report?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`);
      const json = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(json.rows)) {
        setReportRows(json.rows as RitualReportRow[]);
        setReportDaysWithSchedule(typeof json.daysWithSchedule === "number" ? json.daysWithSchedule : null);
      } else {
        setReportRows([]);
        setReportDaysWithSchedule(null);
      }
    } catch {
      setReportRows([]);
      setReportDaysWithSchedule(null);
    } finally {
      setReportLoading(false);
    }
  }, [reportMonth]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchRituals(), fetchCheckins(selectedDate)]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [fetchRituals, fetchCheckins, selectedDate]);

  // load report only when section opens
  useEffect(() => {
    if (showReport) loadReport();
  }, [showReport, loadReport]);

  const activeRituals = useMemo(
    () => rituals.filter((r) => r.active).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "ro")),
    [rituals]
  );

  // ── mutations ──────────────────────────────────────────────────────────
  async function addRitual() {
    const title = newTitle.trim();
    if (!title) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/rituals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, timeLabel: newTime.trim() || null, reminderLeadMinutes: newLeadMinutes, responsibleParent: newResponsibleParent }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setError(typeof json.error === "string" ? json.error : "Nu s-a putut adăuga."); return; }
      setRituals((prev) => [...prev, json.ritual as FamilyRitual]);
      setNewTitle("");
      setNewTime("");
      setNewResponsibleParent("both");
      setNewLeadMinutes(10);
      setShowAddForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function addTemplate(template: { title: string; timeLabel: string; responsibleParent: RitualResponsibleParent; reminderLeadMinutes: number }) {
    if (rituals.some((r) => r.title.trim().toLowerCase() === template.title.trim().toLowerCase())) return;
    setSaving(true);
    try {
      const res = await fetch("/api/rituals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ritual) setRituals((prev) => [...prev, json.ritual as FamilyRitual]);
    } finally {
      setSaving(false);
    }
  }

  async function removeRitual(id: string) {
    if (!confirm("Ștergi acest ritual?")) return;
    const res = await fetch(`/api/rituals?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) return;
    setRituals((prev) => prev.filter((r) => r.id !== id));
    setCheckins((prev) => { const next = { ...prev }; delete next[id]; return next; });
  }

  async function moveRitual(id: string, direction: -1 | 1) {
    const sorted = [...activeRituals];
    const idx = sorted.findIndex((r) => r.id === id);
    if (idx === -1) return;
    const target = idx + direction;
    if (target < 0 || target >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[target];
    setRituals((prev) =>
      prev.map((r) => r.id === a.id ? { ...r, order: b.order } : r.id === b.id ? { ...r, order: a.order } : r)
    );
    await fetch("/api/rituals", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: a.id, order: b.order }) });
    await fetch("/api/rituals", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.id, order: a.order }) });
    await fetchRituals();
  }

  async function updateResponsible(ritualId: string, responsibleParent: RitualResponsibleParent) {
    setRituals((prev) => prev.map((r) => r.id === ritualId ? { ...r, responsibleParent } : r));
    await fetch("/api/rituals", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: ritualId, responsibleParent }) });
  }

  async function updateLead(ritualId: string, reminderLeadMinutes: number) {
    setRituals((prev) => prev.map((r) => r.id === ritualId ? { ...r, reminderLeadMinutes } : r));
    await fetch("/api/rituals", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: ritualId, reminderLeadMinutes }) });
  }

  async function toggleCompleted(ritualId: string, checked: boolean) {
    if (checked) {
      const res = await fetch("/api/rituals/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ritualId, date: selectedDate }),
      });
      if (res.ok) setCheckins((prev) => ({ ...prev, [ritualId]: "me" }));
      return;
    }
    const res = await fetch(
      `/api/rituals/checkins?ritualId=${encodeURIComponent(ritualId)}&date=${encodeURIComponent(selectedDate)}`,
      { method: "DELETE" }
    );
    if (res.ok) setCheckins((prev) => { const next = { ...prev }; delete next[ritualId]; return next; });
  }

  const doneTodayCount = activeRituals.filter((r) => Object.prototype.hasOwnProperty.call(checkins, r.id)).length;

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <section id="rituals" className="app-native-surface rounded-[2rem] p-4 scroll-mt-20 sm:p-5 space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Rutine</p>
          <h2 className="text-base font-semibold text-stone-900">Ritualuri comune</h2>
        </div>
        <span className="text-[11px] text-stone-500">aceleași reguli în toate locuințele</span>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {/* ── Zone 1: Bife azi ── */}
      <section className="rounded-[1.4rem] border border-[#b0d8ca] bg-[#f0faf6] p-3 space-y-2">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#1f5a4e]">
            Bife azi
            {activeRituals.length > 0
              ? ` · ${doneTodayCount}/${activeRituals.length}`
              : ""}
          </p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="app-native-input px-2 py-1 text-xs"
            />
            <span className="text-[11px] text-stone-500">{roDate(selectedDate)}</span>
          </div>
        </div>

        {loading ? (
          <p className="text-xs text-stone-500">Se încarcă…</p>
        ) : activeRituals.length === 0 ? (
          <p className="text-xs text-stone-500">Niciun ritual configurat. Adaugă mai jos.</p>
        ) : (
          <ul className="space-y-1.5">
            {activeRituals.map((r) => {
              const done = Object.prototype.hasOwnProperty.call(checkins, r.id);
              return (
                <li key={r.id}
                  className={`rounded-[0.9rem] px-3 py-2 flex items-center justify-between gap-2 ${
                    done ? "bg-white/70 border border-emerald-200" : "bg-white border border-white/60"
                  }`}
                >
                  <label className="flex items-center gap-2 cursor-pointer min-w-0">
                    {done
                      ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                      : <Circle className="w-4 h-4 shrink-0 text-stone-300" />
                    }
                    <input type="checkbox" checked={done} onChange={(e) => toggleCompleted(r.id, e.target.checked)} className="sr-only" />
                    <span className={`text-sm font-medium truncate ${done ? "text-emerald-800" : "text-stone-800"}`}>
                      {r.title}
                    </span>
                    {r.timeLabel ? (
                      <span className="rounded-full bg-[#f6eee5] px-2 py-0.5 text-[11px] text-stone-500 shrink-0">{r.timeLabel}</span>
                    ) : null}
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Zone 2: Ritualuri active (management) ── */}
      {activeRituals.length > 0 ? (
        <section className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
            Ritualuri configurate ({activeRituals.length})
          </p>
          <ul className="space-y-1.5">
            {activeRituals.map((r, idx) => (
              <li key={r.id}
                className="rounded-[1rem] border border-white/70 bg-white/80 px-3 py-2.5 shadow-[0_4px_12px_rgba(28,25,23,0.04)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-stone-800 truncate">{r.title}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => moveRitual(r.id, -1)} disabled={idx === 0}
                      className="rounded px-1.5 py-1 text-xs text-stone-400 hover:text-stone-700 disabled:opacity-30" title="Mută sus">↑</button>
                    <button type="button" onClick={() => moveRitual(r.id, 1)} disabled={idx === activeRituals.length - 1}
                      className="rounded px-1.5 py-1 text-xs text-stone-400 hover:text-stone-700 disabled:opacity-30" title="Mută jos">↓</button>
                    <button type="button" onClick={() => removeRitual(r.id)}
                      className="rounded p-1 text-stone-300 hover:text-red-500 transition" title="Șterge">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {r.timeLabel ? (
                    <span className="rounded-full bg-[#f6eee5] px-2 py-0.5 text-[11px] text-stone-600">{r.timeLabel}</span>
                  ) : null}
                  <select value={r.responsibleParent} onChange={(e) => updateResponsible(r.id, e.target.value as RitualResponsibleParent)}
                    className="app-native-input px-2 py-0.5 text-xs">
                    <option value="both">amândoi</option>
                    <option value="tata">{parent1Name}</option>
                    <option value="mama">{parent2Name}</option>
                  </select>
                  <select value={String(r.reminderLeadMinutes ?? 0)} onChange={(e) => updateLead(r.id, Number(e.target.value))}
                    className="app-native-input px-2 py-0.5 text-xs" title="Reminder">
                    <option value="0">la oră</option>
                    <option value="5">-5 min</option>
                    <option value="10">-10 min</option>
                    <option value="15">-15 min</option>
                    <option value="30">-30 min</option>
                  </select>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ── Zone 3: Adaugă ritual (collapsible) ── */}
      <section>
        {!showAddForm ? (
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#b66347] hover:text-[#8a4b2d]">
              <Plus className="w-3.5 h-3.5" /> Adaugă ritual
            </button>
            <span className="text-stone-300 text-xs">·</span>
            <span className="text-xs text-stone-400">Template-uri rapide:</span>
            {QUICK_TEMPLATES.map((t) => {
              const exists = rituals.some((r) => r.title.trim().toLowerCase() === t.title.trim().toLowerCase());
              return (
                <button key={t.title} type="button" onClick={() => addTemplate(t)} disabled={saving || exists}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                    exists
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600 opacity-60 cursor-default"
                      : "border-[#ead9c8] bg-white/80 text-stone-600 hover:bg-[#fff3e7]"
                  }`}>
                  {exists ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  {t.title}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.2rem] border border-[#ead9c8] bg-[#fffcf8] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Ritual nou</p>
              <button type="button" onClick={() => setShowAddForm(false)}><X className="w-4 h-4 text-stone-400" /></button>
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_7rem]">
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex. Spălat pe dinți" className="app-native-input px-3 py-2 text-sm" />
              <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)}
                className="app-native-input px-3 py-2 text-sm" />
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={newResponsibleParent} onChange={(e) => setNewResponsibleParent(e.target.value as RitualResponsibleParent)}
                className="app-native-input px-3 py-2 text-sm flex-1">
                <option value="both">Responsabil: amândoi</option>
                <option value="tata">{parent1Name}</option>
                <option value="mama">{parent2Name}</option>
              </select>
              <select value={String(newLeadMinutes)} onChange={(e) => setNewLeadMinutes(Number(e.target.value))}
                className="app-native-input px-3 py-2 text-sm">
                <option value="0">La oră</option>
                <option value="5">-5 min</option>
                <option value="10">-10 min</option>
                <option value="15">-15 min</option>
                <option value="30">-30 min</option>
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={addRitual} disabled={saving || !newTitle.trim()}
                className="app-native-primary-button inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold disabled:opacity-50">
                <Plus className="w-3.5 h-3.5" /> Adaugă
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800">
                Anulează
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Zone 4: Raport (collapsed) ── */}
      <section className="rounded-[1.2rem] border border-stone-100 bg-stone-50 overflow-hidden">
        <button type="button" onClick={() => setShowReport(!showReport)}
          className="w-full flex items-center justify-between px-3 py-3 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
            Raport ritualuri
          </p>
          {showReport ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </button>

        {showReport ? (
          <div className="border-t border-stone-100 px-3 pb-4 pt-3 space-y-3">
            <p className="text-[11px] leading-relaxed text-stone-500">
              Numărăm doar zilele cu program. O zi e „eligibilă" dacă responsabilul setat se potrivește cu cine e trecut cu copilul.{" "}
              <strong className="text-stone-600">bifat / zile eligibile</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs text-stone-500">Lună:</label>
              <input type="month" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)}
                className="app-native-input px-2 py-1 text-sm" />
              <button type="button" onClick={() => loadReport()} disabled={reportLoading}
                className="app-native-secondary-button px-3 py-1.5 text-xs font-semibold text-stone-700 disabled:opacity-50">
                Reîncarcă
              </button>
            </div>

            {reportLoading && reportRows === null ? (
              <p className="text-xs text-stone-500">Se încarcă raportul…</p>
            ) : reportRows && reportRows.length === 0 ? (
              <p className="text-xs text-stone-500">Nu există ritualuri de raportat.</p>
            ) : reportRows && reportDaysWithSchedule === 0 ? (
              <p className="text-xs text-stone-500">Nu există zile cu program în calendar pentru luna selectată.</p>
            ) : reportRows ? (
              <>
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full min-w-[480px] text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-500">
                        <th className="py-2 pr-2 font-medium">Ritual</th>
                        <th className="py-2 px-1 font-medium text-center whitespace-nowrap" title={parent1Name}>
                          {parent1Name.length > 12 ? `${parent1Name.slice(0, 11)}…` : parent1Name}
                        </th>
                        <th className="py-2 px-1 font-medium text-center whitespace-nowrap" title={parent2Name}>
                          {parent2Name.length > 12 ? `${parent2Name.slice(0, 11)}…` : parent2Name}
                        </th>
                        <th className="py-2 px-1 font-medium text-center">Împreună</th>
                        <th className="py-2 pl-1 font-medium text-center">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportRows.map((row) => (
                        <tr key={row.ritualId} className={`border-b border-stone-100 ${row.active ? "" : "opacity-60"}`}>
                          <td className="py-2 pr-2 text-stone-800">
                            <span className="font-medium">{row.title}</span>
                            {!row.active ? <span className="ml-1 text-[10px] text-stone-400">(inactiv)</span> : null}
                            <span className="block text-[10px] text-stone-400 mt-0.5">
                              {row.responsibleParent === "both" ? "amândoi" : row.responsibleParent === "tata" ? parent1Name : parent2Name}
                            </span>
                          </td>
                          <td className="py-2 px-1 text-center font-mono text-stone-700" title={cellTitle(row.byCaretaker.tata)}>{fmtCell(row.byCaretaker.tata)}</td>
                          <td className="py-2 px-1 text-center font-mono text-stone-700" title={cellTitle(row.byCaretaker.mama)}>{fmtCell(row.byCaretaker.mama)}</td>
                          <td className="py-2 px-1 text-center font-mono text-stone-700" title={cellTitle(row.byCaretaker.together)}>{fmtCell(row.byCaretaker.together)}</td>
                          <td className="py-2 pl-1 text-center font-mono font-semibold text-amber-800"
                            title={cellTitle({ eligible: row.totals.eligible, done: row.totals.done, missed: row.totals.missed })}>
                            {row.totals.eligible === 0 ? "—" : `${row.totals.done}/${row.totals.eligible}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {reportDaysWithSchedule != null && reportDaysWithSchedule > 0 ? (
                  <p className="text-[11px] text-stone-400">{reportDaysWithSchedule} zile cu program în calendar.</p>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}
      </section>
    </section>
  );
}
