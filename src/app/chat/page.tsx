import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { ChatClient, type ChatMessage } from "@/components/ChatClient";
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

  const memberIds = family.memberIds ?? [];
  const otherIndex = memberIds.findIndex((id) => id !== session.user.id);
  const familyNames = family as { parent1Name?: string; parent2Name?: string };
  const partnerName =
    (otherIndex === 0 ? familyNames.parent1Name?.trim() : otherIndex === 1 ? familyNames.parent2Name?.trim() : null) ||
    "Celălalt părinte";

  return (
    <>
      <ChatClient initialMessages={initialMessages} currentUserId={session.user.id} partnerName={partnerName} />
      <NotificationActivationDialog currentUserId={session.user.id} />
    </>
  );
}
