/** Starea emoțională a copilului pe o scală de valență cu 5 trepte. */
export type MoodLevel = "great" | "good" | "neutral" | "down" | "sad";

export const MOOD_LEVEL_ORDER: MoodLevel[] = ["great", "good", "neutral", "down", "sad"];

export const MOOD_LEVEL_EMOJI: Record<MoodLevel, string> = {
  great: "😄",
  good: "🙂",
  neutral: "😐",
  down: "😟",
  sad: "😢",
};

export const MOOD_LEVEL_LABELS: Record<MoodLevel, string> = {
  great: "Foarte bine",
  good: "Bine",
  neutral: "Așa și așa",
  down: "Tristuț",
  sad: "Trist",
};

/** Scor numeric (pentru tendință): great = 5 … sad = 1. */
export const MOOD_LEVEL_SCORE: Record<MoodLevel, number> = {
  great: 5,
  good: 4,
  neutral: 3,
  down: 2,
  sad: 1,
};

/**
 * O înregistrare a stării emoționale a copilului, vizibilă ambilor părinți.
 * Oferă copilului un spațiu de exprimare (mai ales după tranziții) — factor
 * cu impact major pe termen lung asupra adaptării la separare (Wallerstein).
 */
export interface ChildMoodEntry {
  id: string;
  /** Copilul (dacă există mai mulți). */
  childId?: string;
  date: string; // YYYY-MM-DD
  mood: MoodLevel;
  /** Ce a spus / simțit copilul (opțional). */
  note?: string;
  loggedByUserId: string;
  loggedByParentType: "tata" | "mama";
  createdAt: string;
  updatedAt: string;
}
