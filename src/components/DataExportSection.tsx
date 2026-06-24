"use client";

import Link from "next/link";
import { Download, FileJson, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/** Secțiunea de export (calendar .ics + date .json). Trăiește în tabul „Date”,
 *  lângă istoricul de acțiuni — toate intrările/ieșirile de date la un loc. */
export function DataExportSection() {
  const { t } = useLanguage();
  const a = t.app.account;

  return (
    <section className="app-native-surface rounded-[2rem] p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[1.4rem] bg-[#f7f0e7] text-[#8a6330]">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">{a.export.title}</p>
          <h2 className="mt-1 text-lg font-semibold text-stone-900">{a.export.desc}</h2>
          <p className="mt-1 text-sm leading-6 text-stone-500">{a.export.hint}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/api/calendar/ics"
          target="_blank"
          rel="noopener noreferrer"
          className="app-native-secondary-button inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-stone-700"
        >
          <Calendar className="h-4 w-4" />
          {a.export.ics}
        </Link>
        <Link
          href="/api/user/export-json"
          target="_blank"
          rel="noopener noreferrer"
          className="app-native-secondary-button inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-stone-700"
        >
          <FileJson className="h-4 w-4" />
          {a.export.json}
        </Link>
      </div>
    </section>
  );
}
