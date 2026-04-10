"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface Props {
  medicationName: string;
  dosage: string;
  open: boolean;
  onClose: () => void;
  onConfirm: (timeLabel: string) => Promise<void> | void;
}

function nowHHmm(): string {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Bucharest",
  });
}

export function OnDemandAdministerDialog({
  medicationName,
  dosage,
  open,
  onClose,
  onConfirm,
}: Props) {
  const [mode, setMode] = useState<"now" | "earlier">("now");
  const [time, setTime] = useState<string>(nowHHmm());
  const [saving, setSaving] = useState(false);

  // Reset state every time the dialog opens
  useEffect(() => {
    if (open) {
      setMode("now");
      setTime(nowHHmm());
      setSaving(false);
    }
  }, [open]);

  if (!open) return null;

  async function confirm() {
    const finalTime = mode === "now" ? nowHHmm() : time;
    setSaving(true);
    try {
      await onConfirm(finalTime);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[1.4rem] bg-white shadow-xl p-4 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
              Administrează
            </p>
            <p className="text-sm font-semibold text-stone-800 truncate">
              {medicationName}{" "}
              <span className="font-normal text-stone-500">· {dosage}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-[0.7rem] bg-stone-100 p-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => setMode("now")}
            className={`flex-1 rounded-[0.5rem] py-2 text-xs font-semibold transition ${
              mode === "now"
                ? "bg-white text-stone-800 shadow-sm"
                : "text-stone-500"
            }`}
          >
            Acum
          </button>
          <button
            type="button"
            onClick={() => setMode("earlier")}
            className={`flex-1 rounded-[0.5rem] py-2 text-xs font-semibold transition ${
              mode === "earlier"
                ? "bg-white text-stone-800 shadow-sm"
                : "text-stone-500"
            }`}
          >
            Mai devreme
          </button>
        </div>

        {mode === "earlier" ? (
          <div className="space-y-1">
            <label className="block text-[11px] text-stone-500">
              Ora administrării
            </label>
            <input
              type="time"
              value={time}
              max={nowHHmm()}
              onChange={(e) => setTime(e.target.value)}
              className="app-native-input w-full px-3 py-2 text-sm"
            />
          </div>
        ) : (
          <p className="text-xs text-stone-500">
            Se va înregistra ora curentă: <b>{nowHHmm()}</b>
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={confirm}
            disabled={saving || (mode === "earlier" && !time)}
            className="app-native-primary-button flex-1 px-3 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {saving ? "Se salvează…" : "Confirmă"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-sm text-stone-500 hover:text-stone-800"
          >
            Anulează
          </button>
        </div>
      </div>
    </div>
  );
}
