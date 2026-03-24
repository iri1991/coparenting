import OpenAI from "openai";
import type { PlaceTextSearchHint } from "@/lib/google-places-text-search";

export interface ActivityIdeaDetailAIResult {
  /** Unde are loc / zonă — poate integra adresa din Google Places dacă e furnizată. */
  where: string;
  /** Când e potrivit (perioadă, sezon, fără ore inventate). */
  when: string;
  materials: string[];
  /** Pași scurți, numerotați sau cu linii noi. */
  process: string;
  /** Reminder verificare surse oficiale / Maps. */
  verifyNote: string;
}

const SYSTEM = `Ești ghid pentru părinți din România. Primești titlul unei activități cu copilul, orașul și opțional date din Google Places (nume, adresă).
Răspunde DOAR cu JSON valid, fără markdown, structură:
{
  "where": "string — unde se întâmplă sau zonă; dacă există adresă Google, integreaz-o scurt",
  "when": "string — când e potrivit (moment al zilei, sezon, durată orientativă); NU inventa ore exacte de spectacol/program",
  "materials": ["string", ...] — ce e util să ai la tine (gol [] dacă nu e cazul),
  "process": "string — 4-8 pași scurți, numerotați, practici",
  "verifyNote": "string scurt — verifică pe site oficial / Google Maps pentru orar și bilete"
}
Română corectă, ton cald, concis.`;

export async function generateActivityIdeaDetail(input: {
  title: string;
  cityLabel: string;
  childAgeYears?: number | null;
  placeHint?: PlaceTextSearchHint | null;
}): Promise<ActivityIdeaDetailAIResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key?.trim()) {
    throw new Error("OPENAI_API_KEY lipsă");
  }
  const openai = new OpenAI({ apiKey: key });
  const payload = {
    title: input.title,
    cityLabel: input.cityLabel,
    childAgeYears: input.childAgeYears ?? null,
    placeHint: input.placeHint ?? null,
  };

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: JSON.stringify(payload) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.55,
    max_tokens: 900,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Răspuns gol de la model");
  const parsed = JSON.parse(raw) as ActivityIdeaDetailAIResult;
  if (!parsed.where || !parsed.when || !Array.isArray(parsed.materials) || !parsed.process) {
    throw new Error("Format răspuns invalid");
  }
  if (!parsed.verifyNote) {
    parsed.verifyNote = "Verifică orarul și condițiile pe site-uri oficiale sau în Google Maps.";
  }
  return parsed;
}
