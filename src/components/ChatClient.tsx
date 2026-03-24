"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-stone-100 dark:bg-stone-950">
      {/* Listă scrollabilă – ocupă tot spațiul rămas */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-3 space-y-3"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {messages.length === 0 && (
          <p className="text-center text-stone-500 dark:text-stone-400 text-sm py-8">
            Niciun mesaj încă. Scrie un mesaj pentru a începe conversația cu celălalt părinte.
          </p>
        )}
        {messages.map((m) => {
          const isMe = m.senderId === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <span className="text-xs text-stone-500 dark:text-stone-400 mb-0.5">
                {isMe ? "Tu" : m.senderLabel}
              </span>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug ${
                  isMe
                    ? "bg-amber-500 text-white rounded-br-md"
                    : "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-bl-md shadow-sm border border-stone-100 dark:border-stone-700"
                }`}
              >
                {m.replyTo && (
                  <div
                    className={`mb-1.5 rounded-lg px-2.5 py-1.5 text-xs border ${
                      isMe
                        ? "bg-white/20 border-white/30 text-white/90"
                        : "bg-stone-50 dark:bg-stone-700/60 border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300"
                    }`}
                  >
                    <p className="font-semibold">{m.replyTo.senderId === currentUserId ? "Tu" : m.replyTo.senderLabel}</p>
                    <p className="max-h-10 overflow-hidden whitespace-pre-wrap break-words">{m.replyTo.text}</p>
                  </div>
                )}
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
              </div>
              <button
                type="button"
                onClick={() => setReplyTo(m)}
                className="mt-1 text-[11px] text-stone-500 dark:text-stone-400 hover:underline"
              >
                Reply
              </button>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-stone-400 dark:text-stone-500">
                  {new Date(m.createdAt).toLocaleString("ro-RO", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {isMe && m.seenByOther && (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Seen
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={listEndRef} />
      </div>

      {/* Bară de input fixă jos – tip iMessage */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-stone-100 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800"
      >
        {replyTo && (
          <div className="mb-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30 px-3 py-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                Reply către {replyTo.senderId === currentUserId ? "tine" : replyTo.senderLabel}
              </p>
              <p className="text-xs text-stone-700 dark:text-stone-300 max-h-10 overflow-hidden whitespace-pre-wrap break-words">
                {replyTo.text}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              aria-label="Anulează reply"
            >
              ✕
            </button>
          </div>
        )}
        {error && (
          <p className="text-red-600 dark:text-red-400 text-xs mb-2">{error}</p>
        )}
        <div className="flex gap-2 items-end">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mesaj"
            maxLength={2000}
            className="flex-1 min-w-0 px-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-base focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            style={{ fontSize: "16px" }}
            disabled={sending}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 disabled:pointer-events-none touch-manipulation"
            aria-label="Trimite"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
