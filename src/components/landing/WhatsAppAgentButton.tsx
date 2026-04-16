"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type Agent = { name: string; phone: string };

function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

function parseAgentsFromEnv(): Agent[] | null {
  const json = process.env.NEXT_PUBLIC_WHATSAPP_AGENTS;
  if (json) {
    try {
      const parsed = JSON.parse(json) as unknown;
      if (!Array.isArray(parsed) || parsed.length === 0) return null;
      const out: Agent[] = [];
      for (const item of parsed) {
        if (typeof item !== "object" || item === null) continue;
        const phone = normalizePhone(String((item as { phone?: string }).phone ?? ""));
        if (!phone) continue;
        const name = String((item as { name?: string }).name ?? "").trim();
        out.push({ name, phone });
      }
      return out.length ? out : null;
    } catch {
      return null;
    }
  }

  const single = process.env.NEXT_PUBLIC_WHATSAPP_PHONE;
  if (!single) return null;
  const phone = normalizePhone(single);
  if (!phone) return null;
  const name = (process.env.NEXT_PUBLIC_WHATSAPP_NAME ?? "").trim();
  return [{ name, phone }];
}

export function WhatsAppAgentButton() {
  const { t } = useLanguage();
  const pool = useMemo(() => parseAgentsFromEnv(), []);
  const [agent, setAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (!pool?.length) return;
    setAgent(pool[Math.floor(Math.random() * pool.length)]);
  }, [pool]);

  const href = useMemo(() => {
    if (!agent) return "#";
    const phone = normalizePhone(agent.phone);
    const text = encodeURIComponent(t.common.whatsappDefaultMessage);
    return `https://wa.me/${phone}?text=${text}`;
  }, [agent, t.common.whatsappDefaultMessage]);

  const ariaLabel = useMemo(() => {
    if (!agent) return t.common.whatsappLabel;
    return agent.name
      ? `${t.common.whatsappLabel} – ${agent.name}`
      : t.common.whatsappLabel;
  }, [agent, t.common.whatsappLabel]);

  const showName =
    process.env.NEXT_PUBLIC_WHATSAPP_SHOW_NAME === "1" ||
    process.env.NEXT_PUBLIC_WHATSAPP_SHOW_NAME === "true";

  if (!pool?.length || !agent) return null;

  return (
    <div
      className="pointer-events-auto fixed bottom-6 right-6 z-[100] inline-block leading-normal"
      style={{ margin: 0, padding: 0 }}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className="inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-[13px] font-light text-stone-900 no-underline opacity-100 transition-opacity hover:opacity-[0.72] focus:opacity-[0.72] active:opacity-50"
      >
        <span className="inline-flex shrink-0 items-center justify-center leading-none">
          <Image
            className="h-12 w-12 shrink-0 rounded-full object-contain"
            src="/whatsapp-icon.png"
            width={48}
            height={48}
            alt=""
            loading="lazy"
            decoding="async"
          />
        </span>
        {showName && agent.name ? (
          <span className="whitespace-nowrap text-[12px] font-light tracking-wide text-stone-500 before:content-['·_']">
            {agent.name}
          </span>
        ) : null}
      </a>
    </div>
  );
}
