"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ModalPortal } from "@/components/ModalPortal";
import {
  GUIDE_CATEGORY_ORDER,
  GUIDE_CATEGORY_LABELS,
  GUIDE_CATEGORY_EMOJI,
  type GuideCategory,
  type GuideEntry,
} from "@/types/parenting-guide";

interface AddGuideEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Categoria preselectată la deschidere. */
  initialCategory?: GuideCategory;
  /** Regulă existentă pentru editare. */
  editEntry?: GuideEntry | null;
}

export function AddGuideEntryModal({
  isOpen,
  onClose,
  onSaved,
  initialCategory = "sleep",
  editEntry,
}: AddGuideEntryModalProps) {
  const [category, setCategory] = useState<GuideCategory>(initialCategory);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setCategory(editEntry?.category ?? initialCategory);
    setTitle(editEntry?.title ?? "");
    setDetail(editEntry?.detail ?? "");
    setError(null);
  }, [isOpen, editEntry, initialCategory]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Textul regulii este obligatoriu.");
      return;
    }
    setSaving(true);
    try {
      const payload = { category, title: title.trim(), detail: detail.trim() || undefined };
      const res = editEntry
        ? await fetch("/api/parenting-guide", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editEntry.id, ...payload }),
          })
        : await fetch("/api/parenting-guide", {
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
    <ModalPortal>
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="app-native-surface-strong w-full max-w-md rounded-[2rem] shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#ead9c8]">
          <h2 className="text-base font-semibold text-stone-800">
            {editEntry ? "Editează regula" : "Adaugă o regulă comună"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/70 text-stone-500" aria-label="Închide">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-sm text-stone-500">
            O înțelegere pe care o aplicați la fel în ambele case. Oricare părinte o poate edita ulterior.
          </p>

          <div>
            <label className={labelCls}>Categorie</label>
            <div className="flex flex-wrap gap-2">
              {GUIDE_CATEGORY_ORDER.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
                    category === c
                      ? "border-[#bf6a4b] bg-[#fff1df] text-[#9f5a40] font-medium"
                      : "border-[#e7d6c4] bg-white text-stone-600 hover:bg-[#fff8f1]"
                  }`}
                >
                  <span className="text-base leading-none">{GUIDE_CATEGORY_EMOJI[c]}</span>
                  {GUIDE_CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Regula</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex. Somn la 21:00 în timpul săptămânii"
              className={inputCls}
              autoFocus
            />
          </div>

          <div>
            <label className={labelCls}>Detaliu / excepții (opțional)</label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={2}
              placeholder="ex. în weekend până la 22:00; excepție la zile speciale"
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
              {saving ? "Se salvează…" : editEntry ? "Salvează" : "Adaugă"}
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
}
