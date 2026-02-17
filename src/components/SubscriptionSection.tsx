"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";

type PlanType = "free" | "pro" | "family";

interface SubscriptionSectionProps {
  plan?: PlanType;
  stripeConfigured: boolean;
  currentPeriodEnd?: string | null;
  subscriptionStatus?: string | null;
}

export function SubscriptionSection({
  plan = "free",
  stripeConfigured,
  currentPeriodEnd,
  subscriptionStatus,
}: SubscriptionSectionProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(planKey: PlanType, interval: "month" | "year") {
    if (!stripeConfigured) return;
    setError(null);
    setLoading(`${planKey}-${interval}`);
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
  }

  async function handlePortal() {
    if (!stripeConfigured) return;
    setError(null);
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/create-portal-session", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Eroare la deschiderea portalului.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("Nu s-a primit link.");
    } finally {
      setLoading(null);
    }
  }

  const planLabel = plan === "pro" ? "Pro" : plan === "family" ? "Family+" : "Free";
  const hasPaidSubscription = plan === "pro" || plan === "family";

  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <CreditCard className="w-5 h-5 text-stone-500 dark:text-stone-400" />
        <h3 className="font-semibold text-stone-800 dark:text-stone-100">Abonament</h3>
      </div>
      <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
        Plan curent: <span className="font-medium text-stone-800 dark:text-stone-200">{planLabel}</span>
        {currentPeriodEnd && hasPaidSubscription && (
          <span className="block mt-1 text-stone-500 dark:text-stone-500">
            Perioadă curentă până la:{" "}
            {new Date(currentPeriodEnd).toLocaleDateString("ro-RO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        )}
        {subscriptionStatus && hasPaidSubscription && subscriptionStatus !== "active" && subscriptionStatus !== "trialing" && (
          <span className="block mt-1 text-amber-600 dark:text-amber-400 text-xs">
            Status: {subscriptionStatus}
          </span>
        )}
      </p>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-3" role="alert">
          {error}
        </p>
      )}
      {stripeConfigured && (
        <div className="space-y-2">
          {hasPaidSubscription ? (
            <button
              type="button"
              onClick={handlePortal}
              disabled={!!loading}
              className="w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 py-2.5 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50"
            >
              {loading === "portal" ? "Se deschide…" : "Gestionează abonamentul"}
            </button>
          ) : (
            <>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">Upgrade:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleCheckout("pro", "month")}
                  disabled={!!loading}
                  className="rounded-lg bg-amber-500 text-white py-2 text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
                >
                  {loading === "pro-month" ? "…" : "Pro 39 lei/lună"}
                </button>
                <button
                  type="button"
                  onClick={() => handleCheckout("pro", "year")}
                  disabled={!!loading}
                  className="rounded-lg border border-amber-500 text-amber-700 dark:text-amber-300 py-2 text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-950/30 disabled:opacity-50"
                >
                  {loading === "pro-year" ? "…" : "Pro 299 lei/an"}
                </button>
                <button
                  type="button"
                  onClick={() => handleCheckout("family", "month")}
                  disabled={!!loading}
                  className="rounded-lg border border-stone-300 dark:border-stone-600 py-2 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-50"
                >
                  {loading === "family-month" ? "…" : "Family+ 59 lei/lună"}
                </button>
                <button
                  type="button"
                  onClick={() => handleCheckout("family", "year")}
                  disabled={!!loading}
                  className="rounded-lg border border-stone-300 dark:border-stone-600 py-2 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-50"
                >
                  {loading === "family-year" ? "…" : "Family+ 449 lei/an"}
                </button>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
                Pro: 14 zile gratuit, fără card. Plăți securizate prin Stripe.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
