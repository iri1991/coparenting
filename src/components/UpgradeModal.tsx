"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Sparkles } from "lucide-react";

type PlanType = "free" | "pro" | "family";

const OPTIONS: { plan: PlanType; interval: "month" | "year"; label: string; highlight?: boolean }[] = [
  { plan: "pro", interval: "month", label: "Pro 39 lei/lună", highlight: true },
  { plan: "pro", interval: "year", label: "Pro 299 lei/an" },
  { plan: "family", interval: "month", label: "Family+ 59 lei/lună" },
  { plan: "family", interval: "year", label: "Family+ 449 lei/an" },
];

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    fetch("/api/stripe/configured")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setStripeConfigured(!!d.configured);
      })
      .catch(() => {
        if (!cancelled) setStripeConfigured(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleCheckout = useCallback(async (planKey: PlanType, interval: "month" | "year") => {
    if (!stripeConfigured) return;
    setError(null);
    const key = `${planKey}-${interval}`;
    setLoading(key);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, interval }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Eroare la crearea sesiunii de plată.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("Nu s-a primit link de plată.");
    } finally {
      setLoading(null);
    }
  }, [stripeConfigured]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-700">
          <h2 id="upgrade-modal-title" className="text-lg font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" aria-hidden />
            Alege planul
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
        <div className="p-4">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-3" role="alert">
              {error}
            </p>
          )}
          {stripeConfigured ? (
            <>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {OPTIONS.map(({ plan, interval, label, highlight }) => (
                  <button
                    key={`${plan}-${interval}`}
                    type="button"
                    onClick={() => handleCheckout(plan, interval)}
                    disabled={!!loading}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium transition disabled:opacity-50 touch-manipulation ${
                      highlight
                        ? "bg-amber-500 text-white hover:bg-amber-600"
                        : "border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800"
                    }`}
                  >
                    {loading === `${plan}-${interval}` ? "…" : label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Pro: 14 zile gratuit, fără card. Plăți securizate prin Stripe.
              </p>
            </>
          ) : (
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Plățile nu sunt configurate momentan. Poți gestiona abonamentul din Cont → Configurare.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
