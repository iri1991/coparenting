"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  DECISION_CATEGORY_ORDER,
  DECISION_CATEGORY_LABELS,
  type DecisionCategory,
  type JointDecision,
} from "@/types/joint-decision";

interface AddJointDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Decizie existentă pentru editare (doar cât e pending). */
  editDecision?: JointDecision | null;
}

export function AddJointDecisionModal({ isOpen, onClose, onSaved, editDecision }: AddJointDecisionModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DecisionCategory>("education");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(editDecision?.title ?? "");
    setCategory(editDecision?.category ?? "education");
    setDescription(editDecision?.description ?? "");
    setError(null);
  }, [isOpen, editDecision]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Titlul deciziei este obligatoriu.");
      return;
    }
    setSaving(true);
    try {
      const payload = { title: title.trim(), category, description: description.trim() || undefined };
      const res = editDecision
        ? await fetch("/api/joint-decisions", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editDecision.id, ...payload }),
          })
        : await fetch("/api/joint-decisions", {
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

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="app-native-surface-strong w-full max-w-md rounded-[2rem] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#ead9c8]">
          <h2 className="text-base font-semibold text-stone-800">
            {editDecision ? "Editează propunerea" : "Propune o decizie"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/70 text-stone-500" aria-label="Închide">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-sm text-stone-500">
            Propunerea așteaptă aprobarea celuilalt părinte. Rămâne documentată: cine, ce și când.
          </p>

          <div>
            <label className={labelCls}>Decizia</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex. Înscriere la înot de la toamnă"
              className={inputCls}
              autoFocus
            />
          </div>

          <div>
            <label className={labelCls}>Categorie</label>
            <div className="flex flex-wrap gap-2">
              {DECISION_CATEGORY_ORDER.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    category === c
                      ? "border-[#bf6a4b] bg-[#fff1df] text-[#9f5a40] font-medium"
                      : "border-[#e7d6c4] bg-white text-stone-600 hover:bg-[#fff8f1]"
                  }`}
                >
                  {DECISION_CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Detalii (opțional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="context, costuri, termene, orice ajută decizia"
              className={`${inputCls} resize-none`}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[#e7d6c4] text-stone-700 font-medium hover:bg-white/60"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-white font-medium disabled:opacity-50"
            >
              {saving ? "Se salvează…" : editDecision ? "Salvează" : "Trimite propunerea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
