"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { ArrowRightLeft, Moon, Utensils, BookOpen, Pill, Package, Pencil } from "lucide-react";
import { CHILD_MOOD_EMOJI, type ChildMood, type TransitionNote } from "@/types/transition-note";
import { TransitionNoteModal } from "@/components/TransitionNoteModal";
import { useFamilyLabels } from "@/contexts/FamilyLabelsContext";

const MOOD_LABELS: Record<ChildMood, string> = {
  happy: "vesel",
  calm: "calm",
  tired: "obosit",
  upset: "supărat",
  sick: "răcit / bolnav",
};

interface TransitionNoteCardProps {
  parentType: "tata" | "mama" | null;
  /** Data predării pentru care pot scrie o notă (= sfârșitul perioadei mele), sau null. */
  handoverDate: string | null;
}

export function TransitionNoteCard({ parentType, handoverDate }: TransitionNoteCardProps) {
  const labels = useFamilyLabels();
  const [received, setReceived] = useState<TransitionNote | null>(null);
  const [myNoteForHandover, setMyNoteForHandover] = useState<TransitionNote | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      const [inboxRes, mineRes] = await Promise.all([
        fetch("/api/transition-notes?inbox=1&limit=1"),
        handoverDate ? fetch("/api/transition-notes?mine=1&limit=20") : Promise.resolve(null),
      ]);
      if (inboxRes.ok) {
        const data = await inboxRes.json();
        setReceived((data.notes?.[0] as TransitionNote) ?? null);
      }
      if (mineRes && mineRes.ok) {
        const data = await mineRes.json();
        const forDate = (data.notes as TransitionNote[])?.find((n) => n.date === handoverDate) ?? null;
        setMyNoteForHandover(forDate);
      } else {
        setMyNoteForHandover(null);
      }
    } finally {
      setLoaded(true);
    }
  }, [handoverDate]);

  useEffect(() => {
    if (!parentType) {
      setLoaded(true);
      return;
    }
    fetchNotes();
  }, [parentType, fetchNotes]);

  if (!parentType || !loaded) return null;

  const toParentLabel = labels.parentLabels[parentType === "tata" ? "mama" : "tata"];
  const showCompose = !!handoverDate;
  const receivedIsToday = received && received.date === format(new Date(), "yyyy-MM-dd");

  // Nimic de arătat: nici notă primită, nici posibilitatea de a scrie una.
  if (!received && !showCompose) return null;

  return (
    <section className="app-native-surface overflow-hidden rounded-[2rem] px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-[#b86a4b]" aria-hidden />
          Note de predare
        </h2>
        {showCompose && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-[#fff1df] px-3 py-1.5 text-xs font-semibold text-[#9f5a40] hover:bg-[#ffe7cd]"
          >
            <Pencil className="w-3.5 h-3.5" />
            {myNoteForHandover ? "Editează nota mea" : "Pregătește predarea"}
          </button>
        )}
      </div>

      {received ? (
        <div className="mt-3 rounded-[1.4rem] border border-[#ecdcc9] bg-white/72 p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-xs text-stone-500">
              De la <span className="font-medium text-stone-700">{labels.parentLabels[received.fromParentType]}</span>
              {" · "}
              <span className="capitalize">{format(new Date(received.date + "T12:00:00"), "EEEE, d MMM", { locale: ro })}</span>
            </p>
            {receivedIsToday && (
              <span className="rounded-full bg-[#e1f5ee] px-2 py-0.5 text-[10px] font-semibold text-[#0f6e56]">azi</span>
            )}
          </div>

          {received.mood && (
            <p className="text-sm text-stone-800 mb-2">
              <span className="text-base">{CHILD_MOOD_EMOJI[received.mood]}</span>{" "}
              <span className="font-medium">{MOOD_LABELS[received.mood]}</span>
              {received.moodNote ? <span className="text-stone-600"> — {received.moodNote}</span> : null}
            </p>
          )}

          <div className="space-y-1.5 text-sm text-stone-700">
            {received.sleep && <Row icon={<Moon className="w-3.5 h-3.5" />} label="Somn" value={received.sleep} />}
            {received.food && <Row icon={<Utensils className="w-3.5 h-3.5" />} label="Mâncare" value={received.food} />}
            {received.activities && <Row icon={<BookOpen className="w-3.5 h-3.5" />} label="Teme" value={received.activities} />}
            {received.medication && <Row icon={<Pill className="w-3.5 h-3.5" />} label="Medicație" value={received.medication} />}
          </div>

          {received.items.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#ecdcc9]">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 mb-1.5">
                <Package className="w-3.5 h-3.5" /> Obiecte
              </p>
              <div className="flex flex-wrap gap-1.5">
                {received.items.map((it, i) => (
                  <span
                    key={i}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      it.traveling ? "bg-[#e1f5ee] text-[#0f6e56]" : "bg-stone-100 text-stone-500 line-through"
                    }`}
                  >
                    {it.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {received.generalNote && (
            <p className="mt-3 text-sm text-stone-600 italic border-l-2 border-[#e7d6c4] pl-3">{received.generalNote}</p>
          )}
        </div>
      ) : (
        showCompose && (
          <p className="mt-3 text-sm text-stone-500">
            Predai copilul {handoverDate ? `pe ${format(new Date(handoverDate + "T12:00:00"), "d MMM", { locale: ro })}` : ""}.
            Lasă o notă pentru {toParentLabel}: starea copilului, somn, mâncare, medicație și obiecte.
          </p>
        )
      )}

      {handoverDate && (
        <TransitionNoteModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={fetchNotes}
          date={handoverDate}
          toParentLabel={toParentLabel}
          editNote={myNoteForHandover}
        />
      )}
    </section>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <p className="flex items-start gap-2">
      <span className="mt-0.5 text-stone-400">{icon}</span>
      <span>
        <span className="font-medium text-stone-600">{label}:</span> {value}
      </span>
    </p>
  );
}
