"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";

export function BlogBackToAppButton() {
  const { data: session, status } = useSession();

  if (status === "loading" || !session?.user?.id) return null;

  return (
    <div className="fixed bottom-6 right-5 z-50 sm:bottom-8 sm:right-8">
      <Link
        href="/app"
        className="flex items-center gap-2 rounded-full bg-[#1f5a4e] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(31,90,78,0.35)] transition-all duration-200 hover:bg-[#1f3a36] hover:shadow-[0_12px_32px_rgba(31,90,78,0.45)] active:scale-[0.97]"
        aria-label="Înapoi în aplicație"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        <span>Înapoi în aplicație</span>
      </Link>
    </div>
  );
}
