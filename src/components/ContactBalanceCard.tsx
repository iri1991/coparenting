"use client";

import { useState, useEffect, useCallback } from "react";
import { HeartHandshake } from "lucide-react";
import type { ContactBalance } from "@/types/contact-balance";
import { useFamilyLabels } from "@/contexts/FamilyLabelsContext";

interface ContactBalanceCardProps {
  parentType: "tata" | "mama" | null;
}

export function ContactBalanceCard({ parentType }: ContactBalanceCardProps) {
  const labels = useFamilyLabels();
  const [data, setData] = useState<ContactBalance | null>(null);
  const [loaded, setLoaded] = useState(false);

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/contact-balance", { cache: "no-store" });
      if (res.ok) setData(await res.json());
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!parentType) {
      setLoaded(true);
      return;
    }
    fetchBalance();
  }, [parentType, fetchBalance]);

  if (!parentType || !loaded || !data || !data.anyAlert) return null;

  const alerted = data.parents.filter((p) => p.alert);

  return (
    <section className="rounded-[2rem] border border-[#f0d9a8] bg-[#fdf6e7] p-4 sm:p-5">
      <h2 className="text-base font-semibold text-[#8a6320] flex items-center gap-2 mb-2">
        <HeartHandshake className="w-4.5 h-4.5 text-[#a9762a]" aria-hidden />
        Atenție la echilibru
      </h2>
      <ul className="space-y-2.5">
        {alerted.map((p) => {
          const name = labels.parentLabels[p.parentType];
          return (
            <li key={p.parentType} className="text-sm text-[#7a5a1e]">
              <span className="font-medium">{name}</span> nu a avut zile cu copilul de{" "}
              <span className="font-semibold">{p.daysSinceLastContact} zile</span>
              {p.nextContactDate ? (
                <> și următoarea programare e abia peste {p.daysUntilNext} zile.</>
              ) : (
                <> și nu are nimic programat.</>
              )}
              <p className="mt-0.5 text-xs text-[#9a7a3e]">
                Sugestie: programați câteva zile cu {name} în perioada următoare — contactul regulat
                contează enorm pentru copil.
              </p>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[11px] text-[#9a7a3e]">
        Semnal discret, bazat pe program (prag {data.thresholdDays} zile). Nu apare cât există contact regulat.
      </p>
    </section>
  );
}
