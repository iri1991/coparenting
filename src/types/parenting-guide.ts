/** Categoria unei reguli din ghidul parental comun. */
export type GuideCategory =
  | "sleep"
  | "screens"
  | "food"
  | "homework"
  | "behavior"
  | "health"
  | "values"
  | "other";

export const GUIDE_CATEGORY_ORDER: GuideCategory[] = [
  "sleep",
  "screens",
  "food",
  "homework",
  "behavior",
  "health",
  "values",
  "other",
];

export const GUIDE_CATEGORY_LABELS: Record<GuideCategory, string> = {
  sleep: "Somn",
  screens: "Ecrane",
  food: "Mâncare",
  homework: "Teme & școală",
  behavior: "Comportament & limite",
  health: "Sănătate",
  values: "Valori",
  other: "Altele",
};

export const GUIDE_CATEGORY_EMOJI: Record<GuideCategory, string> = {
  sleep: "🛏️",
  screens: "📱",
  food: "🍽️",
  homework: "📚",
  behavior: "🧭",
  health: "➕",
  values: "❤️",
  other: "✦",
};

/**
 * O regulă comună din „ghidul parental”: o înțelegere stabilă (somn, ecrane, limite,
 * valori) pe care ambii părinți o aplică în ambele case. Reduce inconsistența — al
 * doilea predictor al anxietății copilului după intensitatea conflictului.
 *
 * Spre deosebire de deciziile punctuale, ghidul este editabil de oricare părinte.
 */
export interface GuideEntry {
  id: string;
  category: GuideCategory;
  /** Regula, pe scurt (ex. „Somn la 21:00 în timpul săptămânii”). */
  title: string;
  /** Detaliu opțional (excepții, context). */
  detail?: string;
  createdByUserId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}
