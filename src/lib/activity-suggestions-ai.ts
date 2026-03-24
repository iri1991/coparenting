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
  disclaimer: string;
}

export interface ActivitySuggestionsContext {
  cityLabel: string;
  weather: CurrentWeatherSummary | null;
  children: { name: string; ageYears: number | null; allergiesNote?: string }[];
  /** Prenume copil (ex. Eva) — folosit în text, fără numele celuilalt părinte. */
  childFirstName: string;
  /** Zile (YYYY-MM-DD) în care utilizatorul are copilul singur (tata/mama = viewer), din calendar. */
  upcomingViewerOnlyDates: string[];
  /** Zile „împreună” (amândoi cu copilul) — pentru idei tip prânz la restaurant. */
  upcomingTogetherDates: string[];
  /** True dacă nu există încă zile cu copilul în intervalul următor în calendar. */
  noViewerDaysInWindow: boolean;
}

const SYSTEM = `Ești un asistent pentru un părinte din România. Primești: oraș, vreme orientativă, date despre copil (prenume, vârstă), liste de zile din calendar în care părintele care folosește aplicația are copilul (singur) și zile „împreună” (amândoi adulți cu copilul).

Scrie sugestii DOAR din perspectiva acestui părinte, pentru timpul lui cu copilul. Nu menționa „celălalt părinte”, custodie, „când nu ești tu”, „mama/tata” ca pereche sau orice comparație între adulți. Nu folosi fraze de tip „azi nu ești cu copilul”.

Dacă există zile „împreună” în listă, include 1–2 sugestii potrivite pentru amândoi adulții cu copilul (ex. prânz la restaurant, plimbare, activitate de familie). Pentru restul zilelor (doar părintele cu copilul), idei solo: ieșit, interior, educativ, mișcare.

Dacă nu există zile în calendar pentru viewer (noViewerDaysInWindow), propune totuși idei utile pentru următoarele ieșiri cu copilul în zonă, fără referințe la program sau la alt adult.

Răspunde DOAR cu JSON valid, fără markdown:
{
  "intro": "string — 1-2 propoziții, ton prietenos, doar „tu” și copilul (prenume), fără alți adulți",
  "suggestions": [ { "title": "...", "why": "...", "tip": "opțional" } ],
  "disclaimer": "string scurt: verifică orare și condiții; orientativ"
}

Reguli:
- 2–4 sugestii; titluri concrete (locuri din RO unde e cazul).
- Nu inventa ore exacte; sugerează verificare site/orar.
- Respectă alergii dacă apar la copil.
- Română corectă.`;

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
      "Intro: poți menționa vremea ca indiciu pentru ieșiri, nu ca „doar azi”. Fără câmp notRelevantNote — nu există.",
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
  const parsed = JSON.parse(raw) as ActivitySuggestionsAIResult & { notRelevantNote?: string };
  if (!parsed.intro || !Array.isArray(parsed.suggestions)) {
    throw new Error("Format răspuns invalid");
  }
  if (!parsed.disclaimer) {
    parsed.disclaimer =
      "Verifică orarele, biletele și condițiile meteo înainte de plecare. Sugestiile sunt orientative.";
  }
  return {
    intro: parsed.intro,
    suggestions: parsed.suggestions,
    disclaimer: parsed.disclaimer,
  };
}
