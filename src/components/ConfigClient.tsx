"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Upload, Mail } from "lucide-react";
import { NotificationSettingsSection } from "@/components/NotificationSettingsSection";
import { UpgradeCta } from "@/components/UpgradeCta";

interface FamilyData {
  id: string;
  parent1Name: string;
  parent2Name: string;
  name: string;
}
interface TravelDocRef {
  id: string;
  name: string;
}
interface ChildData {
  id: string;
  name: string;
  allergies?: string;
  travelDocuments?: TravelDocRef[];
  notes?: string;
}

function ChildDetailsForm({
  child,
  onSave,
  onDocumentsChange,
  saving,
  canUseDocuments = true,
}: {
  child: ChildData;
  onSave: (data: { allergies?: string; notes?: string }) => void;
  onDocumentsChange: (docs: TravelDocRef[]) => void;
  saving: boolean;
  canUseDocuments?: boolean;
}) {
  const [allergies, setAllergies] = useState(child.allergies ?? "");
  const [notes, setNotes] = useState(child.notes ?? "");
  const [docName, setDocName] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const docs = child.travelDocuments ?? [];
  useEffect(() => {
    setAllergies(child.allergies ?? "");
    setNotes(child.notes ?? "");
  }, [child.id, child.allergies, child.notes]);
  async function handleUploadDocument(e: React.FormEvent) {
    e.preventDefault();
    if (!docName.trim() || !docFile) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.set("childId", child.id);
      form.set("name", docName.trim());
      form.set("file", docFile);
      const res = await fetch("/api/children/documents", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Eroare la încărcare.");
        return;
      }
      onDocumentsChange([...docs, { id: data.id, name: data.name }]);
      setDocName("");
      setDocFile(null);
    } finally {
      setUploading(false);
    }
  }
  async function handleDeleteDocument(docId: string) {
    if (!confirm("Ștergi acest document?")) return;
    const res = await fetch(`/api/children/documents/${docId}`, { method: "DELETE" });
    if (!res.ok) return;
    onDocumentsChange(docs.filter((d) => d.id !== docId));
  }
  return (
    <div className="px-3 pb-3 pt-1 border-t border-stone-200 dark:border-stone-700 space-y-3">
      <div>
        <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Alergii / intoleranțe</label>
        <textarea
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          placeholder="Ex. alergie la lactoză, nuci"
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-sm"
        />
      </div>
      {canUseDocuments && (
      <div>
        <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Documente călătorie</label>
        <p className="text-xs text-stone-400 mb-2">Încarcă fișiere (PDF sau imagini) cu un nume (ex. Pașaport, Act identitate).</p>
        {docs.length > 0 && (
          <ul className="space-y-1.5 mb-2">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-sm">
                <a
                  href={`/api/children/documents/${d.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-600 dark:text-amber-400 hover:underline truncate"
                >
                  {d.name}
                </a>
                <button
                  type="button"
                  onClick={() => handleDeleteDocument(d.id)}
                  className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-stone-400 hover:text-red-600 shrink-0"
                  aria-label="Șterge document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleUploadDocument} className="flex flex-wrap gap-2 items-end">
          <input
            type="text"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            placeholder="Nume document"
            className="flex-1 min-w-[120px] px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-sm"
          />
          <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800 text-sm">
            <Upload className="w-4 h-4" />
            <span>{docFile ? docFile.name : "Alege fișier"}</span>
            <input
              type="file"
              accept=".pdf,application/pdf,image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <button
            type="submit"
            disabled={uploading || !docName.trim() || !docFile}
            className="px-3 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
          >
            {uploading ? "Se încarcă…" : "Adaugă"}
          </button>
        </form>
      </div>
      )}
      {!canUseDocuments && (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-stone-500 dark:text-stone-400">Documentele sunt disponibile în planul Pro.</p>
          <UpgradeCta variant="inline" />
        </div>
      )}
      <div>
        <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Alte informații</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Sănătate, medicamente, contact doctor etc."
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-sm"
        />
      </div>
      <button
        type="button"
        onClick={() => onSave({ allergies: allergies.trim() || undefined, notes: notes.trim() || undefined })}
        disabled={saving}
        className="w-full py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
      >
        {saving ? "Se salvează…" : "Salvează"}
      </button>
    </div>
  );
}

interface ResidenceData {
  id: string;
  name: string;
}

interface ConfigClientProps {
  initialFamily: FamilyData;
  initialChildren: ChildData[];
  initialResidences: ResidenceData[];
  memberCount?: number;
  /** Când true, butoanele de jos sunt „Înapoi la cont” și „Merg la calendar” (pentru pagina Cont). */
  embedInAccount?: boolean;
  /** ID user curent pentru secțiunea Notificări push. */
  currentUserId?: string;
  /** Plan familie: Free nu are documente. */
  plan?: "free" | "pro" | "family";
  /** Link pentru „Înapoi” / „Merg la calendar” (ex. /?plan=pro după setup cu plan). */
  returnToHref?: string;
}

export function ConfigClient({
  initialFamily,
  initialChildren,
  initialResidences,
  memberCount = 0,
  embedInAccount = false,
  currentUserId,
  plan = "free",
  returnToHref,
}: ConfigClientProps) {
  const canUseDocuments = plan === "pro" || plan === "family";
  const router = useRouter();
  const [family, setFamily] = useState(initialFamily);
  const [children, setChildren] = useState(initialChildren);
  const [residences, setResidences] = useState(initialResidences);
  const [newChildName, setNewChildName] = useState("");
  const [newResidenceName, setNewResidenceName] = useState("");
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importJson, setImportJson] = useState("");
  const [importJsonFile, setImportJsonFile] = useState<File | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ joinUrl: string; emailSent: boolean } | null>(null);
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const canSharePdf = plan === "pro" || plan === "family";

  useEffect(() => {
    if (!canSharePdf) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/share-link");
        const data = await res.json().catch(() => ({}));
        if (!cancelled && data.shareUrl) setShareUrl(data.shareUrl);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canSharePdf]);

  async function saveFamily() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/family", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent1Name: family.parent1Name.trim() || null,
          parent2Name: family.parent2Name.trim() || null,
          name: family.name.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Eroare la salvare." });
        return;
      }
      setMessage({ type: "ok", text: "Salvat." });
    } finally {
      setSaving(false);
    }
  }

  async function addChild() {
    const name = newChildName.trim();
    if (!name) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Eroare." });
        return;
      }
      setChildren((prev) => [...prev, { id: data.id, name }]);
      setNewChildName("");
    } finally {
      setSaving(false);
    }
  }

  async function removeChild(id: string) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/children?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) return;
      setChildren((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setSaving(false);
    }
  }

  async function addResidence() {
    const name = newResidenceName.trim();
    if (!name) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/residences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Eroare." });
        return;
      }
      setResidences((prev) => [...prev, { id: data.id, name }]);
      setNewResidenceName("");
    } finally {
      setSaving(false);
    }
  }

  async function removeResidence(id: string) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/residences?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) return;
      setResidences((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setSaving(false);
    }
  }

  async function handleImportIcs() {
    if (!importFile) return;
    setImporting(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.set("file", importFile);
      const res = await fetch("/api/import/ics", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Eroare la import." });
        return;
      }
      setMessage({ type: "ok", text: data.message || `Importate ${data.imported ?? 0} evenimente.` });
      setImportFile(null);
    } finally {
      setImporting(false);
    }
  }

  async function handleImportJson() {
    let payload: unknown;
    if (importJsonFile) {
      try {
        const text = await importJsonFile.text();
        payload = JSON.parse(text);
      } catch {
        setMessage({ type: "error", text: "Fișierul JSON nu este valid." });
        return;
      }
    } else if (importJson.trim()) {
      try {
        payload = JSON.parse(importJson);
      } catch {
        setMessage({ type: "error", text: "JSON invalid. Lipește un array de evenimente." });
        return;
      }
    } else {
      setMessage({ type: "error", text: "Lipește JSON sau alege un fișier .json" });
      return;
    }
    setImporting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/import/json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Array.isArray(payload) ? payload : [payload]),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Eroare la import." });
        return;
      }
      setMessage({ type: "ok", text: data.message || `Importate ${data.imported ?? 0} evenimente.` });
      setImportJson("");
      setImportJsonFile(null);
    } finally {
      setImporting(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;
    setInviteLoading(true);
    setMessage(null);
    setInviteResult(null);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Eroare la trimitere." });
        return;
      }
      setInviteResult({ joinUrl: data.joinUrl ?? "", emailSent: data.emailSent ?? false });
      setMessage({ type: "ok", text: data.emailSent ? "Invitație trimisă pe email." : "Link generat. Copiază linkul mai jos dacă emailul nu a fost trimis." });
    } finally {
      setInviteLoading(false);
    }
  }

  function handleDone() {
    router.push(embedInAccount ? "/" : (returnToHref ?? "/"));
    router.refresh();
  }

  async function saveChildDetails(childId: string, data: { allergies?: string; notes?: string }) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/children?id=${encodeURIComponent(childId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "error", text: result.error || "Eroare la salvare." });
        return;
      }
      setChildren((prev) =>
        prev.map((c) => (c.id === childId ? { ...c, ...result } : c))
      );
      setMessage({ type: "ok", text: "Salvat." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {currentUserId && <NotificationSettingsSection currentUserId={currentUserId} />}
      <section className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-4">
        <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-3">Configurare inițială</h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
          Numele familiei și al părinților – folosit în calendar și notificări.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Nume familie (opțional)</label>
            <input
              type="text"
              value={family.name}
              onChange={(e) => setFamily((f) => ({ ...f, name: e.target.value }))}
              onBlur={() => saveFamily()}
              placeholder="Ex. Familia Popescu"
              className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Primul părinte</label>
            <input
              type="text"
              value={family.parent1Name}
              onChange={(e) => setFamily((f) => ({ ...f, parent1Name: e.target.value }))}
              onBlur={() => saveFamily()}
              placeholder="Nume"
              className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Al doilea părinte</label>
            <input
              type="text"
              value={family.parent2Name}
              onChange={(e) => setFamily((f) => ({ ...f, parent2Name: e.target.value }))}
              onBlur={() => saveFamily()}
              placeholder="Nume"
              className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-4">
        <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-3">Copii</h2>
        <ul className="space-y-2 mb-3">
          {children.map((c) => (
            <li key={c.id} className="rounded-xl bg-stone-50 dark:bg-stone-800/50 overflow-hidden">
              <div className="flex items-center justify-between gap-2 py-2 px-3">
                <span className="font-medium text-stone-800 dark:text-stone-200">{c.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setExpandedChildId(expandedChildId === c.id ? null : c.id)}
                    className="p-2 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 text-sm"
                    aria-expanded={expandedChildId === c.id}
                  >
                    {expandedChildId === c.id ? "Ascunde" : "Detalii"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeChild(c.id)}
                    disabled={saving}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-stone-400 hover:text-red-600"
                    aria-label="Șterge"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {expandedChildId === c.id && (
                <ChildDetailsForm
                  child={c}
                  onSave={(data) => saveChildDetails(c.id, data)}
                  onDocumentsChange={(travelDocuments) =>
                    setChildren((prev) => prev.map((ch) => (ch.id === c.id ? { ...ch, travelDocuments } : ch)))
                  }
                  saving={saving}
                  canUseDocuments={canUseDocuments}
                />
              )}
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input
            type="text"
            value={newChildName}
            onChange={(e) => setNewChildName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addChild())}
            placeholder="Nume copil"
            className="flex-1 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800"
          />
          <button
            type="button"
            onClick={addChild}
            disabled={saving || !newChildName.trim()}
            className="p-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
            aria-label="Adaugă copil"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {plan === "free" && children.length >= 1 && (
          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400 flex flex-wrap items-center gap-1.5">
            Planul Free: 1 copil. Pro: până la 3. Family+: nelimitat.
            <UpgradeCta variant="inline" children="Upgrade" />
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-4">
        <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-2">Informații copil</h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
          Alergii, documente de călătorie și alte informații utile. Apasă „Detalii” lângă fiecare copil mai sus pentru a completa.
        </p>
        {children.length === 0 ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">Adaugă mai întâi un copil în secțiunea „Copii”.</p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-4">
        <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-3">Locuințe</h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
          Ex: Tunari, Otopeni, Bunici – unde poate sta copilul
        </p>
        <ul className="space-y-2 mb-3">
          {residences.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-800/50">
              <span className="font-medium text-stone-800 dark:text-stone-200">{r.name}</span>
              <button
                type="button"
                onClick={() => removeResidence(r.id)}
                disabled={saving}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-stone-400 hover:text-red-600"
                aria-label="Șterge"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input
            type="text"
            value={newResidenceName}
            onChange={(e) => setNewResidenceName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addResidence())}
            placeholder="Nume locuință"
            className="flex-1 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800"
          />
          <button
            type="button"
            onClick={addResidence}
            disabled={saving || !newResidenceName.trim()}
            className="p-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
            aria-label="Adaugă locuință"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {plan === "free" && residences.length >= 1 && (
          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400 flex flex-wrap items-center gap-1.5">
            Planul Free: 1 locuință. Pro / Family+: locații multiple.
            <UpgradeCta variant="inline" children="Upgrade" />
          </p>
        )}
      </section>

      {!canSharePdf && (
        <section className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-4">
          <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-1 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Partajare program și export PDF
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 mb-3">
            Disponibile în planul Pro – link partajare și export PDF pentru programul săptămânal.
          </p>
          <UpgradeCta variant="button" />
        </section>
      )}
      {canSharePdf && (
        <section className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-4">
          <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Partajare program săptămânal
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
            Generează un link pe care îl poți trimite bunicilor, încrengătorilor etc. Cei cu linkul văd doar programul săptămânal, într-o pagină frumoasă. Poți și salva ca PDF.
          </p>
          {shareUrl ? (
            <div className="space-y-3">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(shareUrl).then(() => setMessage({ type: "ok", text: "Link copiat." }))}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-300 font-medium hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  Copiază linkul
                </button>
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600"
                >
                  Deschide / Exportă PDF
                </a>
                <button
                  type="button"
                  disabled={shareLoading}
                  onClick={async () => {
                    setShareLoading(true);
                    setMessage(null);
                    try {
                      const res = await fetch("/api/share-link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ regenerate: true }) });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok) {
                        setMessage({ type: "error", text: data.error || "Eroare." });
                        return;
                      }
                      if (data.shareUrl) setShareUrl(data.shareUrl);
                      setMessage({ type: "ok", text: "Link nou generat. Linkul vechi nu mai funcționează." });
                    } finally {
                      setShareLoading(false);
                    }
                  }}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-600 text-stone-500 dark:text-stone-400 text-sm hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-50"
                >
                  {shareLoading ? "Se generează…" : "Resetează link"}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={shareLoading}
              onClick={async () => {
                setShareLoading(true);
                setMessage(null);
                try {
                  const res = await fetch("/api/share-link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    setMessage({ type: "error", text: data.error || "Eroare." });
                    return;
                  }
                  if (data.shareUrl) setShareUrl(data.shareUrl);
                  setMessage({ type: "ok", text: "Link generat. Copiază-l și trimite-l celor care trebuie să vadă programul." });
                } finally {
                  setShareLoading(false);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
            >
              {shareLoading ? "Se generează…" : "Generează link partajare"}
            </button>
          )}
        </section>
      )}

      {memberCount < 2 && (
        <section className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-4">
          <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Invită celălalt părinte
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
            Trimite invitația pe email. Celălalt părinte va primi un link pentru a se alătura familiei.
          </p>
          <form onSubmit={handleInvite} className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Email</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@exemplu.com"
                required
                className="w-full px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800"
              />
            </div>
            <button
              type="submit"
              disabled={inviteLoading}
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
            >
              {inviteLoading ? "Se trimite…" : "Trimite invitația"}
            </button>
          </form>
          {inviteResult && (
            <div className="mt-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 text-sm">
              <p className="text-stone-600 dark:text-stone-400 mb-1">Link invitație (poți să-l trimiți manual):</p>
              <input
                type="text"
                readOnly
                value={inviteResult.joinUrl}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs"
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(inviteResult.joinUrl)}
                className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline"
              >
                Copiază linkul
              </button>
            </div>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-4">
        <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-2">Importă evenimente</h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
          Din fișier .ics sau din JSON (array de evenimente cu date, parent, location).
        </p>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800">
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">{importFile ? importFile.name : "Fișier .ics"}</span>
              <input
                type="file"
                accept=".ics,text/calendar"
                className="sr-only"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <button
              type="button"
              onClick={handleImportIcs}
              disabled={importing || !importFile}
              className="px-4 py-2 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
            >
              {importing ? "Se importă…" : "Importă .ics"}
            </button>
          </div>
          <div>
            <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">sau lipește JSON / alege .json</label>
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder='[{"date":"2026-02-02","parent":"tata","location":"tunari"}, ...]'
              rows={4}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-sm font-mono"
            />
            <div className="flex flex-wrap gap-2 items-center mt-2">
              <label className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800 text-sm">
                <Upload className="w-4 h-4" />
                {importJsonFile ? importJsonFile.name : "Fișier .json"}
                <input
                  type="file"
                  accept=".json,application/json"
                  className="sr-only"
                  onChange={(e) => {
                    setImportJsonFile(e.target.files?.[0] ?? null);
                    setImportJson("");
                  }}
                />
              </label>
              <button
                type="button"
                onClick={handleImportJson}
                disabled={importing || (!importJson.trim() && !importJsonFile)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
              >
                {importing ? "Se importă…" : "Importă JSON"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {message && (
        <p className={`text-sm ${message.type === "error" ? "text-red-600" : "text-emerald-600"}`}>{message.text}</p>
      )}

      <div className="flex gap-3">
        <Link
          href={embedInAccount ? "/account" : (returnToHref ?? "/")}
          className="flex-1 py-3 text-center rounded-xl border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-300 font-medium"
        >
          {embedInAccount ? "Înapoi la cont" : "Înapoi"}
        </Link>
        <button
          type="button"
          onClick={handleDone}
          className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600"
        >
          {embedInAccount ? "Merg la calendar" : "Gata, merg la calendar"}
        </button>
      </div>
    </div>
  );
}
