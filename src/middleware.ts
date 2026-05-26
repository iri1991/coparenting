import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LANGS = ["en", "ro"] as const;
const LANG_COOKIE = "hs-lang";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * NextAuth JWT cookie names (dev vs. production HTTPS).
 * We check for either so the redirect works in both environments.
 */
const AUTH_COOKIES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
] as const;

/**
 * Public marketing paths where an authenticated user should be
 * redirected to /app (they're already logged in, no point seeing the landing).
 */
const LANDING_PATHS = new Set(["/", "/en", "/ro"]);

/**
 * Returns true if the request carries a valid-looking NextAuth session cookie.
 * We only check presence — the actual JWT signature is verified by the auth() call
 * inside /app/app/page.tsx. False positives (expired / tampered tokens) are
 * harmless: /app will redirect them back to /login.
 */
function hasSessionCookie(request: NextRequest): boolean {
  return AUTH_COOKIES.some((name) => request.cookies.has(name));
}

/**
 * URL-based language routing for public pages.
 *
 * /en        → rewrite to /   + set hs-lang=en cookie
 * /en/blog/… → rewrite to /blog/… + set hs-lang=en cookie
 * /ro/…      → rewrite to /… + set hs-lang=ro cookie
 *
 * Additionally:
 * Authenticated users visiting the landing page (/, /en, /ro) are
 * redirected to /app so they land directly in the product.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-hs-pathname", pathname);

  // ── Auth redirect: landing → /app for logged-in users ─────────────────────
  if (LANDING_PATHS.has(pathname) && hasSessionCookie(request)) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    // Preserve plan query param if present (e.g. /?plan=pro)
    const plan = request.nextUrl.searchParams.get("plan");
    if (plan === "pro" || plan === "family") {
      url.searchParams.set("plan", plan);
    } else {
      url.searchParams.delete("plan");
    }
    return NextResponse.redirect(url);
  }

  // ── Language routing ────────────────────────────────────────────────────────
  const matchedLang = SUPPORTED_LANGS.find(
    (lang) => pathname === `/${lang}` || pathname.startsWith(`/${lang}/`)
  );

  if (matchedLang) {
    requestHeaders.set("x-hs-path-lang", matchedLang);

    const newPathname =
      pathname === `/${matchedLang}` ? "/" : pathname.slice(matchedLang.length + 1);

    const url = request.nextUrl.clone();
    url.pathname = newPathname;

    const response = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    response.cookies.set(LANG_COOKIE, matchedLang, {
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
    return response;
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /api/* (API routes)
     * - /_next/* (Next.js internals)
     * - Static files (images, fonts, manifest, sw, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|logo\\.png|manifest\\.json|sw\\.js|workbox|.*\\.svg$|.*\\.png$|.*\\.jpg$|.*\\.ico$).*)",
  ],
};
