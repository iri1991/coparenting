"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X } from "lucide-react";
import { ModalPortal } from "@/components/ModalPortal";
import {
  EXPENSE_CATEGORY_ORDER,
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_EMOJI,
  type ExpenseCategory,
  type SharedExpense,
} from "@/types/expense";
import { useFamilyLabels } from "@/contexts/FamilyLabelsContext";

type PayerRole = "tata" | "mama";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Rolul utilizatorului curent (plătitorul implicit). */
  myParentType: PayerRole;
  editExpense?: SharedExpense | null;
}

export function AddExpenseModal({ isOpen, onClose, onSaved, myParentType, editExpense }: AddExpenseModalProps) {
  const labels = useFamilyLabels();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("school");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState<PayerRole>(myParentType);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [splitEqual, setSplitEqual] = useState(true);
  const [splitPercent, setSplitPercent] = useState("50");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(editExpense?.title ?? "");
    setCategory(editExpense?.category ?? "school");
    setAmount(editExpense ? String(editExpense.amountBani / 100) : "");
    setPaidBy((editExpense?.paidByParentType as PayerRole) ?? myParentType);
    setDate(editExpense?.date ?? format(new Date(), "yyyy-MM-dd"));
    const sp = editExpense?.splitPercent ?? 50;
    setSplitEqual(sp === 50);
    setSplitPercent(String(sp));
    setNote(editExpense?.note ?? "");
    setError(null);
  }, [isOpen, editExpense, myParentType]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Titlul cheltuielii este obligatoriu.");
      return;
    }
    const lei = Number(amount.replace(",", "."));
    if (!Number.isFinite(lei) || lei <= 0) {
      setError("Introdu o sumă validă.");
      return;
    }
    const sp = splitEqual ? 50 : Math.max(0, Math.min(100, Math.round(Number(splitPercent) || 0)));
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        amount: lei,
        paidByParentType: paidBy,
        date,
        splitPercent: sp,
        note: note.trim() || undefined,
      };
      const res = editExpense
        ? await fetch("/api/expenses", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editExpense.id, ...payload }),
          })
        : await fetch("/api/expenses", {
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
  const otherLabel = labels.parentLabels[paidBy === "tata" ? "mama" : "tata"];

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="app-native-surface-strong w-full max-w-md max-h-[88vh] rounded-[2rem] shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#ead9c8]">
          <h2 className="text-base font-semibold text-stone-800">
            {editExpense ? "Editează cheltuiala" : "Adaugă o cheltuială"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/70 text-stone-500" aria-label="Închide">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          <div>
            <label className={labelCls}>Ce ai cumpărat</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex. Rechizite școală"
              className={inputCls}
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelCls}>Sumă (lei)</label>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="ex. 320"
                className={inputCls}
              />
            </div>
            <div className="flex-1">
              <label className={labelCls}>Data</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Categorie</label>
            <div className="flex flex-wrap gap-2">
              {EXPENSE_CATEGORY_ORDER.map((c) => (
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
                  <span className="text-base leading-none">{EXPENSE_CATEGORY_EMOJI[c]}</span>
                  {EXPENSE_CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Plătit de</label>
            <div className="flex gap-2">
              {(["tata", "mama"] as PayerRole[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPaidBy(p)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    paidBy === p
                      ? "border-[#bf6a4b] bg-[#fff1df] text-[#9f5a40]"
                      : "border-[#e7d6c4] bg-white text-stone-600 hover:bg-[#fff8f1]"
                  }`}
                >
                  {labels.parentLabels[p]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Împărțire</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSplitEqual(true)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  splitEqual
                    ? "border-[#bf6a4b] bg-[#fff1df] text-[#9f5a40]"
                    : "border-[#e7d6c4] bg-white text-stone-600 hover:bg-[#fff8f1]"
                }`}
              >
                Egal (50/50)
              </button>
              <button
                type="button"
                onClick={() => setSplitEqual(false)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  !splitEqual
                    ? "border-[#bf6a4b] bg-[#fff1df] text-[#9f5a40]"
                    : "border-[#e7d6c4] bg-white text-stone-600 hover:bg-[#fff8f1]"
                }`}
              >
                Custom
              </button>
            </div>
            {!splitEqual && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={splitPercent}
                  onChange={(e) => setSplitPercent(e.target.value)}
                  className={`w-24 ${inputCls}`}
                />
                <span className="text-sm text-stone-600">% datorat de {otherLabel}</span>
              </div>
            )}
          </div>

          <div>
            <label className={labelCls}>Notă (opțional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="detalii, magazin, etc."
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
            {saving ? "Se salvează…" : editExpense ? "Salvează" : "Adaugă"}
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
