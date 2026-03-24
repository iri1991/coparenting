/** Cheie stabilă pentru același titlu de sugestie (accept/refuz pe zi). */
export function normalizeSuggestionTitleKey(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 500);
}
