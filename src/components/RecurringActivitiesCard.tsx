"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X, CalendarClock, CalendarPlus } from "lucide-react";
import type { RecurringActivity, RecurringActivityOverride, Weekday } from "@/types/recurring-activity";
import { WEEKDAYS } from "@/types/recurring-activity";
import { addDaysToDateString } from "@/lib/date-bucharest";
import { useLanguage } from "@/contexts/LanguageContext";

function weekdayOrder(w: Weekday): number {
  return WEEKDAYS.indexOf(w);
}

function todayBucharest(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Bucharest" });
}

function localeShortDate(ymd: string, lang: "ro" | "en"): string {
  try {
    return new Date(ymd + "T12:00:00").toLocaleDateString(lang === "en" ? "en-GB" : "ro-RO", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return ymd;
  }
}

export function RecurringActivitiesCard() {
  const { t, lang } = useLanguage();
  const ra = t.app.recurringActivities;

  const weekdayLabels: Record<Weekday, string> = useMemo(
    () => ({
      mon: ra.weekdayMon,
      tue: ra.weekdayTue,
      wed: ra.weekdayWed,
      thu: ra.weekdayThu,
      fri: ra.weekdayFri,
      sat: ra.weekdaySat,
      sun: ra.weekdaySun,
    }),
    [ra]
  );

  const quickTemplates = useMemo(
    () =>
      [
        { title: ra.templateBallet, weekday: "tue" as Weekday, timeLabel: "17:00" },
        { title: ra.templateSwimming, weekday: "thu" as Weekday, timeLabel: "18:00" },
        { title: ra.templateFootball, weekday: "sat" as Weekday, timeLabel: "10:00" },
      ] as const,
    [ra]
  );

  const overrideRange = useMemo(() => {
    const from = todayBucharest();
    return { from, to: addDaysToDateString(from, 56) };
  }, []);

  const [activities, setActivities] = useState<RecurringActivity[]>([]);
  const [overrides, setOverrides] = useState<RecurringActivityOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newWeekday, setNewWeekday] = useState<Weekday>("mon");
  const [newTime, setNewTime] = useState("");
  const [newLeadMinutes, setNewLeadMinutes] = useState(30);

  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState("");

  const [exceptionActivityId, setExceptionActivityId] = useState<string | null>(null);
  const [exDate, setExDate] = useState("");
  const [exTime, setExTime] = useState("");
  const [exSkipped, setExSkipped] = useState(false);

  const fetchActivities = useCallback(async () => {
    const res = await fetch("/api/recurring-activities");
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof json.error === "string" ? json.error : ra.errorLoad);
      return;
    }
    setActivities(Array.isArray(json.activities) ? json.activities : []);
  }, [ra.errorLoad]);

  const fetchOverrides = useCallback(async () => {
    const q = new URLSearchParams({ from: overrideRange.from, to: overrideRange.to });
    const res = await fetch(`/api/recurring-activities/overrides?${q}`);
    const json = await res.json().catch(() => ({}));
    if (res.ok) setOverrides(Array.isArray(json.overrides) ? json.overrides : []);
  }, [overrideRange.from, overrideRange.to]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchActivities(), fetchOverrides()]);
      setLoading(false);
    })();
  }, [fetchActivities, fetchOverrides]);

  const overridesByActivity = useMemo(() => {
    const m = new Map<string, RecurringActivityOverride[]>();
    for (const o of overrides) {
      const list = m.get(o.activityId) ?? [];
      list.push(o);
      m.set(o.activityId, list);
    }
    for (const [, list] of m) list.sort((a, b) => a.date.localeCompare(b.date));
    return m;
  }, [overrides]);

  const sorted = useMemo(
    () =>
      [...activities]
        .filter((a) => a.active)
        .sort((a, b) => {
          const wd = weekdayOrder(a.weekday) - weekdayOrder(b.weekday);
          if (wd !== 0) return wd;
          return a.timeLabel.localeCompare(b.timeLabel);
        }),
    [activities]
  );

  async function addActivity(payload: { title: string; weekday: Weekday; timeLabel: string; reminderLeadMinutes: number }) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/recurring-activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.activity) {
        setError(typeof json.error === "string" ? json.error : ra.errorAdd);
        return;
      }
      setActivities((prev) => [...prev, json.activity as RecurringActivity]);
      setShowAddForm(false);
      setNewTitle("");
      setNewTime("");
      setNewWeekday("mon");
      setNewLeadMinutes(30);
    } finally {
      setSaving(false);
    }
  }

  async function addFromForm() {
    if (!newTitle.trim() || !newTime) return;
    await addActivity({
      title: newTitle.trim(),
      weekday: newWeekday,
      timeLabel: newTime,
      reminderLeadMinutes: newLeadMinutes,
    });
  }

  async function addTemplate(tpl: { title: string; weekday: Weekday; timeLabel: string }) {
    if (activities.some((a) => a.title.trim().toLowerCase() === tpl.title.trim().toLowerCase())) return;
    await addActivity({ ...tpl, reminderLeadMinutes: 30 });
  }

  async function patchActivity(id: string, patch: Partial<Pick<RecurringActivity, "weekday" | "timeLabel" | "reminderLeadMinutes" | "title">>) {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    await fetch("/api/recurring-activities", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
  }

  async function removeActivity(id: string) {
    if (!confirm(ra.deleteConfirm)) return;
    const res = await fetch(`/api/recurring-activities?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) return;
    setActivities((prev) => prev.filter((a) => a.id !== id));
    setOverrides((prev) => prev.filter((o) => o.activityId !== id));
  }

  function startEditName(id: string, currentTitle: string) {
    setEditingNameId(id);
    setEditingNameValue(currentTitle);
  }

  async function saveEditName(id: string) {
    const title = editingNameValue.trim();
    setEditingNameId(null);
    if (!title) return;
    await patchActivity(id, { title });
  }

  function openExceptionForm(activity: RecurringActivity) {
    setExceptionActivityId(activity.id);
    setExDate(todayBucharest());
    setExTime(activity.timeLabel);
    setExSkipped(false);
    setError(null);
  }

  async function saveException() {
    if (!exceptionActivityId || !exDate) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/recurring-activities/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId: exceptionActivityId,
          date: exDate,
          timeLabel: exSkipped ? undefined : exTime,
          skipped: exSkipped,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.override) {
        setError(typeof json.error === "string" ? json.error : ra.errorException);
        return;
      }
      const ov = json.override as RecurringActivityOverride;
      setOverrides((prev) => {
        const rest = prev.filter((o) => !(o.activityId === ov.activityId && o.date === ov.date));
        return [...rest, ov].sort((a, b) => a.date.localeCompare(b.date));
      });
      setExceptionActivityId(null);
    } finally {
      setSaving(false);
    }
  }

  async function removeOverride(id: string) {
    if (!confirm(ra.deleteExceptionConfirm)) return;
    const res = await fetch(`/api/recurring-activities/overrides?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) return;
    setOverrides((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <section id="recurring-activities" className="app-native-surface rounded-[2rem] p-4 scroll-mt-20 sm:p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">{ra.section}</p>
          <h2 className="text-base font-semibold text-stone-900">{ra.title}</h2>
        </div>
        <span className="text-[11px] text-stone-500">{ra.subtitle}</span>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <p className="text-xs text-stone-500">{ra.loading}</p>
      ) : sorted.length === 0 ? (
        <p className="text-xs text-stone-500">{ra.empty}</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((a) => {
            const actOverrides = overridesByActivity.get(a.id) ?? [];
            const showExForm = exceptionActivityId === a.id;
            return (
              <li
                key={a.id}
                className="rounded-[1rem] border border-white/70 bg-white/80 px-3 py-2.5 shadow-[0_4px_12px_rgba(28,25,23,0.04)] space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  {editingNameId === a.id ? (
                    <input
                      autoFocus
                      value={editingNameValue}
                      onChange={(e) => setEditingNameValue(e.target.value)}
                      onBlur={() => saveEditName(a.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          saveEditName(a.id);
                        }
                        if (e.key === "Escape") setEditingNameId(null);
                      }}
                      className="app-native-input flex-1 px-2 py-1 text-sm font-medium"
                    />
                  ) : (
                    <div className="flex items-center gap-1.5 min-w-0 group/name">
                      <CalendarClock className="w-4 h-4 shrink-0 text-[#b66347]" />
                      <span className="text-sm font-medium text-stone-800 truncate">{a.title}</span>
                      <button
                        type="button"
                        onClick={() => startEditName(a.id, a.title)}
                        className="opacity-0 group-hover/name:opacity-100 rounded p-0.5 text-stone-300 hover:text-stone-600 transition shrink-0"
                        title={ra.renameTitle}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeActivity(a.id)}
                    className="rounded p-1 text-stone-300 hover:text-red-500 transition shrink-0"
                    title={ra.delete}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <select
                    value={a.weekday}
                    onChange={(e) => patchActivity(a.id, { weekday: e.target.value as Weekday })}
                    className="app-native-input px-2 py-0.5 text-xs"
                  >
                    {WEEKDAYS.map((w) => (
                      <option key={w} value={w}>
                        {weekdayLabels[w]}
                      </option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={a.timeLabel}
                    onChange={(e) => {
                      if (/^\d{2}:\d{2}$/.test(e.target.value)) patchActivity(a.id, { timeLabel: e.target.value });
                    }}
                    className="app-native-input px-2 py-0.5 text-xs"
                  />
                  <select
                    value={String(a.reminderLeadMinutes ?? 0)}
                    onChange={(e) => patchActivity(a.id, { reminderLeadMinutes: Number(e.target.value) })}
                    className="app-native-input px-2 py-0.5 text-xs"
                    title={ra.reminderTitle}
                  >
                    <option value="0">{ra.atHour}</option>
                    <option value="15">-15 min</option>
                    <option value="30">-30 min</option>
                    <option value="60">-60 min</option>
                    <option value="120">-120 min</option>
                  </select>
                </div>

                <div className="border-t border-stone-100 pt-2 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">{ra.exceptionsTitle}</p>
                    {!showExForm ? (
                      <button
                        type="button"
                        onClick={() => openExceptionForm(a)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#b66347] hover:text-[#8a4b2d]"
                      >
                        <CalendarPlus className="w-3 h-3" /> {ra.addException}
                      </button>
                    ) : null}
                  </div>
                  {actOverrides.length === 0 && !showExForm ? (
                    <p className="text-[11px] text-stone-400">{ra.noExceptions}</p>
                  ) : (
                    <ul className="space-y-1">
                      {actOverrides.map((o) => (
                        <li
                          key={o.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#faf8f5] px-2 py-1.5 text-[11px]"
                        >
                          <span className="text-stone-700">
                            {localeShortDate(o.date, lang)}
                            {o.skipped ? (
                              <span className="ml-1.5 rounded-full bg-stone-200 px-1.5 py-0.5 text-stone-600">
                                {ra.exceptionCancelled}
                              </span>
                            ) : (
                              <>
                                <span className="ml-1.5 text-stone-500">{o.timeLabel}</span>
                                {o.replacesDate ? (
                                  <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-amber-800">
                                    {ra.exceptionMoved}
                                  </span>
                                ) : null}
                              </>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeOverride(o.id)}
                            className="text-stone-400 hover:text-red-500"
                            title={ra.deleteException}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {showExForm ? (
                    <div className="rounded-lg border border-[#ead9c8] bg-[#fffcf8] p-2.5 space-y-2">
                      <p className="text-[10px] font-semibold uppercase text-stone-500">{ra.exceptionFormTitle}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="block text-[11px] text-stone-500">
                          {ra.exceptionDate}
                          <input
                            type="date"
                            value={exDate}
                            min={overrideRange.from}
                            max={overrideRange.to}
                            onChange={(e) => setExDate(e.target.value)}
                            className="app-native-input mt-0.5 w-full px-2 py-1.5 text-xs"
                          />
                        </label>
                        {!exSkipped ? (
                          <label className="block text-[11px] text-stone-500">
                            {ra.exceptionTime}
                            <input
                              type="time"
                              value={exTime}
                              onChange={(e) => setExTime(e.target.value)}
                              className="app-native-input mt-0.5 w-full px-2 py-1.5 text-xs"
                            />
                          </label>
                        ) : null}
                      </div>
                      <label className="flex items-center gap-2 text-[11px] text-stone-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exSkipped}
                          onChange={(e) => setExSkipped(e.target.checked)}
                          className="rounded"
                        />
                        {ra.exceptionSkipped}
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveException}
                          disabled={saving || !exDate || (!exSkipped && !exTime)}
                          className="app-native-primary-button px-2.5 py-1 text-[11px] font-semibold disabled:opacity-50"
                        >
                          {ra.saveException}
                        </button>
                        <button
                          type="button"
                          onClick={() => setExceptionActivityId(null)}
                          className="px-2.5 py-1 text-[11px] text-stone-500"
                        >
                          {ra.cancel}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <section>
        {!showAddForm ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#b66347] hover:text-[#8a4b2d]"
            >
              <Plus className="w-3.5 h-3.5" /> {ra.addTitle}
            </button>
            <span className="text-stone-300 text-xs">·</span>
            <span className="text-xs text-stone-400">{ra.quickTemplates}</span>
            {quickTemplates.map((tpl) => {
              const exists = activities.some((x) => x.title.trim().toLowerCase() === tpl.title.trim().toLowerCase());
              return (
                <button
                  key={tpl.title}
                  type="button"
                  onClick={() => addTemplate(tpl)}
                  disabled={saving || exists}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                    exists
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600 opacity-60 cursor-default"
                      : "border-[#ead9c8] bg-white/80 text-stone-600 hover:bg-[#fff3e7]"
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  {tpl.title}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.2rem] border border-[#ead9c8] bg-[#fffcf8] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{ra.formTitle}</p>
              <button type="button" onClick={() => setShowAddForm(false)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={ra.namePlaceholder}
              className="app-native-input w-full px-3 py-2 text-sm"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <select
                value={newWeekday}
                onChange={(e) => setNewWeekday(e.target.value as Weekday)}
                className="app-native-input px-3 py-2 text-sm"
              >
                {WEEKDAYS.map((w) => (
                  <option key={w} value={w}>
                    {weekdayLabels[w]}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="app-native-input px-3 py-2 text-sm"
              />
            </div>
            <select
              value={String(newLeadMinutes)}
              onChange={(e) => setNewLeadMinutes(Number(e.target.value))}
              className="app-native-input w-full px-3 py-2 text-sm"
            >
              <option value="0">{ra.atHourOpt}</option>
              <option value="15">-15 min</option>
              <option value="30">-30 min</option>
              <option value="60">-60 min</option>
              <option value="120">-120 min</option>
            </select>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={addFromForm}
                disabled={saving || !newTitle.trim() || !newTime}
                className="app-native-primary-button inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" /> {ra.addBtn}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800"
              >
                {ra.cancel}
              </button>
            </div>
          </div>
        )}
      </section>

      <p className="text-[11px] text-stone-400">{ra.hint}</p>
    </section>
  );
}
