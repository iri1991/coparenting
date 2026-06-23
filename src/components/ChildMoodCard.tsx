"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Smile, Trash2, X } from "lucide-react";
import {
  MOOD_LEVEL_ORDER,
  MOOD_LEVEL_EMOJI,
  MOOD_LEVEL_LABELS,
  type MoodLevel,
  type ChildMoodEntry,
} from "@/types/child-mood";
import { useFamilyLabels } from "@/contexts/FamilyLabelsContext";

interface ChildMoodCardProps {
  parentType: "tata" | "mama" | null;
  currentUserId?: string;
  childId?: string;
  childName?: string;
}

export function ChildMoodCard({ parentType, currentUserId, childId, childName }: ChildMoodCardProps) {
  const labels = useFamilyLabels();
  const [entries, setEntries] = useState<ChildMoodEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [pendingMood, setPendingMood] = useState<MoodLevel | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const url = childId ? `/api/child-moods?childId=${encodeURIComponent(childId)}` : "/api/child-moods";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEntries(Array.isArray(data.entries) ? data.entries : []);
      }
    } finally {
      setLoaded(true);
    }
  }, [childId]);

  useEffect(() => {
    if (!parentType) {
      setLoaded(true);
      return;
    }
    fetchEntries();
  }, [parentType, fetchEntries]);

  const save = useCallback(async () => {
    if (!pendingMood) return;
    setSaving(true);
    try {
      const res = await fetch("/api/child-moods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: pendingMood, note: note.trim() || undefined, childId }),
      });
      if (res.ok) {
        setPendingMood(null);
        setNote("");
        await fetchEntries();
      }
    } finally {
      setSaving(false);
    }
  }, [pendingMood, note, childId, fetchEntries]);

  const handleDelete = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/child-moods?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) await fetchEntries();
    },
    [fetchEntries]
  );

  if (!parentType || !loaded) return null;

  const name = childName?.trim() || "copilul";
  // Tendință: ultimele 10 înregistrări, cronologic (vechi → nou).
  const trend = [...entries].slice(0, 10).reverse();

  return (
    <section className="app-native-surface rounded-[2rem] p-4 sm:p-5">
      <h2 className="text-base font-semibold text-stone-800 flex items-center gap-2 mb-1">
        <Smile className="w-4.5 h-4.5 text-[#b86a4b]" aria-hidden />
        Cum se simte {name}
      </h2>
      <p className="text-xs text-stone-500 mb-3">
        Un spațiu pentru emoțiile copilului, mai ales după tranziții. Vizibil ambilor părinți.
      </p>

      {/* Quick add */}
      <div className="rounded-[1.4rem] border border-[#efcfb6] bg-[#fff8f1] p-3">
        <p className="text-xs font-medium text-stone-600 mb-2">Notează starea de azi</p>
        <div className="flex flex-wrap gap-2">
          {MOOD_LEVEL_ORDER.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPendingMood(pendingMood === m ? null : m)}
              title={MOOD_LEVEL_LABELS[m]}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-xl transition ${
                pendingMood === m
                  ? "border-[#bf6a4b] bg-white scale-105 shadow-sm"
                  : "border-[#e7d6c4] bg-white/70 hover:bg-white"
              }`}
            >
              {MOOD_LEVEL_EMOJI[m]}
            </button>
          ))}
        </div>
        {pendingMood && (
          <div className="mt-3 space-y-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  save();
                }
              }}
              placeholder={`Ce a spus ${name}? (opțional)`}
              className="w-full px-3 py-2 rounded-xl border border-[#e7d6c4] bg-white text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#d9b89d]/60"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-600">
                {MOOD_LEVEL_EMOJI[pendingMood]} {MOOD_LEVEL_LABELS[pendingMood]}
              </span>
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => {
                  setPendingMood(null);
                  setNote("");
                }}
                className="p-2 rounded-lg text-stone-400 hover:bg-white"
                aria-label="Anulează"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-xl bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? "…" : "Salvează"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Trend row */}
      {trend.length > 1 && (
        <div className="mt-3 flex items-center gap-1 overflow-x-auto py-1">
          {trend.map((e) => (
            <span key={e.id} title={`${format(new Date(e.date + "T12:00:00"), "d MMM", { locale: ro })} · ${MOOD_LEVEL_LABELS[e.mood]}`} className="text-lg shrink-0">
              {MOOD_LEVEL_EMOJI[e.mood]}
            </span>
          ))}
        </div>
      )}

      {/* Timeline */}
      {entries.length > 0 && (
        <ul className="mt-3 space-y-2">
          {entries.slice(0, 8).map((e) => {
            const isMine = e.loggedByUserId === currentUserId;
            return (
              <li key={e.id} className="group flex items-start gap-3 rounded-[1.2rem] border border-[#ecdcc9] bg-white/70 px-3 py-2.5">
                <span className="text-xl leading-none mt-0.5">{MOOD_LEVEL_EMOJI[e.mood]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-stone-800">
                    <span className="font-medium">{MOOD_LEVEL_LABELS[e.mood]}</span>
                    {e.note ? <span className="text-stone-600"> — {e.note}</span> : null}
                  </p>
                  <p className="text-[11px] text-stone-400">
                    {format(new Date(e.date + "T12:00:00"), "EEEE, d MMM", { locale: ro })} · notat de{" "}
                    {labels.parentLabels[e.loggedByParentType]}
                  </p>
                </div>
                {isMine && (
                  <button
                    type="button"
                    onClick={() => handleDelete(e.id)}
                    className="shrink-0 p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-white opacity-80 group-hover:opacity-100"
                    aria-label="Șterge"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
