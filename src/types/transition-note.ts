import type { ParentType } from "./events";

/** Starea emoțională a copilului la predare. */
export type ChildMood = "happy" | "calm" | "tired" | "upset" | "sick";

export const CHILD_MOOD_EMOJI: Record<ChildMood, string> = {
  happy: "😊",
  calm: "😌",
  tired: "😴",
  upset: "😟",
  sick: "🤒",
};

export const CHILD_MOOD_ORDER: ChildMood[] = ["happy", "calm", "tired", "upset", "sick"];

/** Un obiect care fie călătorește cu copilul, fie rămâne la casa curentă. */
export interface TransitionItem {
  label: string;
  /** true = pleacă cu copilul; false = rămâne la părintele care predă. */
  traveling: boolean;
}

/**
 * Nota de predare („handover note”): completată de părintele care predă copilul,
 * citită de părintele care îl preia. Reduce conflictul la tranziție și oferă
 * continuitate (somn, mâncare, medicație, teme, stare emoțională, obiecte).
 */
export interface TransitionNote {
  id: string;
  fromUserId: string;
  /** Părintele care a scris nota (cel care predă). */
  fromParentType: ParentType; // "tata" | "mama"
  /** Părintele care preia copilul (destinatarul notei). */
  toParentType: ParentType; // "tata" | "mama"
  /** Data predării (YYYY-MM-DD). */
  date: string;
  mood?: ChildMood;
  moodNote?: string;
  /** Cum a dormit. */
  sleep?: string;
  /** Ce și cum a mâncat. */
  food?: string;
  /** Teme / școală / activități de continuat. */
  activities?: string;
  /** Stare medicație: ce s-a dat, ce urmează. */
  medication?: string;
  /** Notă generală liberă. */
  generalNote?: string;
  items: TransitionItem[];
  createdAt: string;
  updatedAt: string;
}
