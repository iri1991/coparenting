"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { CheckCheck, Reply, SendHorizontal, Clock, X, Send, Sparkles } from "lucide-react";
import { analyzeMessageTone } from "@/lib/message-tone";
import type { ScheduledMessage } from "@/types/scheduled-message";

const COOLDOWN_MINUTES = 5;

export interface ChatMessage {
  id: string;
  senderId: string;
  senderLabel: string;
  text: string;
  createdAt: string;
  seenByOther?: boolean;
  replyTo?: {
    id: string;
    senderId: string;
    senderLabel: string;
    text: string;
  } | null;
}

const POLL_INTERVAL_MS = 8000;

function formatCountdown(sendAt: string, nowTs: number): string {
  const ms = new Date(sendAt).getTime() - nowTs;
  if (ms <= 0) return "se trimite…";
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function mergeChatMessages(prev: ChatMessage[], server: ChatMessage[]): ChatMessage[] {
  const map = new Map<string, ChatMessage>();
  for (const m of server) map.set(m.id, m);
  for (const m of prev) {
    if (!map.has(m.id)) map.set(m.id, m);
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function ChatClient({
  initialMessages,
  currentUserId,
}: {
  initialMessages: ChatMessage[];
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [scheduled, setScheduled] = useState<ScheduledMessage[]>([]);
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [toneDismissed, setToneDismissed] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);

  const tone = useMemo(() => analyzeMessageTone(input), [input]);

  const fetchScheduled = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/scheduled", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.scheduled)) setScheduled(data.scheduled);
    } catch {
      // ignore
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/chat", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.messages)) {
        setMessages((prev) => mergeChatMessages(prev, data.messages));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetch("/api/chat/read", { method: "POST" }).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [fetchMessages]);

  useEffect(() => {
    fetchScheduled();
    const t = setInterval(fetchScheduled, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [fetchScheduled]);

  // Ticker de 1s doar cât există mesaje programate (pentru countdown).
  useEffect(() => {
    if (scheduled.length === 0) return;
    const t = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(t);
  }, [scheduled.length]);

  // Când un countdown ajunge la 0, livrarea se face server-side; reîmprospătează.
  useEffect(() => {
    if (scheduled.length === 0) return;
    const anyDue = scheduled.some((s) => new Date(s.sendAt).getTime() <= nowTs);
    if (anyDue) {
      fetchScheduled();
      fetchMessages();
    }
  }, [nowTs, scheduled, fetchScheduled, fetchMessages]);

  useEffect(() => {
    const onOnline = () => {
      fetchMessages();
      fetch("/api/chat/read", { method: "POST" }).catch(() => {});
    };
    window.addEventListener("homesplit:online", onOnline as EventListener);
    return () => window.removeEventListener("homesplit:online", onOnline as EventListener);
  }, [fetchMessages]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, replyToId: replyTo?.id ?? undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Nu s-a putut trimite mesajul.");
        return;
      }
      setInput("");
      setMessages((prev) =>
        mergeChatMessages(prev, [
          {
            id: data.id,
            senderId: data.senderId,
            senderLabel: "Tu",
            text: data.text,
            createdAt: data.createdAt,
            seenByOther: false,
            replyTo: data.replyTo
              ? {
                  id: String(data.replyTo.id),
                  senderId: String(data.replyTo.senderId),
                  senderLabel:
                    data.replyTo.senderId === currentUserId
                      ? "Tu"
                      : prev.find((x) => x.id === String(data.replyTo.id))?.senderLabel || "Membru",
                  text: String(data.replyTo.text),
                }
              : null,
          },
        ])
      );
      setReplyTo(null);
    } finally {
      setSending(false);
    }
  }, [input, sending, replyTo, currentUserId]);

  const scheduleMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/chat/scheduled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, replyToId: replyTo?.id ?? undefined, delayMinutes: COOLDOWN_MINUTES }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Nu s-a putut programa mesajul.");
        return;
      }
      setInput("");
      setReplyTo(null);
      setToneDismissed(false);
      if (data.scheduled) setScheduled((prev) => [...prev, data.scheduled as ScheduledMessage]);
    } finally {
      setSending(false);
    }
  }, [input, sending, replyTo]);

  const cancelScheduled = useCallback(async (id: string) => {
    setScheduled((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/chat/scheduled?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
  }, []);

  const sendScheduledNow = useCallback(
    async (id: string) => {
      setScheduled((prev) => prev.filter((s) => s.id !== id));
      await fetch("/api/chat/scheduled", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "send-now" }),
      }).catch(() => {});
      fetchMessages();
    },
    [fetchMessages]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-4 pt-3"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
          {messages.length === 0 && (
            <div className="app-native-surface mx-auto max-w-md rounded-[2rem] px-5 py-8 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Conversație</p>
              <p className="mt-2 text-base font-semibold text-stone-900">Niciun mesaj încă</p>
              <p className="mt-1 text-sm leading-6 text-stone-500">
                Scrie primul mesaj ca să rămâneți aliniați fără telefoane sau explicații repetate.
              </p>
            </div>
          )}

          {messages.map((m) => {
            const isMe = m.senderId === currentUserId;
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className={`max-w-[88%] sm:max-w-[78%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                  <span className="mb-1 px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
                    {isMe ? "Tu" : m.senderLabel}
                  </span>
                  <div
                    className={`rounded-[1.8rem] px-4 py-3 shadow-[0_14px_32px_rgba(28,25,23,0.07)] ${
                      isMe
                        ? "bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-white rounded-br-[0.7rem]"
                        : "app-native-surface text-stone-900 rounded-bl-[0.7rem]"
                    }`}
                  >
                    {m.replyTo && (
                      <div
                        className={`mb-2 rounded-[1rem] border px-3 py-2 text-xs ${
                          isMe
                            ? "border-white/18 bg-white/12 text-white/85"
                            : "border-[#ecd8c5] bg-[#f8f1e8] text-stone-600"
                        }`}
                      >
                        <p className="font-semibold">{m.replyTo.senderId === currentUserId ? "Tu" : m.replyTo.senderLabel}</p>
                        <p className="max-h-10 overflow-hidden whitespace-pre-wrap break-words">{m.replyTo.text}</p>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap break-words text-[15px] leading-6">{m.text}</p>
                  </div>

                  <div className="mt-1.5 flex items-center gap-2 px-1">
                    <button
                      type="button"
                      onClick={() => setReplyTo(m)}
                      className="inline-flex items-center gap-1 rounded-full bg-white/60 px-2.5 py-1 text-[11px] font-semibold text-stone-500 shadow-[0_8px_20px_rgba(28,25,23,0.05)]"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      Răspunde
                    </button>
                    <span className="text-xs text-stone-400">
                      {new Date(m.createdAt).toLocaleString("ro-RO", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isMe && m.seenByOther && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <CheckCheck className="h-3.5 w-3.5" />
                        Văzut
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={listEndRef} />
        </div>
      </div>

      <div className="shrink-0 px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-2">
        <div className="mx-auto w-full max-w-3xl">
          <div className="app-native-glass rounded-[2rem] p-3">
            {scheduled.length > 0 && (
              <div className="mb-3 space-y-2">
                {scheduled.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 rounded-[1.35rem] border border-[#cfe3dc] bg-[#edf6f3] px-3 py-2.5"
                  >
                    <Clock className="h-4 w-4 shrink-0 text-[#1f5a4e]" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1f5a4e]">
                        Mesaj programat · {formatCountdown(s.sendAt, nowTs)}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-stone-600">{s.text}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void sendScheduledNow(s.id)}
                      className="shrink-0 rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-[#1f5a4e] hover:bg-white"
                    >
                      <Send className="inline h-3 w-3 -mt-0.5 mr-1" />
                      Acum
                    </button>
                    <button
                      type="button"
                      onClick={() => void cancelScheduled(s.id)}
                      className="shrink-0 rounded-full bg-white/80 p-1.5 text-stone-500 hover:bg-white"
                      aria-label="Anulează mesajul programat"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {replyTo && (
              <div className="mb-3 flex items-start justify-between gap-2 rounded-[1.35rem] border border-[#ecd8c5] bg-[#fff5eb] px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b85c3e]">
                    Răspuns către {replyTo.senderId === currentUserId ? "tine" : replyTo.senderLabel}
                  </p>
                  <p className="mt-1 max-h-10 overflow-hidden whitespace-pre-wrap break-words text-sm text-stone-600">
                    {replyTo.text}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-stone-500"
                  aria-label="Anulează reply"
                >
                  Închide
                </button>
              </div>
            )}

            {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

            {tone.tense && !toneDismissed && input.trim() && (
              <div className="mb-2 flex items-start gap-2 rounded-[1.35rem] border border-[#f0d9a8] bg-[#fdf6e7] px-3 py-2.5">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#a9762a]" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#8a6320]">
                    Mesajul pare tensionat — {tone.reasons[0]}.
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#9a7a3e]">
                    Poți reformula sau folosi „{COOLDOWN_MINUTES} min” ca să-l trimiți după o pauză.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setToneDismissed(true)}
                  className="shrink-0 rounded-full bg-white/70 p-1.5 text-[#a9762a] hover:bg-white"
                  aria-label="Am înțeles"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-end gap-2">
              <input
                type="text"
                enterKeyHint="send"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (toneDismissed) setToneDismissed(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Scrie un mesaj clar și scurt"
                maxLength={2000}
                className="app-native-input flex-1 min-w-0 px-4 py-3 text-base"
                style={{ fontSize: "16px" }}
                disabled={sending}
                autoComplete="off"
                autoCorrect="on"
                autoCapitalize="sentences"
              />
              <button
                type="button"
                onClick={() => void scheduleMessage()}
                disabled={sending || !input.trim()}
                className="flex h-12 shrink-0 items-center gap-1 rounded-full border border-[#cfe3dc] bg-[#edf6f3] px-3 text-sm font-semibold text-[#1f5a4e] disabled:opacity-50 disabled:pointer-events-none"
                title={`Trimite după ${COOLDOWN_MINUTES} minute (timp de reflecție)`}
                aria-label={`Trimite după ${COOLDOWN_MINUTES} minute`}
              >
                <Clock className="h-4 w-4" />
                {COOLDOWN_MINUTES}m
              </button>
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={sending || !input.trim()}
                className="app-native-primary-button flex h-12 w-12 shrink-0 items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
                aria-label="Trimite"
              >
                <SendHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
