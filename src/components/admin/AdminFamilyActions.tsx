"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Trash2, RotateCw, XCircle, UserMinus } from "lucide-react";
import { PLAN_NAMES } from "@/types/plan";
import type { PlanType } from "@/types/plan";
import { Badge, buttonClass, dangerButtonClass, fmtDate, fmtRelative, inputClass, primaryButtonClass } from "@/components/admin/ui";

async function jsonFetch(url: string, init: RequestInit): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...init });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, data };
}

function Feedback({ msg }: { msg: { tone: "ok" | "err"; text: string } | null }) {
  if (!msg) return null;
  return <p className={`text-xs ${msg.tone === "ok" ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{msg.text}</p>;
}

// ─── Plan & status ───────────────────────────────────────────────────────────

export function FamilyPlanControls({
  familyId,
  plan: initialPlan,
  active: initialActive,
  hasStripeSubscription,
}: {
  familyId: string;
  plan: PlanType;
  active: boolean;
  hasStripeSubscription: boolean;
}) {
  const router = useRouter();
  const [plan, setPlan] = useState(initialPlan);
  const [active, setActive] = useState(initialActive);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  async function update(patch: { plan?: PlanType; active?: boolean }) {
    setBusy(true);
    setMsg(null);
    const { ok, data } = await jsonFetch(`/api/admin/families/${familyId}`, { method: "PATCH", body: JSON.stringify(patch) });
    setBusy(false);
    if (!ok) {
      setMsg({ tone: "err", text: String(data.error ?? "Eroare.") });
      return;
    }
    if (patch.plan) setPlan(patch.plan);
    if (patch.active !== undefined) setActive(patch.active);
    setMsg({ tone: "ok", text: "Salvat." });
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-stone-600 dark:text-stone-400" htmlFor="plan-select">
          Plan
        </label>
        <select
          id="plan-select"
          value={plan}
          disabled={busy}
          onChange={(e) => {
            const next = e.target.value as PlanType;
            if (hasStripeSubscription && !confirm("Familia are abonament Stripe. Următorul webhook Stripe poate suprascrie planul setat manual. Continui?")) return;
            update({ plan: next });
          }}
          className={inputClass}
        >
          {(["free", "pro", "family"] as const).map((p) => (
            <option key={p} value={p}>
              {PLAN_NAMES[p]}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (active && !confirm("Dezactivezi familia? Membrii nu vor mai putea folosi aplicația până la reactivare.")) return;
            update({ active: !active });
          }}
          className={active ? dangerButtonClass : primaryButtonClass}
        >
          {active ? "Dezactivează familia" : "Reactivează familia"}
        </button>
      </div>
      <Feedback msg={msg} />
    </div>
  );
}

// ─── Membri ──────────────────────────────────────────────────────────────────

export function RemoveMemberButton({ familyId, userId, label }: { familyId: string; userId: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      className={buttonClass}
      onClick={async () => {
        if (!confirm(`Scoți ${label} din familie? Contul și datele familiei rămân.`)) return;
        setBusy(true);
        const { ok, data } = await jsonFetch(`/api/admin/families/${familyId}/members?userId=${encodeURIComponent(userId)}`, { method: "DELETE" });
        setBusy(false);
        if (!ok) alert(String(data.error ?? "Eroare."));
        router.refresh();
      }}
    >
      <UserMinus className="h-3.5 w-3.5" /> {busy ? "…" : "Scoate"}
    </button>
  );
}

// ─── Invitații ───────────────────────────────────────────────────────────────

export function InvitationActions({ invitationId, status }: { invitationId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [joinUrl, setJoinUrl] = useState<string | null>(null);

  async function run(action: "resend" | "cancel") {
    if (action === "cancel" && !confirm("Anulezi invitația?")) return;
    setBusy(action);
    setMsg(null);
    const { ok, data } = await jsonFetch(`/api/admin/invitations/${invitationId}`, { method: "POST", body: JSON.stringify({ action }) });
    setBusy(null);
    if (!ok) {
      setMsg({ tone: "err", text: String(data.error ?? "Eroare.") });
      return;
    }
    if (action === "resend") {
      setJoinUrl(String(data.joinUrl ?? ""));
      setMsg({ tone: "ok", text: data.emailSent ? "Email retrimis, valabil 14 zile." : "Prelungită, dar emailul NU a plecat. Trimite linkul manual." });
    } else {
      setMsg({ tone: "ok", text: "Anulată." });
    }
    router.refresh();
  }

  if (status === "accepted") return null;
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        <button type="button" disabled={busy !== null} onClick={() => run("resend")} className={buttonClass}>
          <RotateCw className="h-3.5 w-3.5" /> {busy === "resend" ? "…" : "Retrimite"}
        </button>
        {status === "pending" && (
          <button type="button" disabled={busy !== null} onClick={() => run("cancel")} className={buttonClass}>
            <XCircle className="h-3.5 w-3.5" /> Anulează
          </button>
        )}
      </div>
      <Feedback msg={msg} />
      {joinUrl && <input readOnly value={joinUrl} onFocus={(e) => e.currentTarget.select()} className={`${inputClass} w-full font-mono text-[11px]`} />}
    </div>
  );
}

// ─── Notificare push ─────────────────────────────────────────────────────────

export function NotifyFamilyForm({ familyId, devices }: { familyId: string; devices: number }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  if (devices === 0) {
    return <p className="text-sm text-stone-400">Niciun membru nu are notificările push activate.</p>;
  }

  return (
    <form
      className="space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!confirm(`Trimiți notificarea pe ${devices} dispozitiv(e)?`)) return;
        setBusy(true);
        setMsg(null);
        const { ok, data } = await jsonFetch(`/api/admin/families/${familyId}/notify`, { method: "POST", body: JSON.stringify({ title, body }) });
        setBusy(false);
        if (!ok) {
          setMsg({ tone: "err", text: String(data.error ?? "Eroare.") });
          return;
        }
        setMsg({ tone: "ok", text: `Trimisă pe ${data.devices} dispozitiv(e).` });
        setTitle("");
        setBody("");
      }}
    >
      <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="Titlu" className={`${inputClass} w-full`} required />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={200} rows={2} placeholder="Mesaj (opțional)" className={`${inputClass} w-full`} />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-stone-400">{devices} dispozitiv(e) abonate</span>
        <button type="submit" disabled={busy || !title.trim()} className={primaryButtonClass}>
          <Send className="h-3.5 w-3.5" /> {busy ? "Se trimite…" : "Trimite"}
        </button>
      </div>
      <Feedback msg={msg} />
    </form>
  );
}

// ─── Note interne ────────────────────────────────────────────────────────────

type Note = { id: string; text: string; adminEmail: string; createdAt: string | null };

export function AdminNotes({ familyId, initialNotes }: { familyId: string; initialNotes: Note[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <form
        className="space-y-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          const { ok, data } = await jsonFetch(`/api/admin/families/${familyId}/notes`, { method: "POST", body: JSON.stringify({ text }) });
          setBusy(false);
          if (!ok) {
            setError(String(data.error ?? "Eroare."));
            return;
          }
          setNotes((prev) => [data.note as Note, ...prev]);
          setText("");
        }}
      >
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="Ex.: a cerut factură pe firmă, revenim pe 15…" className={`${inputClass} w-full`} />
        <div className="flex justify-end">
          <button type="submit" disabled={busy || !text.trim()} className={primaryButtonClass}>
            {busy ? "Se salvează…" : "Adaugă notă"}
          </button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </form>
      {notes.length === 0 ? (
        <p className="text-sm text-stone-400">Nicio notă.</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="rounded-xl bg-stone-50 px-3 py-2 dark:bg-stone-800/60">
              <p className="whitespace-pre-wrap text-sm">{n.text}</p>
              <div className="mt-1 flex items-center justify-between gap-2 text-xs text-stone-500">
                <span>
                  {n.adminEmail} · {fmtRelative(n.createdAt)}
                </span>
                <button
                  type="button"
                  className="text-stone-400 hover:text-red-600"
                  aria-label="Șterge nota"
                  onClick={async () => {
                    if (!confirm("Ștergi nota?")) return;
                    const { ok } = await jsonFetch(`/api/admin/families/${familyId}/notes?noteId=${n.id}`, { method: "DELETE" });
                    if (ok) setNotes((prev) => prev.filter((x) => x.id !== n.id));
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function InvitationStatusBadge({ status, expiresAt }: { status: string; expiresAt: string | null }) {
  const tone = status === "accepted" ? "good" : status === "pending" ? "info" : status === "expired" ? "warn" : "neutral";
  const label =
    status === "accepted" ? "acceptată" : status === "pending" ? `în așteptare · expiră ${fmtDate(expiresAt, "d MMM")}` : status === "expired" ? "expirată" : status === "cancelled" ? "anulată" : status;
  return <Badge tone={tone}>{label}</Badge>;
}
