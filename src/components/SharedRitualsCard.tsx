"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { endOfMonth, format, parse, startOfMonth } from "date-fns";
import { Check, Plus, Trash2 } from "lucide-react";
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
    return new Date(ymd + "T12:00:00").toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" });
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

interface RitualReportCaretakerCell {
  eligible: number;
  done: number;
  missed: number;
}

interface RitualReportRow {
  ritualId: string;
  title: string;
  responsibleParent: RitualResponsibleParent;
  active: boolean;
  byCaretaker: {
    tata: RitualReportCaretakerCell;
    mama: RitualReportCaretakerCell;
    together: RitualReportCaretakerCell;
  };
  totals: { eligible: number; done: number; missed: number };
}

function formatReportCell(s: RitualReportCaretakerCell): string {
  if (s.eligible === 0) return "—";
  return `${s.done}/${s.eligible}`;
}

function reportCellTitle(s: RitualReportCaretakerCell): string {
  if (s.eligible === 0) return "Nicio zi eligibilă în această coloană";
  return `Bifat: ${s.done} · Lipsă: ${s.missed} (din ${s.eligible} zile cu program)`;
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
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newResponsibleParent, setNewResponsibleParent] = useState<RitualResponsibleParent>("both");
  const [newLeadMinutes, setNewLeadMinutes] = useState(10);
  const [selectedDate, setSelectedDate] = useState(() => todayBucharest());
  const [checkins, setCheckins] = useState<Record<string, string>>({});
  const [reportMonth, setReportMonth] = useState(ymBucharestNow);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportRows, setReportRows] = useState<RitualReportRow[] | null>(null);
  const [reportDaysWithSchedule, setReportDaysWithSchedule] = useState<number | null>(null);

  const loadReport = useCallback(async () => {
    const range = monthYmToRange(reportMonth);
    if (!range) return;
    setReportLoading(true);
    try {
      const res = await fetch(
        `/api/rituals/report?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`
      );
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
    loadReport();
  }, [loadReport]);

  const activeRituals = useMemo(
    () => rituals.filter((r) => r.active).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "ro")),
    [rituals]
  );

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
    return () => {
      cancelled = true;
    };
  }, [fetchRituals, fetchCheckins, selectedDate]);

  async function addRitual() {
    const title = newTitle.trim();
    if (!title) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/rituals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          timeLabel: newTime.trim() || null,
          reminderLeadMinutes: newLeadMinutes,
          responsibleParent: newResponsibleParent,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : "Nu s-a putut adăuga ritualul.");
        return;
      }
      const created = json.ritual as FamilyRitual;
      setRituals((prev) => [...prev, created]);
      setNewTitle("");
      setNewTime("");
      setNewResponsibleParent("both");
      setNewLeadMinutes(10);
    } finally {
      setSaving(false);
    }
  }

  async function addTemplate(template: {
    title: string;
    timeLabel: string;
    responsibleParent: RitualResponsibleParent;
    reminderLeadMinutes: number;
  }) {
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
    setCheckins((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function moveRitual(id: string, direction: -1 | 1) {
    const sorted = [...activeRituals];
    const idx = sorted.findIndex((r) => r.id === id);
    if (idx === -1) return;
    const target = idx + direction;
    if (target < 0 || target >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[target];
    // optimistic
    setRituals((prev) =>
      prev.map((r) =>
        r.id === a.id ? { ...r, order: b.order } : r.id === b.id ? { ...r, order: a.order } : r
      )
    );
    await fetch("/api/rituals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: a.id, order: b.order }),
    });
    await fetch("/api/rituals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: b.id, order: a.order }),
    });
    await fetchRituals();
  }

  async function updateResponsible(ritualId: string, responsibleParent: RitualResponsibleParent) {
    setRituals((prev) => prev.map((r) => (r.id === ritualId ? { ...r, responsibleParent } : r)));
    await fetch("/api/rituals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ritualId, responsibleParent }),
    });
  }

  async function updateLead(ritualId: string, reminderLeadMinutes: number) {
    setRituals((prev) => prev.map((r) => (r.id === ritualId ? { ...r, reminderLeadMinutes } : r)));
    await fetch("/api/rituals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ritualId, reminderLeadMinutes }),
    });
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
    if (res.ok) {
      setCheckins((prev) => {
        const next = { ...prev };
        delete next[ritualId];
        return next;
      });
    }
  }

  return (
    <section
      id="rituals"
      className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-4 scroll-mt-20"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">Ritualuri comune</h2>
        <span className="text-[11px] text-stone-500 dark:text-stone-400">aceleași reguli în toate locuințele</span>
      </div>
      <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
        O singură rutină pentru {parent1Name} și {parent2Name}. Setezi și responsabilul; primește reminder la ora
        ritualului.
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="text-xs text-stone-500 dark:text-stone-400">Zi:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
        />
        <span className="text-xs text-stone-400">{roDate(selectedDate)}</span>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>}

      {loading ? (
        <p className="text-sm text-stone-500 dark:text-stone-400">Se încarcă ritualurile…</p>
      ) : activeRituals.length === 0 ? (
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">Nu există ritualuri încă.</p>
      ) : (
        <ul className="space-y-2 mb-3">
          {activeRituals.map((r, idx) => {
            const done = Object.prototype.hasOwnProperty.call(checkins, r.id);
            return (
              <li
                key={r.id}
                className={`rounded-xl border px-3 py-2 flex items-center justify-between gap-2 ${
                  done
                    ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/25"
                    : "border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/40"
                }`}
              >
                <label className="min-w-0 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={(e) => toggleCompleted(r.id, e.target.checked)}
                    className="rounded border-stone-300"
                  />
                  <span className="min-w-0">
                    <span className={`block text-sm font-medium ${done ? "text-emerald-800 dark:text-emerald-300" : "text-stone-800 dark:text-stone-200"}`}>
                      {r.title}
                    </span>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      {r.timeLabel && (
                        <span className="rounded bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 text-[11px] text-stone-600 dark:text-stone-300">
                          {r.timeLabel}
                        </span>
                      )}
                      <select
                        value={r.responsibleParent}
                        onChange={(e) => updateResponsible(r.id, e.target.value as RitualResponsibleParent)}
                        className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-2 py-1 text-xs"
                      >
                        <option value="both">amândoi</option>
                        <option value="tata">{parent1Name}</option>
                        <option value="mama">{parent2Name}</option>
                      </select>
                      <select
                        value={String(r.reminderLeadMinutes ?? 0)}
                        onChange={(e) => updateLead(r.id, Number(e.target.value))}
                        className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-2 py-1 text-xs"
                        title="Cu câte minute înainte notificăm"
                      >
                        <option value="0">la oră</option>
                        <option value="5">-5 min</option>
                        <option value="10">-10 min</option>
                        <option value="15">-15 min</option>
                        <option value="30">-30 min</option>
                      </select>
                    </div>
                  </span>
                </label>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveRitual(r.id, -1)}
                    disabled={idx === 0}
                    className="rounded-lg border border-stone-200 dark:border-stone-700 px-1.5 py-1 text-xs text-stone-600 disabled:opacity-40"
                    title="Mută sus"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveRitual(r.id, 1)}
                    disabled={idx === activeRituals.length - 1}
                    className="rounded-lg border border-stone-200 dark:border-stone-700 px-1.5 py-1 text-xs text-stone-600 disabled:opacity-40"
                    title="Mută jos"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRitual(r.id)}
                    className="rounded-lg border border-red-200 dark:border-red-900/50 px-2 py-1 text-xs text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Șterge ritual"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 p-3 mb-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-100">Raport ritualuri</h3>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-stone-500 dark:text-stone-400">Lună:</label>
            <input
              type="month"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 px-2 py-1 text-sm"
            />
            <button
              type="button"
              onClick={() => loadReport()}
              disabled={reportLoading}
              className="rounded-lg border border-stone-300 dark:border-stone-600 px-2 py-1 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-50"
            >
              Reîncarcă
            </button>
          </div>
        </div>
        <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-2 leading-relaxed">
          Numărăm doar zilele cu program în calendar. O zi e „eligibilă” pentru un ritual dacă responsabilul setat
          (sau „amândoi”) se potrivește cu cine e trecut cu copilul; la „împreună” ritualul cu un singur părinte
          responsabil tot se numără. <strong className="text-stone-600 dark:text-stone-300">bifat / zile eligibile</strong>{" "}
          = de câte ori ați bifat ritualul vs câte astfel de zile au fost.
        </p>
        {reportLoading && reportRows === null ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">Se încarcă raportul…</p>
        ) : reportRows && reportRows.length === 0 ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">Nu există ritualuri de raportat.</p>
        ) : reportRows && reportDaysWithSchedule === 0 ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Nu există zile cu program în calendar pentru luna selectată.
          </p>
        ) : reportRows ? (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full min-w-[520px] text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-600 text-stone-500 dark:text-stone-400">
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
                <tr className="border-b border-stone-200 dark:border-stone-600 text-[10px] text-stone-400 dark:text-stone-500">
                  <th className="pb-2 pr-2 font-normal" />
                  <th className="pb-2 px-1 font-normal text-center">bifat / eligibil</th>
                  <th className="pb-2 px-1 font-normal text-center">bifat / eligibil</th>
                  <th className="pb-2 px-1 font-normal text-center">bifat / eligibil</th>
                  <th className="pb-2 pl-1 font-normal text-center">bifat / eligibil</th>
                </tr>
              </thead>
              <tbody>
                {reportRows.map((row) => (
                  <tr
                    key={row.ritualId}
                    className={`border-b border-stone-100 dark:border-stone-800 ${
                      row.active ? "" : "opacity-60"
                    }`}
                  >
                    <td className="py-2 pr-2 text-stone-800 dark:text-stone-200">
                      <span className="font-medium">{row.title}</span>
                      {!row.active && (
                        <span className="ml-1 text-[10px] text-stone-400">(inactiv)</span>
                      )}
                      <span className="block text-[10px] text-stone-400 mt-0.5">
                        Resp.:{" "}
                        {row.responsibleParent === "both"
                          ? "amândoi"
                          : row.responsibleParent === "tata"
                            ? parent1Name
                            : parent2Name}
                      </span>
                    </td>
                    <td className="py-2 px-1 text-center font-mono text-stone-700 dark:text-stone-300" title={reportCellTitle(row.byCaretaker.tata)}>
                      {formatReportCell(row.byCaretaker.tata)}
                    </td>
                    <td className="py-2 px-1 text-center font-mono text-stone-700 dark:text-stone-300" title={reportCellTitle(row.byCaretaker.mama)}>
                      {formatReportCell(row.byCaretaker.mama)}
                    </td>
                    <td className="py-2 px-1 text-center font-mono text-stone-700 dark:text-stone-300" title={reportCellTitle(row.byCaretaker.together)}>
                      {formatReportCell(row.byCaretaker.together)}
                    </td>
                    <td className="py-2 pl-1 text-center font-mono font-medium text-amber-800 dark:text-amber-200" title={reportCellTitle({ eligible: row.totals.eligible, done: row.totals.done, missed: row.totals.missed })}>
                      {row.totals.eligible === 0 ? "—" : `${row.totals.done}/${row.totals.eligible}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {reportDaysWithSchedule != null && reportDaysWithSchedule > 0 && (
          <p className="mt-2 text-[11px] text-stone-400 dark:text-stone-500">
            {reportDaysWithSchedule} zile cu program în calendar (în intervalul lunii).
          </p>
        )}
      </div>

      <div className="rounded-xl border border-stone-200 dark:border-stone-700 p-3 mb-3">
        <p className="text-xs font-medium text-stone-600 dark:text-stone-300 mb-2">Adaugă ritual</p>
        <div className="grid gap-2 sm:grid-cols-[1fr_7rem_10rem_8rem_auto]">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Ex. Spălat pe dinți"
            className="rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
          />
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
          />
          <select
            value={newResponsibleParent}
            onChange={(e) => setNewResponsibleParent(e.target.value as RitualResponsibleParent)}
            className="rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
          >
            <option value="both">Responsabil: amândoi</option>
            <option value="tata">Responsabil: {parent1Name}</option>
            <option value="mama">Responsabil: {parent2Name}</option>
          </select>
          <select
            value={String(newLeadMinutes)}
            onChange={(e) => setNewLeadMinutes(Number(e.target.value))}
            className="rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
            title="Notificare cu X minute înainte"
          >
            <option value="0">La oră</option>
            <option value="5">-5 min</option>
            <option value="10">-10 min</option>
            <option value="15">-15 min</option>
            <option value="30">-30 min</option>
          </select>
          <button
            type="button"
            onClick={addRitual}
            disabled={saving || !newTitle.trim()}
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Adaugă
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_TEMPLATES.map((t) => (
          <button
            key={t.title}
            type="button"
            onClick={() => addTemplate(t)}
            className="inline-flex items-center gap-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 px-2.5 py-1.5 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
            title={`Adaugă „${t.title}”`}
          >
            <Check className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" />
            {t.title} {t.timeLabel ? `(${t.timeLabel})` : ""}
          </button>
        ))}
      </div>
    </section>
  );
}

