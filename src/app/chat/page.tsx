import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ObjectId } from "mongodb";
import { ChatClient, type ChatMessage } from "@/components/ChatClient";
import { MobileQuickNav } from "@/components/MobileQuickNav";
import { MobileAppTopBar } from "@/components/MobileAppTopBar";
import { NotificationActivationDialog } from "@/components/NotificationActivationDialog";
import { loadChatMessages } from "@/lib/chat";
import { flushDueScheduledMessages } from "@/lib/scheduled-messages";

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

  // Ca în GET /api/chat: livrează mesajele programate scadente, apoi citește aceeași fereastră
  // (cele mai noi mesaje). Altfel refresh-ul arăta alte mesaje decât polling-ul.
  await flushDueScheduledMessages(db, familyId).catch((err) =>
    console.error("[chat] flush scheduled failed", err)
  );
  const initialMessages: ChatMessage[] = await loadChatMessages(
    db,
    familyId,
    family as { memberIds?: string[]; parent1Name?: string; parent2Name?: string },
    session.user.id
  );

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
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- signout needs a full navigation to the NextAuth endpoint, not a client-side Link */}
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
      <NotificationActivationDialog currentUserId={session.user.id} />
    </div>
  );
}
