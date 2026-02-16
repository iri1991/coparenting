"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderLabel: string;
  text: string;
  createdAt: string;
}

const POLL_INTERVAL_MS = 8000;

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
  const listEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/chat");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.messages)) setMessages(data.messages);
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
        body: JSON.stringify({ text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Nu s-a putut trimite mesajul.");
        return;
      }
      setInput("");
      setMessages((prev) => [
        ...prev,
        {
          id: data.id,
          senderId: data.senderId,
          senderLabel: "", // will be filled on next poll, or we could show "Tu"
          text: data.text,
          createdAt: data.createdAt,
        },
      ]);
      fetchMessages();
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
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
              </div>
              <span className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                {new Date(m.createdAt).toLocaleString("ro-RO", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
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
