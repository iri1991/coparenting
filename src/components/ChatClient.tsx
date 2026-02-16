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
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-3 p-2 min-h-0">
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
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  isMe
                    ? "bg-amber-500 text-white rounded-br-md"
                    : "bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100 rounded-bl-md"
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

      <form onSubmit={handleSubmit} className="p-3 border-t border-stone-200 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80">
        {error && (
          <p className="text-red-600 dark:text-red-400 text-xs mb-2">{error}</p>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Scrie un mesaj…"
            maxLength={2000}
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-amber-500 text-white font-medium text-sm hover:bg-amber-600 disabled:opacity-50 disabled:pointer-events-none"
          >
            {sending ? "…" : "Trimite"}
          </button>
        </div>
      </form>
    </div>
  );
}
