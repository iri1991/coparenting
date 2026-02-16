import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ObjectId } from "mongodb";
import { AppLogo } from "@/components/AppLogo";
import { ChatClient, type ChatMessage } from "@/components/ChatClient";

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

  const docs = await db
    .collection("messages")
    .find({ familyId })
    .sort({ createdAt: 1 })
    .limit(MAX_MESSAGES)
    .toArray();

  const initialMessages: ChatMessage[] = (docs as { _id: unknown; senderId: string; text: string; createdAt: Date }[]).map((d) => {
    const senderIndex = memberIds.indexOf(d.senderId);
    const senderLabel = senderIndex === 0 ? parent1Name : senderIndex === 1 ? parent2Name : "Membru";
    return {
      id: String(d._id),
      senderId: d.senderId,
      senderLabel,
      text: d.text,
      createdAt: d.createdAt.toISOString(),
    };
  });

  return (
    <div className="h-screen max-h-[100dvh] flex flex-col bg-stone-100 dark:bg-stone-950 overflow-hidden">
      <header className="shrink-0 z-40 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 safe-area-inset-top">
        <div className="flex items-center justify-between gap-2 px-4 py-3 max-w-2xl mx-auto">
          <AppLogo size={36} linkToHome className="h-9 w-9" />
          <h1 className="text-lg font-semibold text-stone-800 dark:text-stone-100">Chat</h1>
          <div className="flex items-center gap-1">
            <Link
              href="/account"
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 touch-manipulation"
              title="Cont"
              aria-label="Cont"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            <a
              href="/api/auth/signout"
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 touch-manipulation"
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

      <main className="flex-1 min-h-0 flex flex-col max-w-2xl mx-auto w-full">
        <ChatClient initialMessages={initialMessages} currentUserId={session.user.id} />
      </main>
    </div>
  );
}
