import type { ParentType } from "./events";

/** Categoria deciziei comune. */
export type DecisionCategory =
  | "education"
  | "medical"
  | "activities"
  | "financial"
  | "travel"
  | "other";

export const DECISION_CATEGORY_ORDER: DecisionCategory[] = [
  "education",
  "medical",
  "activities",
  "financial",
  "travel",
  "other",
];

export const DECISION_CATEGORY_LABELS: Record<DecisionCategory, string> = {
  education: "Educație",
  medical: "Medical",
  activities: "Activități",
  financial: "Financiar",
  travel: "Călătorii",
  other: "Altele",
};

/** Starea unei decizii. */
export type DecisionStatus = "pending" | "approved" | "declined";

/**
 * O decizie majoră legată de copil, propusă de un părinte și aprobată/discutată de celălalt.
 * Documentează acordul bilateral și reduce litigiile și sentimentul de excludere.
 */
export interface JointDecision {
  id: string;
  proposedByUserId: string;
  proposedByParentType: ParentType; // "tata" | "mama"
  title: string;
  category: DecisionCategory;
  description?: string;
  status: DecisionStatus;
  /** Cine a răspuns (aprobat/declinat). */
  decidedByUserId?: string;
  decidedAt?: string;
  /** Notă la răspuns (ex. de ce vrea să discute). */
  responseNote?: string;
  createdAt: string;
  updatedAt: string;
}
