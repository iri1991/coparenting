"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppLogo } from "@/components/AppLogo";
import { AccountClient } from "@/components/AccountClient";
import { ConfigClient } from "@/components/ConfigClient";
import { User, Settings, History } from "lucide-react";
import { ActivityHistory } from "@/components/ActivityHistory";

type ParentType = "tata" | "mama" | null;

export interface ConfigData {
  initialFamily: { id: string; parent1Name: string; parent2Name: string; name: string };
  initialChildren: { id: string; name: string; allergies?: string; travelDocuments?: { id: string; name: string }[]; notes?: string }[];
  initialResidences: { id: string; name: string }[];
  memberCount: number;
  plan?: "free" | "pro" | "family";
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 dark:from-stone-950 dark:to-stone-900">
      <header
        className={`sticky top-0 z-40 border-b safe-area-inset-top transition-[background-color,box-shadow] duration-200 ${
          scrolled
            ? "bg-white dark:bg-stone-900 shadow-sm border-stone-200 dark:border-stone-800"
            : "bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm border-stone-200 dark:border-stone-800"
        }`}
      >
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <AppLogo size={32} linkToHome className="h-8 w-8" />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-stone-800 dark:text-stone-100 truncate">
                Cont și date
              </h1>
              <p className="text-stone-500 dark:text-stone-400 text-xs">
                {activeTab === "cont"
                  ? "Profil, parolă, export"
                  : activeTab === "config"
                    ? "Configurare familie"
                    : "Istoric acțiuni"}
              </p>
            </div>
          </div>

          <div
            className="flex rounded-xl bg-stone-200/70 dark:bg-stone-800/70 p-1"
            role="tablist"
            aria-label="Secțiuni cont"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "cont"}
              onClick={() => setActiveTab("cont")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === "cont"
                  ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
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
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "config"
                    ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
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
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "istoric"
                    ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                }`}
              >
                <History className="w-4 h-4 shrink-0" />
                Istoric
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 pb-8">
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
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                  Plan: {configData.plan === "pro" ? "Pro" : configData.plan === "family" ? "Family+" : "Free"}
                </span>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  Nume părinți, copii, locuințe, invitații. Modificările sunt notificate pe email tuturor membrilor.
                </p>
              </div>
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
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
                Ultimele acțiuni ale tale și ale celuilalt părinte în aplicație.
              </p>
              <ActivityHistory />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
