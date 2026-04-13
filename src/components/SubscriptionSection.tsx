"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t, lang } = useLanguage();
  const s = t.app.subscription;
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(planKey: PlanType, interval: "month" | "year") {
    if (!stripeConfigured) return;
    setError(null);
    setLoading(`${planKey}-${interval}`);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: planKey, interval }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || s.errorCheckout); return; }
      if (data.url) { window.location.href = data.url; return; }
      setError(s.errorNoLink);
    } finally { setLoading(null); }
  }

  async function handlePortal() {
    if (!stripeConfigured) return;
    setError(null);
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/create-portal-session", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || s.errorPortal); return; }
      if (data.url) { window.location.href = data.url; return; }
      setError(s.errorNoPortalLink);
    } finally { setLoading(null); }
  }

  const planLabel = plan === "pro" ? "Pro" : plan === "family" ? "Family+" : "Free";
  const hasPaidSubscription = plan === "pro" || plan === "family";
  const dateLocale = lang === "en" ? "en-GB" : "ro-RO";

  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-4">
      <div className="flex items-center gap-2 mb-3">
        <CreditCard className="w-5 h-5 text-stone-500 dark:text-stone-400" />
        <h3 className="font-semibold text-stone-800 dark:text-stone-100">{s.title}</h3>
      </div>
      <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
        {s.currentPlan} <span className="font-medium text-stone-800 dark:text-stone-200">{planLabel}</span>
        {currentPeriodEnd && hasPaidSubscription && (
          <span className="block mt-1 text-stone-500">
            {s.currentUntil}{" "}
            {new Date(currentPeriodEnd).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" })}
          </span>
        )}
        {subscriptionStatus && hasPaidSubscription && subscriptionStatus !== "active" && subscriptionStatus !== "trialing" && (
          <span className="block mt-1 text-amber-600 text-xs">{s.status} {subscriptionStatus}</span>
        )}
      </p>
      {error && <p className="text-sm text-red-600 mb-3" role="alert">{error}</p>}
      {stripeConfigured && (
        <div className="space-y-2">
          {hasPaidSubscription ? (
            <button type="button" onClick={handlePortal} disabled={!!loading}
              className="w-full rounded-lg border border-stone-300 bg-white text-stone-700 py-2.5 text-sm font-medium hover:bg-stone-50 disabled:opacity-50">
              {loading === "portal" ? s.managing : s.manageBtn}
            </button>
          ) : (
            <>
              <p className="text-xs text-stone-500 mb-2">{s.upgradeLabel}</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => handleCheckout("pro", "month")} disabled={!!loading}
                  className="rounded-lg bg-amber-500 text-white py-2 text-sm font-medium hover:bg-amber-600 disabled:opacity-50">
                  {loading === "pro-month" ? "…" : s.proMonthly}
                </button>
                <button type="button" onClick={() => handleCheckout("pro", "year")} disabled={!!loading}
                  className="rounded-lg border border-amber-500 text-amber-700 py-2 text-sm font-medium hover:bg-amber-50 disabled:opacity-50">
                  {loading === "pro-year" ? "…" : s.proYearly}
                </button>
                <button type="button" onClick={() => handleCheckout("family", "month")} disabled={!!loading}
                  className="rounded-lg border border-stone-300 py-2 text-sm font-medium hover:bg-stone-50 disabled:opacity-50">
                  {loading === "family-month" ? "…" : s.familyMonthly}
                </button>
                <button type="button" onClick={() => handleCheckout("family", "year")} disabled={!!loading}
                  className="rounded-lg border border-stone-300 py-2 text-sm font-medium hover:bg-stone-50 disabled:opacity-50">
                  {loading === "family-year" ? "…" : s.familyYearly}
                </button>
              </div>
              <p className="text-xs text-stone-500 mt-2">{s.trialNote}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
