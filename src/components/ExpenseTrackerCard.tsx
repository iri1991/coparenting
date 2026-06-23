"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Wallet, Plus, Pencil, Trash2, Check, RotateCcw } from "lucide-react";
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_EMOJI,
  formatBani,
  owedBani,
  type SharedExpense,
} from "@/types/expense";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { useFamilyLabels } from "@/contexts/FamilyLabelsContext";

interface ExpenseTrackerCardProps {
  parentType: "tata" | "mama" | null;
}

export function ExpenseTrackerCard({ parentType }: ExpenseTrackerCardProps) {
  const labels = useFamilyLabels();
  const [expenses, setExpenses] = useState<SharedExpense[]>([]);
  const [tataNetBani, setTataNetBani] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SharedExpense | null>(null);
  const [showSettled, setShowSettled] = useState(false);

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await fetch("/api/expenses");
      if (res.ok) {
        const data = await res.json();
        setExpenses(Array.isArray(data.expenses) ? data.expenses : []);
        setTataNetBani(Number(data.balance?.tataNetBani) || 0);
      }
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!parentType) {
      setLoaded(true);
      return;
    }
    fetchExpenses();
  }, [parentType, fetchExpenses]);

  const toggleSettled = useCallback(
    async (e: SharedExpense) => {
      const res = await fetch("/api/expenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: e.id, settled: !e.settled }),
      });
      if (res.ok) await fetchExpenses();
    },
    [fetchExpenses]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Ștergi această cheltuială?")) return;
      const res = await fetch(`/api/expenses?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) await fetchExpenses();
    },
    [fetchExpenses]
  );

  const settleAll = useCallback(async () => {
    if (!confirm("Marchezi toate cheltuielile ca decontate?")) return;
    const res = await fetch("/api/expenses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "settle-all" }),
    });
    if (res.ok) await fetchExpenses();
  }, [fetchExpenses]);

  if (!parentType || !loaded) return null;

  const unsettled = expenses.filter((e) => !e.settled);
  const settled = expenses.filter((e) => e.settled);
  const visible = showSettled ? expenses : unsettled;

  // Eticheta soldului (perspectivă neutră, folosind numele părinților).
  let balanceLabel: string;
  let balanceTone: "owe" | "even";
  if (tataNetBani === 0) {
    balanceLabel = "Totul e la zi";
    balanceTone = "even";
  } else if (tataNetBani > 0) {
    balanceLabel = `${labels.parentLabels.mama} îi datorează lui ${labels.parentLabels.tata} ${formatBani(tataNetBani)}`;
    balanceTone = "owe";
  } else {
    balanceLabel = `${labels.parentLabels.tata} îi datorează lui ${labels.parentLabels.mama} ${formatBani(-tataNetBani)}`;
    balanceTone = "owe";
  }

  return (
    <section className="app-native-surface rounded-[2rem] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-base font-semibold text-stone-800 flex items-center gap-2">
          <Wallet className="w-4.5 h-4.5 text-[#b86a4b]" aria-hidden />
          Cheltuieli comune
        </h2>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-full bg-[#fff1df] px-3 py-1.5 text-xs font-semibold text-[#9f5a40] hover:bg-[#ffe7cd]"
        >
          <Plus className="w-3.5 h-3.5" />
          Adaugă
        </button>
      </div>

      {/* Sold */}
      <div
        className={`rounded-[1.4rem] border p-3.5 mb-3 ${
          balanceTone === "owe" ? "border-[#efcfb6] bg-[#fff8f1]" : "border-[#cfe3dc] bg-[#edf6f3]"
        }`}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Sold curent</p>
        <p className={`mt-0.5 text-sm font-semibold ${balanceTone === "owe" ? "text-[#9f5a40]" : "text-[#1f5a4e]"}`}>
          {balanceLabel}
        </p>
        {unsettled.length > 0 && (
          <button
            type="button"
            onClick={settleAll}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-stone-600 hover:bg-white"
          >
            <Check className="w-3.5 h-3.5" /> Marchează tot decontat
          </button>
        )}
      </div>

      {expenses.length === 0 ? (
        <p className="text-sm text-stone-500">
          Nicio cheltuială încă. Adaugă ce ai cumpărat pentru copil ca să fie clar cine a plătit și cât se
          datorează.
        </p>
      ) : (
        <>
          <ul className="space-y-2">
            {visible.map((e) => {
              const owed = owedBani(e.amountBani, e.splitPercent);
              return (
                <li
                  key={e.id}
                  className={`group flex items-start gap-3 rounded-[1.2rem] border px-3 py-2.5 ${
                    e.settled ? "border-[#ecdcc9] bg-white/50 opacity-70" : "border-[#ecdcc9] bg-white/70"
                  }`}
                >
                  <span className="text-lg leading-none mt-0.5">{EXPENSE_CATEGORY_EMOJI[e.category]}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium text-stone-800 ${e.settled ? "line-through" : ""}`}>
                        {e.title}
                      </p>
                      <span className="text-sm font-semibold text-stone-700">{formatBani(e.amountBani)}</span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      {EXPENSE_CATEGORY_LABELS[e.category]} · plătit de {labels.parentLabels[e.paidByParentType]} ·{" "}
                      {format(new Date(e.date + "T12:00:00"), "d MMM", { locale: ro })}
                    </p>
                    {!e.settled && (
                      <p className="text-[11px] text-stone-500">
                        {labels.parentLabels[e.paidByParentType === "tata" ? "mama" : "tata"]} datorează{" "}
                        {formatBani(owed)}
                        {e.splitPercent !== 50 ? ` (${e.splitPercent}%)` : ""}
                      </p>
                    )}
                    {e.note && <p className="text-[11px] text-stone-400 italic">{e.note}</p>}
                  </div>
                  <div className="shrink-0 flex gap-0.5 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => toggleSettled(e)}
                      className={`p-1.5 rounded-lg hover:bg-white ${e.settled ? "text-stone-400" : "text-[#1f5a4e]"}`}
                      aria-label={e.settled ? "Marchează nedecontat" : "Marchează decontat"}
                      title={e.settled ? "Marchează nedecontat" : "Marchează decontat"}
                    >
                      {e.settled ? <RotateCcw className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(e);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-white"
                      aria-label="Editează"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(e.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-white"
                      aria-label="Șterge"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {settled.length > 0 && (
            <button
              type="button"
              onClick={() => setShowSettled((s) => !s)}
              className="mt-3 text-xs font-medium text-stone-500 hover:text-stone-700"
            >
              {showSettled ? "Ascunde decontate" : `Arată decontate (${settled.length})`}
            </button>
          )}
        </>
      )}

      <AddExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchExpenses}
        myParentType={parentType}
        editExpense={editing}
      />
    </section>
  );
}
