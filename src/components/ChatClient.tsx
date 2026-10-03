"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo, Fragment } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, Check, CheckCheck, Reply, ArrowUp, Clock, X, Send, Sparkles } from "lucide-react";
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

function sameMessage(a: ChatMessage, b: ChatMessage): boolean {
  return (
    a.id === b.id &&
    a.text === b.text &&
    a.createdAt === b.createdAt &&
    a.senderLabel === b.senderLabel &&
    Boolean(a.seenByOther) === Boolean(b.seenByOther) &&
    (a.replyTo?.id ?? null) === (b.replyTo?.id ?? null)
  );
}

/**
 * Unește lista locală cu cea de pe server (serverul câștigă pentru mesajele comune).
 * Întoarce exact `prev` dacă nu s-a schimbat nimic, ca să nu provoace re-randări/scroll inutile.
 */
function mergeChatMessages(prev: ChatMessage[], server: ChatMessage[]): ChatMessage[] {
  const map = new Map<string, ChatMessage>();
  for (const m of server) map.set(m.id, m);
  for (const m of prev) {
    if (!map.has(m.id)) map.set(m.id, m);
  }
  const merged = Array.from(map.values()).sort((a, b) => {
    const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return diff !== 0 ? diff : a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
  if (merged.length === prev.length && merged.every((m, i) => sameMessage(m, prev[i]))) {
    return prev;
  }
  return merged;
}

export function ChatClient({
  initialMessages,
  currentUserId,
  partnerName,
}: {
  initialMessages: ChatMessage[];
  currentUserId: string;
  partnerName: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [scheduled, setScheduled] = useState<ScheduledMessage[]>([]);
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [toneDismissed, setToneDismissed] = useState(false);

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

  // Numerotează cererile ca un răspuns întârziat (mai vechi) să nu suprascrie unul mai nou.
  const fetchSeqRef = useRef(0);
  const appliedSeqRef = useRef(0);

  const fetchMessages = useCallback(async () => {
    const seq = ++fetchSeqRef.current;
    try {
      const res = await fetch("/api/chat", { cache: "no-store" });
      if (!res.ok) return;
      // Copie din cache-ul offline al service worker-ului: poate fi veche, nu o aplicăm peste lista curentă.
      if (res.headers.get("X-HomeSplit-Offline") === "1") return;
      const data = await res.json();
      if (seq < appliedSeqRef.current) return;
      appliedSeqRef.current = seq;
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

  // La revenirea în aplicație (tab din fundal, PWA reluată, pagină din bfcache) reîncarcă imediat,
  // altfel se vede lista veche până la următorul poll.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      fetchMessages();
      fetch("/api/chat/read", { method: "POST" }).catch(() => {});
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("pageshow", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("pageshow", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [fetchMessages]);

  // Scroll la final doar când apare un mesaj nou la capăt (nu la fiecare poll) și doar dacă
  // utilizatorul e deja jos sau mesajul e al lui — să nu-l tragem în jos cât citește istoricul.
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  // Măsurat la scroll (înainte să apară mesajul nou), nu după randare.
  const nearBottomRef = useRef(true);
  const [showJump, setShowJump] = useState(false);
  const [unseenBelow, setUnseenBelow] = useState(0);

  const scrollToBottom = useCallback((smooth: boolean) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    nearBottomRef.current = true;
    setShowJump(false);
    setUnseenBelow(0);
  }, []);

  useLayoutEffect(() => {
    const last = messages[messages.length - 1];
    const lastId = last?.id ?? null;
    if (lastId === lastMessageIdRef.current) return;
    const isFirst = lastMessageIdRef.current === null;
    lastMessageIdRef.current = lastId;
    if (isFirst || nearBottomRef.current || last?.senderId === currentUserId) {
      scrollToBottom(!isFirst);
    } else {
      setUnseenBelow((n) => n + 1);
    }
  }, [messages, currentUserId, scrollToBottom]);

  // iOS: tastatura micșorează doar viewport-ul vizual. Ținem containerul chat-ului exact pe
  // viewport-ul vizibil ca bara de scris să stea deasupra tastaturii.
  const [viewport, setViewport] = useState<{ height: number; top: number } | null>(null);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      setViewport({ height: vv.height, top: vv.offsetTop });
      if (nearBottomRef.current) requestAnimationFrame(() => scrollToBottom(false));
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [scrollToBottom]);

  // Textarea care crește cu textul (max ~5 rânduri).
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [input]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const startReply = useCallback((m: ChatMessage) => {
    setReplyTo(m);
    setActiveId(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const jumpToMessage = useCallback((id: string) => {
    const el = document.getElementById(`msg-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightId(id);
    window.setTimeout(() => setHighlightId((cur) => (cur === id ? null : cur)), 1400);
  }, []);

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

  const partnerInitial = (partnerName.trim().charAt(0) || "?").toUpperCase();
  const lastSeenOwnId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderId === currentUserId && messages[i].seenByOther) return messages[i].id;
    }
    return null;
  }, [messages, currentUserId]);

  return (
    <div
      className="fixed inset-x-0 top-0 z-30 flex flex-col bg-[#f6f0e8] sm:bg-[#efe6db]"
      style={viewport ? { height: viewport.height, transform: `translateY(${viewport.top}px)` } : { height: "100dvh" }}
    >
      <div className="app-screen-enter mx-auto flex h-full w-full max-w-3xl flex-col sm:py-4">
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f6f0e8] sm:rounded-[28px] sm:border sm:border-[#eadccd] sm:shadow-[0_24px_60px_rgba(28,25,23,0.10)]">
          {/* Header */}
          <header className="shrink-0 border-b border-[#eadccd] bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
            <div className="flex items-center gap-3 px-2 py-2 sm:px-3">
              <Link
                href="/app"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#b85c3e] hover:bg-[#f6e9de] active:bg-[#f0ddd0]"
                aria-label="Înapoi acasă"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-base font-semibold text-white">
                {partnerInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-semibold leading-tight text-stone-900">{partnerName}</p>
                <p className="truncate text-xs text-stone-500">Co-părinte · conversație privată</p>
              </div>
            </div>
          </header>

          {/* Mesaje */}
          <div className="relative min-h-0 flex-1">
            <div
              ref={scrollContainerRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                const near = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
                nearBottomRef.current = near;
                setShowJump(!near);
                if (near) setUnseenBelow(0);
              }}
              onClick={() => setActiveId(null)}
              className="h-full overflow-y-auto overflow-x-hidden overscroll-contain px-3 pb-3 pt-2 sm:px-5"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-xl font-semibold text-white">
                    {partnerInitial}
                  </div>
                  <p className="mt-3 text-base font-semibold text-stone-900">Începe conversația cu {partnerName}</p>
                  <p className="mt-1 max-w-xs text-sm leading-6 text-stone-500">
                    Mesaje clare și scurte despre copil, program și logistică — totul rămâne aici, într-un singur loc.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {messages.map((m, i) => {
                    const prev = messages[i - 1];
                    const next = messages[i + 1];
                    const isMe = m.senderId === currentUserId;
                    const newDay = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt);
                    const groupedWithPrev = !newDay && !!prev && prev.senderId === m.senderId && minutesBetween(prev.createdAt, m.createdAt) < 5;
                    const groupedWithNext =
                      !!next && next.senderId === m.senderId && dayKey(next.createdAt) === dayKey(m.createdAt) && minutesBetween(m.createdAt, next.createdAt) < 5;
                    return (
                      <Fragment key={m.id}>
                        {newDay && (
                          <div className="my-3 flex justify-center">
                            <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-stone-500 shadow-[0_2px_8px_rgba(28,25,23,0.06)] backdrop-blur">
                              {formatDayLabel(m.createdAt)}
                            </span>
                          </div>
                        )}
                        <MessageRow
                          message={m}
                          isMe={isMe}
                          currentUserId={currentUserId}
                          groupedWithPrev={groupedWithPrev}
                          groupedWithNext={groupedWithNext}
                          showSeen={isMe && m.id === lastSeenOwnId}
                          active={activeId === m.id}
                          highlighted={highlightId === m.id}
                          onToggleActive={() => setActiveId((cur) => (cur === m.id ? null : m.id))}
                          onReply={() => startReply(m)}
                          onJumpToReply={jumpToMessage}
                        />
                      </Fragment>
                    );
                  })}
                </div>
              )}
            </div>

            {showJump && (
              <button
                type="button"
                onClick={() => scrollToBottom(true)}
                className="absolute bottom-3 right-3 flex h-10 items-center gap-1.5 rounded-full bg-white px-3 text-sm font-semibold text-stone-700 shadow-[0_8px_24px_rgba(28,25,23,0.16)]"
                aria-label="Mergi la ultimul mesaj"
              >
                {unseenBelow > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#bf6a4b] px-1.5 text-[11px] text-white">{unseenBelow}</span>
                )}
                <ArrowDown className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Compunere */}
          <div className="shrink-0 border-t border-[#eadccd] bg-white/90 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl sm:px-3">
            {scheduled.length > 0 && (
              <div className="mb-2 space-y-1.5">
                {scheduled.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 rounded-2xl bg-[#edf6f3] px-3 py-2">
                    <Clock className="h-4 w-4 shrink-0 text-[#1f5a4e]" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-[#1f5a4e]">Se trimite în {formatCountdown(s.sendAt, nowTs)}</p>
                      <p className="truncate text-sm text-stone-600">{s.text}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void sendScheduledNow(s.id)}
                      className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#1f5a4e]"
                    >
                      <Send className="-mt-0.5 mr-1 inline h-3 w-3" />
                      Acum
                    </button>
                    <button
                      type="button"
                      onClick={() => void cancelScheduled(s.id)}
                      className="shrink-0 rounded-full bg-white p-1.5 text-stone-500"
                      aria-label="Anulează mesajul programat"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {replyTo && (
              <div className="mb-2 flex items-center gap-2 rounded-2xl bg-[#fbf3ec] py-1.5 pl-3 pr-1.5">
                <div className="min-w-0 flex-1 border-l-[3px] border-[#bf6a4b] pl-2">
                  <p className="text-xs font-semibold text-[#b85c3e]">
                    Răspuns către {replyTo.senderId === currentUserId ? "tine" : replyTo.senderLabel}
                  </p>
                  <p className="truncate text-sm text-stone-600">{replyTo.text}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-500 hover:bg-white"
                  aria-label="Anulează răspunsul"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {tone.tense && !toneDismissed && input.trim() && (
              <div className="mb-2 flex items-start gap-2 rounded-2xl bg-[#fdf6e7] px-3 py-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#a9762a]" aria-hidden />
                <p className="min-w-0 flex-1 text-xs leading-5 text-[#8a6320]">
                  Mesajul pare tensionat — {tone.reasons[0]}. Poți reformula sau îl poți trimite peste {COOLDOWN_MINUTES} min cu{" "}
                  <Clock className="-mt-0.5 inline h-3 w-3" />.
                </p>
                <button
                  type="button"
                  onClick={() => setToneDismissed(true)}
                  className="shrink-0 rounded-full p-1 text-[#a9762a] hover:bg-white/70"
                  aria-label="Am înțeles"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {error && <p className="mb-1.5 px-2 text-xs text-red-600">{error}</p>}

            <div className="flex items-end gap-1.5">
              <button
                type="button"
                onClick={() => void scheduleMessage()}
                disabled={sending || !input.trim()}
                className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#1f5a4e] hover:bg-[#edf6f3] disabled:opacity-40"
                title={`Trimite după ${COOLDOWN_MINUTES} minute (timp de reflecție)`}
                aria-label={`Trimite după ${COOLDOWN_MINUTES} minute`}
              >
                <Clock className="h-5 w-5" />
              </button>
              <textarea
                ref={inputRef}
                rows={1}
                enterKeyHint="send"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (toneDismissed) setToneDismissed(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                onFocus={() => {
                  if (nearBottomRef.current) window.setTimeout(() => scrollToBottom(false), 250);
                }}
                placeholder="Mesaj"
                maxLength={2000}
                className="max-h-[132px] min-h-[42px] flex-1 resize-none rounded-[21px] border border-[#e3d3c3] bg-white px-4 py-[9px] text-[16px] leading-[22px] text-stone-900 placeholder:text-stone-400 focus:border-[#d4a088] focus:outline-none"
                autoComplete="off"
                autoCorrect="on"
                autoCapitalize="sentences"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void sendMessage()}
                disabled={sending || !input.trim()}
                className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-white shadow-[0_6px_16px_rgba(191,106,75,0.3)] transition disabled:bg-none disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none"
                aria-label="Trimite"
              >
                <ArrowUp className="h-5 w-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rând de mesaj ───────────────────────────────────────────────────────────

const SWIPE_TRIGGER_PX = 56;

function MessageRow({
  message: m,
  isMe,
  currentUserId,
  groupedWithPrev,
  groupedWithNext,
  showSeen,
  active,
  highlighted,
  onToggleActive,
  onReply,
  onJumpToReply,
}: {
  message: ChatMessage;
  isMe: boolean;
  currentUserId: string;
  groupedWithPrev: boolean;
  groupedWithNext: boolean;
  showSeen: boolean;
  active: boolean;
  highlighted: boolean;
  onToggleActive: () => void;
  onReply: () => void;
  onJumpToReply: (id: string) => void;
}) {
  // Swipe spre dreapta pe mesaj = răspunde (ca în aplicațiile de chat native).
  const [dx, setDx] = useState(0);
  const touch = useRef<{ x: number; y: number; locked: "h" | "v" | null } | null>(null);

  const radius = isMe
    ? `rounded-[20px] ${groupedWithPrev ? "rounded-tr-[6px]" : ""} ${groupedWithNext ? "rounded-br-[6px]" : "rounded-br-[4px]"}`
    : `rounded-[20px] ${groupedWithPrev ? "rounded-tl-[6px]" : ""} ${groupedWithNext ? "rounded-bl-[6px]" : "rounded-bl-[4px]"}`;

  const time = new Date(m.createdAt).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      id={`msg-${m.id}`}
      className={`group relative flex ${isMe ? "justify-end" : "justify-start"} ${groupedWithPrev ? "mt-[3px]" : "mt-2.5"}`}
      onTouchStart={(e) => {
        const t = e.touches[0];
        touch.current = { x: t.clientX, y: t.clientY, locked: null };
      }}
      onTouchMove={(e) => {
        const st = touch.current;
        if (!st) return;
        const t = e.touches[0];
        const ddx = t.clientX - st.x;
        const ddy = t.clientY - st.y;
        if (!st.locked) {
          if (Math.abs(ddx) < 8 && Math.abs(ddy) < 8) return;
          st.locked = Math.abs(ddx) > Math.abs(ddy) ? "h" : "v";
        }
        if (st.locked === "h") setDx(Math.max(0, Math.min(ddx, 80)));
      }}
      onTouchEnd={() => {
        if (dx >= SWIPE_TRIGGER_PX) onReply();
        setDx(0);
        touch.current = null;
      }}
      onTouchCancel={() => {
        setDx(0);
        touch.current = null;
      }}
    >
      <div
        className="pointer-events-none absolute left-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#b85c3e] shadow"
        style={{ opacity: Math.min(1, dx / SWIPE_TRIGGER_PX), transform: `translateY(-50%) scale(${0.6 + Math.min(0.4, dx / 140)})` }}
        aria-hidden
      >
        <Reply className="h-4 w-4" />
      </div>

      <div
        className={`flex max-w-[82%] items-end gap-1 sm:max-w-[70%] ${isMe ? "flex-row-reverse" : ""}`}
        style={{ transform: dx ? `translateX(${dx}px)` : undefined, transition: dx ? "none" : "transform 180ms ease-out" }}
      >
        <div className="flex min-w-0 flex-col">
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive();
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              onReply();
            }}
            className={`relative px-3 pb-1.5 pt-2 text-[15.5px] leading-[21px] transition-shadow ${radius} ${
              isMe
                ? "bg-[linear-gradient(180deg,#d48a63_0%,#bf6a4b_100%)] text-white"
                : "border border-[#eee2d6] bg-white text-stone-900"
            } ${highlighted ? "ring-4 ring-[#f3c9ae]" : ""}`}
          >
            {m.replyTo && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onJumpToReply(m.replyTo!.id);
                }}
                className={`mb-1.5 block w-full rounded-xl border-l-[3px] px-2 py-1 text-left text-[13px] leading-[18px] ${
                  isMe ? "border-white/70 bg-white/15 text-white/90" : "border-[#bf6a4b] bg-[#f8efe7] text-stone-600"
                }`}
              >
                <span className={`block text-xs font-semibold ${isMe ? "text-white" : "text-[#b85c3e]"}`}>
                  {m.replyTo.senderId === currentUserId ? "Tu" : m.replyTo.senderLabel}
                </span>
                <span className="line-clamp-2 whitespace-pre-wrap break-words">{m.replyTo.text}</span>
              </button>
            )}
            <span className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{m.text}</span>
            {/* Spațiu rezervat ca ora să încapă pe ultimul rând fără să se suprapună cu textul */}
            <span className={`inline-block ${isMe ? "w-[62px]" : "w-[42px]"}`} aria-hidden />
            <span
              className={`absolute bottom-1 right-2.5 flex items-center gap-0.5 text-[11px] leading-none ${isMe ? "text-white/75" : "text-stone-400"}`}
            >
              {time}
              {isMe && (m.seenByOther ? <CheckCheck className="h-3.5 w-3.5 text-white" aria-label="Văzut" /> : <Check className="h-3.5 w-3.5" aria-label="Trimis" />)}
            </span>
          </div>
          {showSeen && !groupedWithNext && <span className="mt-0.5 pr-1 text-right text-[11px] text-stone-400">Văzut</span>}
          {active && (
            <div className={`mt-1 flex ${isMe ? "justify-end" : "justify-start"}`}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReply();
                }}
                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-[0_4px_14px_rgba(28,25,23,0.12)]"
              >
                <Reply className="h-3.5 w-3.5" />
                Răspunde
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onReply}
          className="mb-1 hidden h-7 w-7 shrink-0 items-center justify-center rounded-full text-stone-400 opacity-0 transition hover:bg-white hover:text-stone-700 group-hover:opacity-100 sm:flex"
          aria-label="Răspunde"
          title="Răspunde"
        >
          <Reply className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Utilitare dată ──────────────────────────────────────────────────────────

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function minutesBetween(a: string, b: string): number {
  return Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 60000;
}

function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(today) - startOf(d)) / 86_400_000);
  if (diffDays === 0) return "Azi";
  if (diffDays === 1) return "Ieri";
  if (diffDays > 1 && diffDays < 7) {
    const w = d.toLocaleDateString("ro-RO", { weekday: "long" });
    return w.charAt(0).toUpperCase() + w.slice(1);
  }
  return d.toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    ...(d.getFullYear() !== today.getFullYear() ? { year: "numeric" } : {}),
  });
}
