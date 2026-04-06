import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ObjectId } from "mongodb";
import { ChatClient, type ChatMessage } from "@/components/ChatClient";
import { MobileQuickNav } from "@/components/MobileQuickNav";
import { MobileAppTopBar } from "@/components/MobileAppTopBar";

const MAX_MESSAGES = 100;

export default async function ChatPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  if (!session.user.familyId) {
    redirect("/setup");
  }

  const db = await getDb();
  const familyId = new ObjectId(session.user.familyId);
  const family = await getActiveFamily(db, familyId);
  if (!family) {
    redirect("/family-deactivated");
  }

  const memberIds = family.memberIds ?? [];
  const parent1Name = (family as { parent1Name?: string }).parent1Name?.trim() || "Părinte 1";
  const parent2Name = (family as { parent2Name?: string }).parent2Name?.trim() || "Părinte 2";
  const otherMemberId = memberIds.find((id) => id !== session.user.id) ?? null;
  let otherLastReadAt: Date | null = null;
  if (otherMemberId) {
    const otherUser = await db.collection("users").findOne(
      { _id: new ObjectId(otherMemberId) },
      { projection: { chatLastReadAt: 1 } }
    );
    otherLastReadAt = (otherUser as { chatLastReadAt?: Date } | null)?.chatLastReadAt ?? null;
  }

  const docs = await db
    .collection("messages")
    .find({ familyId })
    .sort({ createdAt: 1 })
    .limit(MAX_MESSAGES)
    .toArray();

  const initialMessages: ChatMessage[] = (
    docs as {
      _id: unknown;
      senderId: string;
      text: string;
      createdAt: Date;
      replyToId?: string;
      replyToSenderId?: string;
      replyToText?: string;
    }[]
  ).map((d) => {
    const senderIndex = memberIds.indexOf(d.senderId);
    const senderLabel = senderIndex === 0 ? parent1Name : senderIndex === 1 ? parent2Name : "Membru";
    const seenByOther =
      d.senderId === session.user.id &&
      !!otherLastReadAt &&
      d.createdAt.getTime() <= otherLastReadAt.getTime();
    let replyTo: ChatMessage["replyTo"] = null;
    if (
      typeof d.replyToId === "string" &&
      d.replyToId &&
      typeof d.replyToSenderId === "string" &&
      d.replyToSenderId &&
      typeof d.replyToText === "string"
    ) {
      const replySenderIndex = memberIds.indexOf(d.replyToSenderId);
      const replySenderLabel =
        replySenderIndex === 0 ? parent1Name : replySenderIndex === 1 ? parent2Name : "Membru";
      replyTo = {
        id: d.replyToId,
        senderId: d.replyToSenderId,
        senderLabel: replySenderLabel,
        text: d.replyToText,
      };
    }
    return {
      id: String(d._id),
      senderId: d.senderId,
      senderLabel,
      text: d.text,
      createdAt: d.createdAt.toISOString(),
      seenByOther,
      replyTo,
    };
  });

  return (
    <div className="app-native-shell h-screen max-h-[100dvh] overflow-hidden">
      <MobileAppTopBar hideOnScroll={false} />
      <header className="safe-area-inset-top hidden shrink-0 px-4 pt-4 sm:flex">
        <div className="app-native-glass mx-auto flex w-full max-w-3xl items-center justify-between gap-2 rounded-[30px] px-4 py-3">
          <Link
            href="/"
            className="app-native-secondary-button px-4 py-2 text-sm font-semibold text-stone-700"
          >
            Acasă
          </Link>
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Mesagerie</p>
            <h1 className="text-lg font-semibold text-stone-900">Chat</h1>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/account"
              className="app-native-icon-button rounded-2xl p-2.5 text-stone-600 touch-manipulation"
              title="Cont"
              aria-label="Cont"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            <a
              href="/api/auth/signout"
              className="app-native-icon-button rounded-2xl p-2.5 text-stone-600 touch-manipulation"
              title="Ieșire"
              aria-label="Ieșire"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-12 sm:pb-0 sm:pt-4">
        <ChatClient initialMessages={initialMessages} currentUserId={session.user.id} />
      </main>
      <MobileQuickNav />
    </div>
  );
}
