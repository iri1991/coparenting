/** O componentă a scorului de co-parenting (0–100). */
export interface ScoreComponent {
  key: "schedule" | "communication" | "decisions" | "expenses";
  /** Scor 0–100. */
  score: number;
  /** Detaliu scurt afișat sub bară (ex. „11 din 14 zile planificate”). */
  detail: string;
}

/** Rezultatul agregat al scorului de co-parenting. */
export interface CoparentingScore {
  /** Scor general 0–100. */
  overall: number;
  components: ScoreComponent[];
  /** Câte semnale au avut date relevante (restul sunt neutre). */
  hasData: boolean;
}

/** Eticheta calitativă pentru un scor 0–100. */
export function scoreLabel(score: number): string {
  if (score >= 85) return "foarte bun";
  if (score >= 65) return "bun";
  if (score >= 40) return "de întărit";
  return "de îmbunătățit";
}

export const SCORE_COMPONENT_LABELS: Record<ScoreComponent["key"], string> = {
  schedule: "Predictibilitate program",
  communication: "Comunicare",
  decisions: "Decizii comune",
  expenses: "Cheltuieli decontate",
};
