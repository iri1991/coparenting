import { ObjectId } from "mongodb";
import type { getDb } from "@/lib/mongodb";

type Db = Awaited<ReturnType<typeof getDb>>;

export const CHAT_MAX_MESSAGES = 100;

export interface ChatMessageDto {
  id: string;
  senderId: string;
  senderLabel: string;
  text: string;
  createdAt: string;
  seenByOther: boolean;
  replyTo: { id: string; senderId: string; senderLabel: string; text: string } | null;
}

type MessageDoc = {
  _id: unknown;
  senderId: string;
  text: string;
  createdAt: Date;
  replyToId?: string;
  replyToSenderId?: string;
  replyToText?: string;
};

/**
 * Ultimele CHAT_MAX_MESSAGES mesaje ale familiei, în ordine cronologică.
 * Folosit atât de pagina /chat (randare inițială) cât și de GET /api/chat (polling),
 * ca ambele să întoarcă exact aceeași fereastră de mesaje.
 */
export async function loadChatMessages(
  db: Db,
  familyId: ObjectId,
  family: { memberIds?: string[]; parent1Name?: string; parent2Name?: string },
  currentUserId: string
): Promise<ChatMessageDto[]> {
  const memberIds = family.memberIds ?? [];
  const parent1Name = family.parent1Name?.trim() || "Părinte 1";
  const parent2Name = family.parent2Name?.trim() || "Părinte 2";
  const labelFor = (id: string) => {
    const i = memberIds.indexOf(id);
    return i === 0 ? parent1Name : i === 1 ? parent2Name : "Membru";
  };

  const otherMemberId = memberIds.find((id) => id !== currentUserId) ?? null;
  let otherLastReadAt: Date | null = null;
  if (otherMemberId && ObjectId.isValid(otherMemberId)) {
    const otherUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(otherMemberId) }, { projection: { chatLastReadAt: 1 } });
    otherLastReadAt = (otherUser as { chatLastReadAt?: Date } | null)?.chatLastReadAt ?? null;
  }

  // Cele mai noi mesaje (sort desc + limit), apoi inversate pentru afișare cronologică.
  // _id ca al doilea criteriu face ordinea stabilă la mesaje cu același createdAt.
  const docs = (await db
    .collection("messages")
    .find({ familyId })
    .sort({ createdAt: -1, _id: -1 })
    .limit(CHAT_MAX_MESSAGES)
    .toArray()) as MessageDoc[];

  return docs.reverse().map((d) => {
    let replyTo: ChatMessageDto["replyTo"] = null;
    if (d.replyToId && d.replyToSenderId && typeof d.replyToText === "string") {
      replyTo = { id: d.replyToId, senderId: d.replyToSenderId, senderLabel: labelFor(d.replyToSenderId), text: d.replyToText };
    }
    return {
      id: String(d._id),
      senderId: d.senderId,
      senderLabel: labelFor(d.senderId),
      text: d.text,
      createdAt: d.createdAt.toISOString(),
      seenByOther: d.senderId === currentUserId && !!otherLastReadAt && d.createdAt.getTime() <= otherLastReadAt.getTime(),
      replyTo,
    };
  });
}
