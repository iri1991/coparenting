import OpenAI from "openai";
import type { CurrentWeatherSummary } from "@/lib/weather-open-meteo";

export interface ActivitySuggestionItem {
  title: string;
  why: string;
  tip?: string;
}

export interface ActivitySuggestionsAIResult {
  intro: string;
  suggestions: ActivitySuggestionItem[];
  /** Dacă utilizatorul curent nu e cel cu copilul azi, după calendar. */
  notRelevantNote?: string;
  disclaimer: string;
}

export interface ActivitySuggestionsContext {
  cityLabel: string;
  weather: CurrentWeatherSummary | null;
  children: { name: string; ageYears: number | null; allergiesNote?: string }[];
  parent1Name: string;
  parent2Name: string;
  childGenericName: string;
  todayParent: "tata" | "mama" | "together" | null;
  viewerParentType: "tata" | "mama" | null;
  viewerIsPrimaryCaretakerToday: boolean;
  calendarMissingToday: boolean;
}

const SYSTEM = `Ești un asistent pentru părinți din România. Primești context JSON despre vreme, oraș, copii (vârste), program (cine are copilul azi) și nume de familie.
Generează sugestii practice de activități (interior/exterior), potrivite vârstei. Dacă la un copil există „allergiesNote”, evită activități care le încalcă (ex. alimentație). Răspunde DOAR cu JSON valid, fără markdown, cu structura:
{
  "intro": "string — 1-2 propoziții, ton prietenos, română",
  "suggestions": [ { "title": "...", "why": "...", "tip": "opțional" } ],
  "notRelevantNote": "opțional — dacă utilizatorul NU e cel cu copilul azi: scurt, empatic, explică că azi celălalt părinte e cu copilul; fără a exclude idei pentru viitor",
  "disclaimer": "string scurt: orele evenimentelor și disponibilitatea trebuie verificate; exemplele sunt orientative"
}
Reguli:
- 2–4 sugestii în "suggestions"; titluri concrete (ex. locuri tipice din RO: Therme, grădini zoologice, teatru pentru copii, muzee, parcuri).
- Dacă nu știi program exact (teatru, spectacol), sugerează tipul de activitate și spune să verifice bilete/orar pe site-uri oficiale — nu inventa ore exacte dacă nu ești sigur; preferă formulări „verifică reprezentațiile de astăzi” în loc de ore fictive.
- Respectă alergii dacă apar în context (câmp separat eventual); dacă nu sunt, nu menționa.
- Ton: cald, scurt, util. Română corectă.`;

export async function generateActivitySuggestions(
  ctx: ActivitySuggestionsContext
): Promise<ActivitySuggestionsAIResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key?.trim()) {
    throw new Error("OPENAI_API_KEY lipsă");
  }
  const openai = new OpenAI({ apiKey: key });
  const userPayload = {
    ...ctx,
    note:
      "Dacă viewerIsPrimaryCaretakerToday e false și todayParent e setat, include notRelevantNote. Dacă calendarMissingToday e true, menționează în intro că nu există încă zi planificată pentru astăzi în calendar.",
  };

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: JSON.stringify(userPayload) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.75,
    max_tokens: 1200,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Răspuns gol de la model");
  }
  const parsed = JSON.parse(raw) as ActivitySuggestionsAIResult;
  if (!parsed.intro || !Array.isArray(parsed.suggestions)) {
    throw new Error("Format răspuns invalid");
  }
  if (!parsed.disclaimer) {
    parsed.disclaimer =
      "Verifică orarele, biletele și condițiile meteo înainte de plecare. Sugestiile sunt orientative.";
  }
  return parsed;
}
