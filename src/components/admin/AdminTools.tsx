"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Send, Users } from "lucide-react";
import { Card, buttonClass, inputClass, primaryButtonClass } from "@/components/admin/ui";

const JOBS = [
  { id: "weekly-proposal", label: "Propuneri săptămânale", desc: "Generează propunerea pentru săptămâna viitoare și notifică părinții (rulează automat duminica)." },
  { id: "evening-reminder", label: "Reminder de seară", desc: "Trimite push-ul de seară despre programul de mâine." },
  { id: "inactivity-reminder", label: "Reminder inactivitate", desc: "Push + email utilizatorilor inactivi 5+ zile (cel mult o dată la 5 zile)." },
  { id: "invitation-reminder", label: "Reminder invitații", desc: "Email pentru invitațiile neacceptate (cel mult o dată la 3 zile)." },
] as const;

const SEGMENTS = [
  { id: "all", label: "Toți utilizatorii" },
  { id: "active30", label: "Activi în ultimele 30 zile" },
  { id: "inactive30", label: "Inactivi 30+ zile" },
  { id: "free", label: "Familii Free" },
  { id: "paid", label: "Familii plătitoare (Pro / Family+)" },
  { id: "noFamily", label: "Utilizatori fără familie" },
] as const;

async function post(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, data };
}

export function CronJobsPanel() {
  const router = useRouter();
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { ok: boolean; text: string }>>({});

  return (
    <Card title="Job-uri programate" subtitle="Rulează manual un job. Atenție: trimit notificări reale utilizatorilor.">
      <ul className="space-y-3">
        {JOBS.map((job) => (
          <li key={job.id} className="flex flex-wrap items-start justify-between gap-2 border-b border-stone-100 pb-3 last:border-0 last:pb-0 dark:border-stone-800">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{job.label}</p>
              <p className="text-xs text-stone-500">{job.desc}</p>
              {results[job.id] && (
                <pre className={`mt-1.5 overflow-x-auto rounded-lg bg-stone-50 p-2 text-[11px] dark:bg-stone-800 ${results[job.id].ok ? "" : "text-red-600"}`}>{results[job.id].text}</pre>
              )}
            </div>
            <button
              type="button"
              disabled={running !== null}
              className={buttonClass}
              onClick={async () => {
                if (!confirm(`Rulezi acum „${job.label}”?`)) return;
                setRunning(job.id);
                const { ok, data } = await post("/api/admin/cron", { job: job.id });
                setRunning(null);
                setResults((r) => ({ ...r, [job.id]: { ok, text: JSON.stringify(ok ? data.result : data.error, null, 2) } }));
                router.refresh();
              }}
            >
              <Play className="h-3.5 w-3.5" /> {running === job.id ? "Rulează…" : "Rulează"}
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function BroadcastPanel({ pushConfigured }: { pushConfigured: boolean }) {
  const router = useRouter();
  const [segment, setSegment] = useState<(typeof SEGMENTS)[number]["id"]>("active30");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/app");
  const [preview, setPreview] = useState<{ users: number; reachedUsers: number; devices: number } | null>(null);
  const [busy, setBusy] = useState<"preview" | "send" | null>(null);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  async function doPreview() {
    setBusy("preview");
    setMsg(null);
    const { ok, data } = await post("/api/admin/broadcast", { segment, dryRun: true });
    setBusy(null);
    if (!ok) return setMsg({ tone: "err", text: String(data.error ?? "Eroare.") });
    setPreview(data as unknown as { users: number; reachedUsers: number; devices: number });
  }

  async function send() {
    if (!preview) return;
    if (!confirm(`Trimiți „${title}” către ${preview.reachedUsers} utilizatori (${preview.devices} dispozitive)?`)) return;
    setBusy("send");
    setMsg(null);
    const { ok, data } = await post("/api/admin/broadcast", { segment, title, body, url });
    setBusy(null);
    if (!ok) return setMsg({ tone: "err", text: String(data.error ?? "Eroare.") });
    setMsg({ tone: "ok", text: `Trimisă către ${data.reachedUsers} utilizatori pe ${data.devices} dispozitive.` });
    setTitle("");
    setBody("");
    setPreview(null);
    router.refresh();
  }

  return (
    <Card title="Notificare în masă" subtitle="Push către un segment de utilizatori. Vezi mai întâi câți vor primi.">
      {!pushConfigured && <p className="mb-3 text-sm text-red-600">Push nu este configurat (VAPID lipsă) — poți doar estima segmentul.</p>}
      <div className="space-y-2">
        <select
          value={segment}
          onChange={(e) => {
            setSegment(e.target.value as typeof segment);
            setPreview(null);
          }}
          className={`${inputClass} w-full`}
        >
          {SEGMENTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="Titlu (max 80)" className={`${inputClass} w-full`} />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={200} rows={2} placeholder="Mesaj (max 200, opțional)" className={`${inputClass} w-full`} />
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/app" className={`${inputClass} w-full font-mono text-xs`} />
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={doPreview} disabled={busy !== null} className={buttonClass}>
            <Users className="h-3.5 w-3.5" /> {busy === "preview" ? "Se calculează…" : "Câți primesc?"}
          </button>
          <button type="button" onClick={send} disabled={busy !== null || !preview || !title.trim() || !pushConfigured || preview.devices === 0} className={primaryButtonClass}>
            <Send className="h-3.5 w-3.5" /> {busy === "send" ? "Se trimite…" : "Trimite"}
          </button>
          {preview && (
            <span className="text-xs text-stone-500">
              {preview.users} utilizatori în segment · {preview.reachedUsers} cu push · {preview.devices} dispozitive
            </span>
          )}
        </div>
        {msg && <p className={`text-sm ${msg.tone === "ok" ? "text-emerald-700 dark:text-emerald-400" : "text-red-600"}`}>{msg.text}</p>}
      </div>
    </Card>
  );
}
