import type { ParentType } from "./events";

/** Categoria unei cheltuieli comune cu copilul. */
export type ExpenseCategory =
  | "school"
  | "medical"
  | "clothing"
  | "activities"
  | "food"
  | "other";

export const EXPENSE_CATEGORY_ORDER: ExpenseCategory[] = [
  "school",
  "medical",
  "clothing",
  "activities",
  "food",
  "other",
];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  school: "Școală",
  medical: "Medical",
  clothing: "Haine",
  activities: "Activități",
  food: "Mâncare",
  other: "Altele",
};

export const EXPENSE_CATEGORY_EMOJI: Record<ExpenseCategory, string> = {
  school: "🎒",
  medical: "➕",
  clothing: "👕",
  activities: "⚽",
  food: "🍎",
  other: "🧾",
};

/**
 * O cheltuială comună cu copilul, plătită de un părinte și împărțită cu celălalt.
 * Cheltuielile sunt a doua sursă de conflict după program — un registru transparent
 * (cine a plătit, cât se datorează, sold) elimină ambiguitatea.
 */
export interface SharedExpense {
  id: string;
  title: string;
  category: ExpenseCategory;
  /** Sumă în bani (integer), ca să evităm erorile de virgulă mobilă. */
  amountBani: number;
  paidByUserId: string;
  paidByParentType: ParentType; // "tata" | "mama"
  date: string; // YYYY-MM-DD
  /** Procentul pe care îl datorează celălalt părinte (0–100). 50 = împărțit egal. */
  splitPercent: number;
  note?: string;
  settled: boolean;
  settledAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Soldul net din perspectiva lui „tata” (bani): pozitiv = mama îi datorează lui tata. */
export interface ExpenseBalance {
  tataNetBani: number;
}

/** Formatează bani (integer) ca „123,45 lei”. */
export function formatBani(bani: number): string {
  const lei = bani / 100;
  return `${lei.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lei`;
}

/** Cât datorează celălalt părinte pentru o cheltuială (bani, rotunjit). */
export function owedBani(amountBani: number, splitPercent: number): number {
  return Math.round((amountBani * splitPercent) / 100);
}
