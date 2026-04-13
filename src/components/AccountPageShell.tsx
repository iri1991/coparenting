"use client";

import { useState, useEffect } from "react";
import { AppLogo } from "@/components/AppLogo";
import { AccountClient } from "@/components/AccountClient";
import { ConfigClient } from "@/components/ConfigClient";
import { User, Settings, History } from "lucide-react";
import { ActivityHistory } from "@/components/ActivityHistory";
import { MobileQuickNav } from "@/components/MobileQuickNav";
import { MobileAppTopBar } from "@/components/MobileAppTopBar";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tabList = (
    <nav
      className="flex border-b border-[#ead9c8] bg-transparent"
      role="tablist"
      aria-label="Secțiuni cont"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "cont"}
        onClick={() => setActiveTab("cont")}
        className={`flex min-h-[3rem] flex-1 items-center justify-center gap-2 px-2 py-2 text-sm font-semibold transition-colors ${
          activeTab === "cont"
            ? "border-b-2 border-[#bf6a4b] text-stone-900"
            : "border-b-2 border-transparent text-stone-500 hover:text-stone-800"
        }`}
      >
        <User className="h-4 w-4 shrink-0" aria-hidden />
        {t.app.account.tabs.account}
      </button>
      {configData && (
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "config"}
          onClick={() => setActiveTab("config")}
          className={`flex min-h-[3rem] flex-1 items-center justify-center gap-2 px-2 py-2 text-sm font-semibold transition-colors ${
            activeTab === "config"
              ? "border-b-2 border-[#bf6a4b] text-stone-900"
              : "border-b-2 border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Settings className="h-4 w-4 shrink-0" aria-hidden />
          {t.app.account.tabs.config}
        </button>
      )}
      {configData && (
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "istoric"}
          onClick={() => setActiveTab("istoric")}
          className={`flex min-h-[3rem] flex-1 items-center justify-center gap-2 px-2 py-2 text-sm font-semibold transition-colors ${
            activeTab === "istoric"
              ? "border-b-2 border-[#bf6a4b] text-stone-900"
              : "border-b-2 border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <History className="h-4 w-4 shrink-0" aria-hidden />
          {t.app.account.tabs.history}
        </button>
      )}
    </nav>
  );

  return (
    <LanguageProvider>
    <div className="app-native-shell min-h-screen">
      <MobileAppTopBar />

      <div className="sm:hidden pt-[calc(5.5rem+env(safe-area-inset-top))]">
        <div className="mx-auto max-w-md px-4 pb-3">{tabList}</div>
      </div>

      <header
        className={`safe-area-inset-top hidden sm:block sticky top-0 z-40 px-4 pt-4 transition-[transform,opacity] duration-200 ${
          scrolled
            ? "opacity-100"
            : "opacity-100"
        }`}
      >
        <div className="app-native-glass mx-auto max-w-3xl rounded-[30px] px-4 py-3">
          <div className="mb-3 flex items-center gap-3">
            <AppLogo size={32} linkToHome className="h-8 w-8" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                {t.lang === "en" ? "Family settings" : "Setări familie"}
              </p>
              <h1 className="truncate text-lg font-semibold text-stone-900">
                {t.lang === "en" ? "Account & data" : "Cont și date"}
              </h1>
              <p className="text-xs text-stone-500">
                {activeTab === "cont"
                  ? (t.lang === "en" ? "Profile, password, export" : "Profil, parolă, export")
                  : activeTab === "config"
                    ? (t.lang === "en" ? "Family settings" : "Configurare familie")
                    : (t.lang === "en" ? "Action history" : "Istoric acțiuni")}
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
              <p className="mb-4 text-sm text-stone-500">
                Nume părinți, copii, locuințe, invitații. Modificările sunt notificate pe email tuturor membrilor. Abonamentul și
                notificările push sunt în tab-ul „Altele”.
              </p>
              <ConfigClient
                initialFamily={configData.initialFamily}
                initialChildren={configData.initialChildren}
                initialResidences={configData.initialResidences}
                memberCount={configData.memberCount}
                embedInAccount
                currentUserId={currentUserId}
                plan={configData.plan}
                stripeConfigured={configData.stripeConfigured ?? false}
                subscriptionStatus={configData.subscriptionStatus}
                currentPeriodEnd={configData.currentPeriodEnd}
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
    </LanguageProvider>
  );
}
