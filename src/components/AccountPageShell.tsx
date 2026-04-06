"use client";

import { useState, useEffect } from "react";
import { AppLogo } from "@/components/AppLogo";
import { AccountClient } from "@/components/AccountClient";
import { ConfigClient } from "@/components/ConfigClient";
import { User, Settings, History } from "lucide-react";
import { ActivityHistory } from "@/components/ActivityHistory";
import { SubscriptionSection } from "@/components/SubscriptionSection";
import { MobileQuickNav } from "@/components/MobileQuickNav";
import { MobileAppTopBar } from "@/components/MobileAppTopBar";

type ParentType = "tata" | "mama" | null;

export interface ConfigData {
  initialFamily: { id: string; parent1Name: string; parent2Name: string; name: string; activityCity?: string };
  initialChildren: { id: string; name: string; allergies?: string; travelDocuments?: { id: string; name: string }[]; notes?: string; birthDate?: string }[];
  initialResidences: { id: string; name: string }[];
  memberCount: number;
  plan?: "free" | "pro" | "family";
  stripeConfigured?: boolean;
  subscriptionStatus?: string | null;
  currentPeriodEnd?: string | null;
}

interface AccountPageShellProps {
  initialEmail: string;
  initialName: string;
  initialParentType: ParentType;
  configData: ConfigData | null;
  currentUserId?: string;
}

export function AccountPageShell({
  initialEmail,
  initialName,
  initialParentType,
  configData,
  currentUserId,
}: AccountPageShellProps) {
  const [activeTab, setActiveTab] = useState<"cont" | "config" | "istoric">("cont");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tabList = (
    <div
      className="app-native-surface flex rounded-[1.4rem] p-1.5"
      role="tablist"
      aria-label="Secțiuni cont"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "cont"}
        onClick={() => setActiveTab("cont")}
        className={`flex-1 flex items-center justify-center gap-2 rounded-[1rem] px-4 py-2.5 text-sm font-semibold transition-all ${
          activeTab === "cont"
            ? "bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-white shadow-[0_12px_24px_rgba(191,106,75,0.2)]"
            : "text-stone-600 hover:bg-white/72 hover:text-stone-800"
        }`}
      >
        <User className="w-4 h-4 shrink-0" />
        Cont
      </button>
      {configData && (
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "config"}
          onClick={() => setActiveTab("config")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-[1rem] px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "config"
              ? "bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-white shadow-[0_12px_24px_rgba(191,106,75,0.2)]"
              : "text-stone-600 hover:bg-white/72 hover:text-stone-800"
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          Configurare
        </button>
      )}
      {configData && (
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "istoric"}
          onClick={() => setActiveTab("istoric")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-[1rem] px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "istoric"
              ? "bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-white shadow-[0_12px_24px_rgba(191,106,75,0.2)]"
              : "text-stone-600 hover:bg-white/72 hover:text-stone-800"
          }`}
        >
          <History className="w-4 h-4 shrink-0" />
          Istoric
        </button>
      )}
    </div>
  );

  return (
    <div className="app-native-shell min-h-screen">
      <MobileAppTopBar />

      <div className="sm:hidden pt-[calc(5.5rem+env(safe-area-inset-top))]">
        <div className="max-w-md mx-auto px-4 pb-3">{tabList}</div>
      </div>

      <header
        className={`safe-area-inset-top hidden sm:block sticky top-0 z-40 px-4 pt-4 transition-[transform,opacity] duration-200 ${
          scrolled
            ? "opacity-100"
            : "opacity-100"
        }`}
      >
        <div className="app-native-glass max-w-3xl mx-auto rounded-[30px] px-4 py-3">
          <div className="mb-3 flex items-center gap-3">
            <AppLogo size={32} linkToHome className="h-8 w-8" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                Setări familie
              </p>
              <h1 className="truncate text-lg font-semibold text-stone-900">
                Cont și date
              </h1>
              <p className="text-xs text-stone-500">
                {activeTab === "cont"
                  ? "Profil, parolă, export"
                  : activeTab === "config"
                    ? "Configurare familie"
                    : "Istoric acțiuni"}
              </p>
            </div>
          </div>
          {tabList}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 pb-24 sm:pb-8">
        <main>
          {activeTab === "cont" && (
            <AccountClient
              initialEmail={initialEmail}
              initialName={initialName}
              initialParentType={initialParentType}
            />
          )}
          {activeTab === "config" && configData && (
            <div className="animate-in fade-in duration-200">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#fff2e3] px-3 py-1.5 text-xs font-semibold text-[#b85c3e]">
                  Plan: {configData.plan === "pro" ? "Pro" : configData.plan === "family" ? "Family+" : "Free"}
                </span>
                <p className="text-sm text-stone-500">
                  Nume părinți, copii, locuințe, invitații. Modificările sunt notificate pe email tuturor membrilor.
                </p>
              </div>
              <SubscriptionSection
                plan={configData.plan}
                stripeConfigured={configData.stripeConfigured ?? false}
                currentPeriodEnd={configData.currentPeriodEnd}
                subscriptionStatus={configData.subscriptionStatus}
              />
              <ConfigClient
                initialFamily={configData.initialFamily}
                initialChildren={configData.initialChildren}
                initialResidences={configData.initialResidences}
                memberCount={configData.memberCount}
                embedInAccount
                currentUserId={currentUserId}
                plan={configData.plan}
              />
            </div>
          )}
          {activeTab === "istoric" && (
            <div className="animate-in fade-in duration-200">
              <p className="mb-6 text-sm text-stone-500">
                Ultimele acțiuni ale tale și ale celuilalt părinte în aplicație.
              </p>
              <ActivityHistory />
            </div>
          )}
        </main>
      </div>
      <MobileQuickNav />
    </div>
  );
}
