"use client";

import { Sparkles } from "lucide-react";
import { useUpgradeModal } from "@/contexts/UpgradeModalContext";

type Variant = "inline" | "button" | "banner";

interface UpgradeCtaProps {
  /** Stil de afișare */
  variant?: Variant;
  /** Text scurt pe buton/link. Implicit: "Upgrade la Pro" */
  children?: React.ReactNode;
  className?: string;
}

const defaultLabel = "Upgrade la Pro";

export function UpgradeCta({ variant = "button", children = defaultLabel, className = "" }: UpgradeCtaProps) {
  const { openUpgradeModal } = useUpgradeModal();
  const base = "inline-flex items-center justify-center gap-1.5 font-medium text-amber-700 dark:text-amber-200 hover:text-amber-800 dark:hover:text-amber-100 transition-colors";

  const commonProps = {
    type: "button" as const,
    onClick: openUpgradeModal,
  };

  if (variant === "inline") {
    return (
      <button {...commonProps} className={`text-sm ${base} ${className}`}>
        <Sparkles className="w-4 h-4 shrink-0" aria-hidden />
        {children}
      </button>
    );
  }

  if (variant === "banner") {
    return (
      <button
        {...commonProps}
        className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium hover:from-amber-600 hover:to-amber-700 shadow-sm ${className}`}
      >
        <Sparkles className="w-5 h-5 shrink-0" aria-hidden />
        {children}
      </button>
    );
  }

  return (
    <button
      {...commonProps}
      className={`py-2 px-4 rounded-xl bg-amber-500 text-white text-sm hover:bg-amber-600 active:scale-[0.98] touch-manipulation ${base} ${className}`}
    >
      <Sparkles className="w-4 h-4 shrink-0" aria-hidden />
      {children}
    </button>
  );
}
