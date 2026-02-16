"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Lock, Plus, Trash2, X } from "lucide-react";
import type { BlockedPeriod } from "@/types/blocked";
import type { ParentType } from "@/types/events";
import { AddBlockedPeriodModal } from "@/components/AddBlockedPeriodModal";
import { useFamilyLabels } from "@/contexts/FamilyLabelsContext";

type ParentRole = "tata" | "mama";

interface BlockedDaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  parentType: ParentRole | null;
  onBlockedChanged?: () => void;
}

export function BlockedDaysModal({
  isOpen,
  onClose,
  currentUserId,
  parentType,
  onBlockedChanged,
}: BlockedDaysModalProps) {
  const labels = useFamilyLabels();
  const tabs: { key: ParentRole; label: string }[] = [
    { key: "tata", label: `Zile blocate ${labels.parentLabels.tata}` },
    { key: "mama", label: `Zile blocate ${labels.parentLabels.mama}` },
  ];
  const [activeTab, setActiveTab] = useState<ParentRole>("tata");
  const [allPeriods, setAllPeriods] = useState<BlockedPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blocked-days");
      if (res.ok) {
        const data = await res.json();
        setAllPeriods(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchAll();
  }, [isOpen, fetchAll]);

  const byParent = (key: ParentRole) =>
    allPeriods.filter((b) => b.parentType === key);

  const canManage = (key: ParentRole) =>
    parentType === key && currentUserId;

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Ștergi această perioadă blocată?")) return;
      const res = await fetch(`/api/blocked-days?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchAll();
        onBlockedChanged?.();
      }
    },
    [fetchAll, onBlockedChanged]
  );

  const handleSaved = useCallback(() => {
    fetchAll();
    onBlockedChanged?.();
    setAddModalOpen(false);
  }, [fetchAll, onBlockedChanged]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 w-full max-w-md max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-700">
            <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-stone-500" aria-hidden />
              Zile blocate
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
              aria-label="Închide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex border-b border-stone-200 dark:border-stone-700">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex-1 py-3 px-4 text-sm font-medium touch-manipulation ${
                  activeTab === key
                    ? "text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400 bg-amber-50/50 dark:bg-amber-950/20"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {loading ? (
              <p className="text-sm text-stone-400">Se încarcă…</p>
            ) : (
              <TabContent
                periods={byParent(activeTab)}
                canManage={!!canManage(activeTab)}
                onAdd={() => setAddModalOpen(true)}
                onDelete={handleDelete}
                currentUserId={currentUserId}
              />
            )}
          </div>
        </div>
      </div>

      <AddBlockedPeriodModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSaved={handleSaved}
      />
    </>
  );
}

interface TabContentProps {
  periods: BlockedPeriod[];
  canManage: boolean;
  onAdd: () => void;
  onDelete: (id: string) => void;
  currentUserId?: string;
}

function TabContent({
  periods,
  canManage,
  onAdd,
  onDelete,
  currentUserId,
}: TabContentProps) {
  if (periods.length === 0 && !canManage) {
    return (
      <p className="text-sm text-stone-500 dark:text-stone-400">
        Nu sunt perioade blocate.
      </p>
    );
  }
  if (periods.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Nu ai perioade blocate. Adaugă când ești plecat ca să nu se programeze
          zile cu copilul în acele zile.
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 active:scale-[0.98] touch-manipulation"
        >
          <Plus className="w-4 h-4" />
          Adaugă perioadă
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {canManage && (
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-[0.98] touch-manipulation w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          Adaugă perioadă
        </button>
      )}
      <ul className="space-y-2">
        {periods.map((b) => {
          const isOwn = currentUserId && b.userId === currentUserId;
          return (
            <li
              key={b.id}
              className="flex items-center justify-between gap-2 py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700"
            >
              <div>
                <span className="text-sm font-medium text-stone-800 dark:text-stone-200">
                  {format(new Date(b.startDate + "T12:00:00"), "d MMM", {
                    locale: ro,
                  })}
                  {" – "}
                  {format(new Date(b.endDate + "T12:00:00"), "d MMM yyyy", {
                    locale: ro,
                  })}
                </span>
                {b.note?.trim() && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    {b.note}
                  </p>
                )}
              </div>
              {isOwn && (
                <button
                  type="button"
                  onClick={() => onDelete(b.id)}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-stone-400 hover:text-red-600 dark:hover:text-red-400 touch-manipulation"
                  aria-label="Șterge perioada"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
