"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X } from "lucide-react";
import { ModalPortal } from "@/components/ModalPortal";
import {
  SPECIAL_DAY_EMOJIS,
  type SpecialDay,
  type SpecialDayAssignment,
  type SpecialDayRecurrence,
} from "@/types/special-day";
import { useFamilyLabels } from "@/contexts/FamilyLabelsContext";

interface AddSpecialDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editDay?: SpecialDay | null;
}

export function AddSpecialDayModal({ isOpen, onClose, onSaved, editDay }: AddSpecialDayModalProps) {
  const labels = useFamilyLabels();
  const currentYear = new Date().getFullYear();
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState(SPECIAL_DAY_EMOJIS[0]);
  const [recurrence, setRecurrence] = useState<SpecialDayRecurrence>("annual");
  // Un singur câmp dată: pentru „annual” folosim doar luna+ziua.
  const [dateField, setDateField] = useState(format(new Date(), "yyyy-MM-dd"));
  const [assignment, setAssignment] = useState<SpecialDayAssignment>("alternate");
  const [anchorParent, setAnchorParent] = useState<"tata" | "mama">("tata");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(editDay?.title ?? "");
    setEmoji(editDay?.emoji ?? SPECIAL_DAY_EMOJIS[0]);
    setRecurrence(editDay?.recurrence ?? "annual");
    if (editDay) {
      if (editDay.recurrence === "oneoff" && editDay.date) setDateField(editDay.date);
      else if (editDay.month && editDay.day) {
        setDateField(`${currentYear}-${String(editDay.month).padStart(2, "0")}-${String(editDay.day).padStart(2, "0")}`);
      }
    } else {
      setDateField(format(new Date(), "yyyy-MM-dd"));
    }
    setAssignment(editDay?.assignment ?? "alternate");
    setAnchorParent(editDay?.alternateAnchorParent ?? "tata");
    setNote(editDay?.note ?? "");
    setError(null);
  }, [isOpen, editDay, currentYear]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Titlul zilei speciale este obligatoriu.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateField)) {
      setError("Alege o dată validă.");
      return;
    }
    setSaving(true);
    try {
      const [, mm, dd] = dateField.split("-");
      const payload: Record<string, unknown> = {
        title: title.trim(),
        emoji,
        recurrence,
        assignment,
        note: note.trim() || undefined,
      };
      if (recurrence === "oneoff") {
        payload.date = dateField;
      } else {
        payload.month = Number(mm);
        payload.day = Number(dd);
      }
      if (assignment === "alternate") {
        payload.alternateAnchorYear = currentYear;
        payload.alternateAnchorParent = anchorParent;
      }
      const res = editDay
        ? await fetch("/api/special-days", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editDay.id, ...payload }),
          })
        : await fetch("/api/special-days", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Eroare la salvare.");
        return;
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full px-3 py-2 rounded-xl border border-[#e7d6c4] bg-white text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#d9b89d]/60";
  const labelCls = "block text-xs font-semibold text-stone-600 mb-1.5";
  const chip = (active: boolean) =>
    `rounded-xl border px-3 py-2 text-sm font-medium transition ${
      active ? "border-[#bf6a4b] bg-[#fff1df] text-[#9f5a40]" : "border-[#e7d6c4] bg-white text-stone-600 hover:bg-[#fff8f1]"
    }`;

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="app-native-surface-strong w-full max-w-md max-h-[88vh] rounded-[2rem] shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#ead9c8]">
          <h2 className="text-base font-semibold text-stone-800">
            {editDay ? "Editează ziua specială" : "Adaugă o zi specială"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/70 text-stone-500" aria-label="Închide">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          <div className="flex gap-2">
            <div className="shrink-0">
              <label className={labelCls}>Simbol</label>
              <select
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className={`${inputCls} text-lg w-16 text-center`}
                aria-label="Simbol"
              >
                {SPECIAL_DAY_EMOJIS.map((em) => (
                  <option key={em} value={em}>
                    {em}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className={labelCls}>Titlu</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex. Crăciun, Ziua copilului"
                className={inputCls}
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Recurență</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setRecurrence("annual")} className={`flex-1 ${chip(recurrence === "annual")}`}>
                În fiecare an
              </button>
              <button type="button" onClick={() => setRecurrence("oneoff")} className={`flex-1 ${chip(recurrence === "oneoff")}`}>
                O singură dată
              </button>
            </div>
          </div>

          <div>
            <label className={labelCls}>{recurrence === "annual" ? "Ziua din an (anul nu contează)" : "Data"}</label>
            <input type="date" value={dateField} onChange={(e) => setDateField(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Cine are copilul</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setAssignment("alternate")} className={chip(assignment === "alternate")}>
                Alternează pe ani
              </button>
              <button type="button" onClick={() => setAssignment("together")} className={chip(assignment === "together")}>
                Amândoi
              </button>
              <button type="button" onClick={() => setAssignment("tata")} className={chip(assignment === "tata")}>
                Mereu {labels.parentLabels.tata}
              </button>
              <button type="button" onClick={() => setAssignment("mama")} className={chip(assignment === "mama")}>
                Mereu {labels.parentLabels.mama}
              </button>
            </div>
          </div>

          {assignment === "alternate" && (
            <div>
              <label className={labelCls}>Anul acesta ({currentYear}) o are:</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setAnchorParent("tata")} className={`flex-1 ${chip(anchorParent === "tata")}`}>
                  {labels.parentLabels.tata}
                </button>
                <button type="button" onClick={() => setAnchorParent("mama")} className={`flex-1 ${chip(anchorParent === "mama")}`}>
                  {labels.parentLabels.mama}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-stone-400">Apoi se schimbă automat în fiecare an.</p>
            </div>
          )}

          <div>
            <label className={labelCls}>Notă (opțional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ex. predare la ora 12:00"
              className={inputCls}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>

        <div className="flex gap-2 px-4 py-3 border-t border-[#ead9c8]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#e7d6c4] text-stone-700 font-medium hover:bg-white/60"
          >
            Anulează
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-white font-medium disabled:opacity-50"
          >
            {saving ? "Se salvează…" : editDay ? "Salvează" : "Adaugă"}
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
