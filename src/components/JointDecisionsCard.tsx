"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Handshake, Plus, Check, MessageCircle, Pencil, Trash2, ChevronDown } from "lucide-react";
import {
  DECISION_CATEGORY_LABELS,
  type JointDecision,
} from "@/types/joint-decision";
import { AddJointDecisionModal } from "@/components/AddJointDecisionModal";
import { useFamilyLabels } from "@/contexts/FamilyLabelsContext";

interface JointDecisionsCardProps {
  parentType: "tata" | "mama" | null;
  currentUserId?: string;
}

export function JointDecisionsCard({ parentType, currentUserId }: JointDecisionsCardProps) {
  const labels = useFamilyLabels();
  const [decisions, setDecisions] = useState<JointDecision[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JointDecision | null>(null);
  const [declineId, setDeclineId] = useState<string | null>(null);
  const [declineNote, setDeclineNote] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);

  const fetchDecisions = useCallback(async () => {
    try {
      const res = await fetch("/api/joint-decisions");
      if (res.ok) {
        const data = await res.json();
        setDecisions(Array.isArray(data.decisions) ? data.decisions : []);
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
    fetchDecisions();
  }, [parentType, fetchDecisions]);

  const respond = useCallback(
    async (id: string, action: "approve" | "decline", responseNote?: string) => {
      setBusyId(id);
      try {
        const res = await fetch("/api/joint-decisions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, action, responseNote }),
        });
        if (res.ok) {
          setDeclineId(null);
          setDeclineNote("");
          await fetchDecisions();
        }
      } finally {
        setBusyId(null);
      }
    },
    [fetchDecisions]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Ștergi această propunere?")) return;
      const res = await fetch(`/api/joint-decisions?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) await fetchDecisions();
    },
    [fetchDecisions]
  );

  if (!parentType || !loaded) return null;

  const pending = decisions.filter((d) => d.status === "pending");
  const resolved = decisions.filter((d) => d.status !== "pending");

  return (
    <section className="app-native-surface rounded-[2rem] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-base font-semibold text-stone-800 flex items-center gap-2">
          <Handshake className="w-4.5 h-4.5 text-[#b86a4b]" aria-hidden />
          Decizii comune
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
          Propune
        </button>
      </div>

      {decisions.length === 0 ? (
        <p className="text-sm text-stone-500">
          Documentați împreună deciziile importante (școală, medical, activități). Fiecare propunere așteaptă
          aprobarea celuilalt părinte și rămâne în istoric.
        </p>
      ) : (
        <>
          {pending.length > 0 && (
            <ul className="space-y-2.5">
              {pending.map((d) => {
                const isMine = d.proposedByUserId === currentUserId;
                const proposerLabel = labels.parentLabels[d.proposedByParentType];
                return (
                  <li key={d.id} className="rounded-[1.4rem] border border-[#efcfb6] bg-[#fff8f1] p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="rounded-full bg-[#f6e7d3] px-2 py-0.5 text-[10px] font-semibold text-[#9f5a40]">
                            {DECISION_CATEGORY_LABELS[d.category]}
                          </span>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                            în așteptare
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm font-semibold text-stone-800">{d.title}</p>
                        {d.description && <p className="mt-0.5 text-xs text-stone-600">{d.description}</p>}
                        <p className="mt-1 text-[11px] text-stone-400">
                          propus de {proposerLabel} · {format(new Date(d.createdAt), "d MMM", { locale: ro })}
                          {isMine ? " · așteaptă celălalt părinte" : ""}
                        </p>
                      </div>
                      {isMine && (
                        <div className="shrink-0 flex gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(d);
                              setModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-white/70"
                            aria-label="Editează"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(d.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-white/70"
                            aria-label="Șterge"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {!isMine && declineId !== d.id && (
                      <div className="mt-2.5 flex gap-2">
                        <button
                          type="button"
                          disabled={busyId === d.id}
                          onClick={() => respond(d.id, "approve")}
                          className="flex items-center gap-1.5 rounded-xl bg-[#e1f5ee] px-3 py-2 text-sm font-medium text-[#0f6e56] hover:bg-[#cdeee1] disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" /> Aprob
                        </button>
                        <button
                          type="button"
                          disabled={busyId === d.id}
                          onClick={() => {
                            setDeclineId(d.id);
                            setDeclineNote("");
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-white border border-[#e7d6c4] px-3 py-2 text-sm font-medium text-stone-600 hover:bg-[#fff8f1] disabled:opacity-50"
                        >
                          <MessageCircle className="w-4 h-4" /> Discutăm
                        </button>
                      </div>
                    )}

                    {!isMine && declineId === d.id && (
                      <div className="mt-2.5 space-y-2">
                        <textarea
                          value={declineNote}
                          onChange={(e) => setDeclineNote(e.target.value)}
                          rows={2}
                          placeholder="De ce vrei să discutați? (opțional)"
                          className="w-full px-3 py-2 rounded-xl border border-[#e7d6c4] bg-white text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#d9b89d]/60 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={busyId === d.id}
                            onClick={() => respond(d.id, "decline", declineNote.trim() || undefined)}
                            className="rounded-xl bg-[#bf6a4b] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#a85a3e] disabled:opacity-50"
                          >
                            Trimite
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeclineId(null)}
                            className="rounded-xl border border-[#e7d6c4] px-3 py-1.5 text-sm font-medium text-stone-600"
                          >
                            Renunță
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {resolved.length > 0 && (
            <div className={pending.length > 0 ? "mt-3" : ""}>
              <button
                type="button"
                onClick={() => setShowResolved((s) => !s)}
                className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-700"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showResolved ? "rotate-180" : ""}`} />
                Istoric decizii ({resolved.length})
              </button>
              {showResolved && (
                <ul className="mt-2 space-y-2">
                  {resolved.map((d) => (
                    <li key={d.id} className="rounded-[1.2rem] border border-[#ecdcc9] bg-white/60 px-3 py-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-500">
                          {DECISION_CATEGORY_LABELS[d.category]}
                        </span>
                        {d.status === "approved" ? (
                          <span className="rounded-full bg-[#e1f5ee] px-2 py-0.5 text-[10px] font-semibold text-[#0f6e56]">
                            aprobat
                          </span>
                        ) : (
                          <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                            de discutat
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium text-stone-700">{d.title}</p>
                      {d.responseNote && (
                        <p className="mt-0.5 text-xs text-stone-500 italic">„{d.responseNote}”</p>
                      )}
                      <p className="mt-0.5 text-[11px] text-stone-400">
                        {labels.parentLabels[d.proposedByParentType]} ·{" "}
                        {d.decidedAt ? format(new Date(d.decidedAt), "d MMM yyyy", { locale: ro }) : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      <AddJointDecisionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchDecisions}
        editDecision={editing}
      />
    </section>
  );
}
