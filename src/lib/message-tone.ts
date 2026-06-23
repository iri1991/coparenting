/**
 * Heuristică simplă (fără AI, offline) pentru a detecta un mesaj potențial tensionat
 * înainte de trimitere. Scopul nu e cenzura, ci un moment de reflecție: limbajul
 * absolut și acuzator escaladează conflictul în co-parenting (Gottman).
 */

export interface MessageToneResult {
  tense: boolean;
  /** Motive scurte, pentru a explica de ce s-a aprins semnalul. */
  reasons: string[];
}

/** Cuvinte/expresii absolute — generalizări care escaladează. */
const ABSOLUTES = [
  "mereu",
  "niciodată",
  "întotdeauna",
  "de fiecare dată",
  "tot timpul",
  "always",
  "never",
];

/** Deschideri acuzatoare („tu-mesaje”). */
const ACCUSATORY = [
  "de ce nu ai",
  "de ce nu",
  "tu ai",
  "tu nu",
  "din cauza ta",
  "vina ta",
  "e vina ta",
  "tu mereu",
  "tu iar",
  "iar ai",
  "cum ai putut",
  "nu ești în stare",
  "your fault",
  "you always",
  "you never",
];

function countExclamation(text: string): number {
  return (text.match(/[!?]{2,}|!/g) ?? []).length;
}

function hasShouting(text: string): boolean {
  // Cuvânt de 4+ litere, integral majuscule (ex. „SERIOS”, „ACUM”).
  const words = text.split(/\s+/);
  return words.some((w) => {
    const letters = w.replace(/[^A-Za-zĂÂÎȘȚăâîșț]/g, "");
    return letters.length >= 4 && letters === letters.toUpperCase() && /[A-ZĂÂÎȘȚ]/.test(letters);
  });
}

export function analyzeMessageTone(raw: string): MessageToneResult {
  const text = (raw ?? "").trim();
  if (text.length < 3) return { tense: false, reasons: [] };
  const lower = text.toLowerCase();
  const reasons: string[] = [];

  if (ACCUSATORY.some((p) => lower.includes(p))) {
    reasons.push("formulare care poate suna acuzator");
  }
  if (ABSOLUTES.some((p) => lower.includes(p))) {
    reasons.push("generalizare („mereu”/„niciodată”)");
  }
  if (countExclamation(text) >= 2) {
    reasons.push("ton ridicat (semne de exclamare)");
  }
  if (hasShouting(text)) {
    reasons.push("cuvinte cu majuscule");
  }

  return { tense: reasons.length > 0, reasons };
}
