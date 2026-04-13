export { ro } from "./ro";
export { en } from "./en";
export type { Translations } from "./ro";

export type Lang = "ro" | "en";

export const LANG_STORAGE_KEY = "hs-lang";
export const SUPPORTED_LANGS: Lang[] = ["ro", "en"];
export const DEFAULT_LANG: Lang = "ro";

export function getLangSafe(raw: string | null | undefined): Lang {
  if (raw === "en") return "en";
  return "ro";
}
