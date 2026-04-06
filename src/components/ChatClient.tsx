"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CheckCheck, Reply, SendHorizontal } from "lucide-react";

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
  const listEndRef = useRef<HTMLDivElement>(null);

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
                        ? "bg-[linear-gradient(180deg,#22453f_0%,#19332f_100%)] text-white rounded-br-[0.7rem]"
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

            <div className="flex items-end gap-2">
              <input
                type="text"
                enterKeyHint="send"
                value={input}
                onChange={(e) => setInput(e.target.value)}
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
