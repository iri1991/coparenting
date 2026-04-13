import { headers } from "next/headers";

/** Set by middleware on every matched request (public URL path, e.g. /en/blog/foo). */
export const HS_PATHNAME_HEADER = "x-hs-pathname";
/** Set when URL uses /en or /ro prefix (rewrite). */
export const HS_PATH_LANG_HEADER = "x-hs-path-lang";

export type SharePathLang = "en" | "ro";

export async function getSharePathMeta(): Promise<{ pathname: string; lang: SharePathLang }> {
  const h = await headers();
  const pathname = h.get(HS_PATHNAME_HEADER) || "/";
  const lang: SharePathLang = h.get(HS_PATH_LANG_HEADER) === "en" ? "en" : "ro";
  return { pathname, lang };
}

/** Absolute URL for og:url (siteUrl has no trailing slash). */
export function ogPublicUrl(siteUrl: string, pathname: string): string {
  if (pathname === "/") return siteUrl;
  return `${siteUrl}${pathname}`;
}
