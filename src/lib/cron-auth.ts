import { timingSafeEqual } from "crypto";

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/**
 * Autorizează apelurile către /api/cron/*.
 * Doar CRON_SECRET: Vercel Cron trimite automat `Authorization: Bearer <CRON_SECRET>` când
 * variabila e setată. Header-ul `x-vercel-cron` NU e de încredere (oricine îl poate trimite).
 * `?secret=` rămâne acceptat pentru cron-uri externe care nu pot seta header-e.
 */
export function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get("authorization") ?? "";
  if (safeEqual(authHeader, `Bearer ${secret}`)) return true;
  const querySecret = new URL(request.url).searchParams.get("secret") ?? "";
  return querySecret !== "" && safeEqual(querySecret, secret);
}
