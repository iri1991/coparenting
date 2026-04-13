import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LANGS = ["en", "ro"] as const;
const LANG_COOKIE = "hs-lang";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * URL-based language routing for public pages.
 *
 * /en        → rewrite to /   + set hs-lang=en cookie
 * /en/blog/… → rewrite to /blog/… + set hs-lang=en cookie
 * /ro/…      → rewrite to /… + set hs-lang=ro cookie
 * Everything else passes through unchanged.
 *
 * The app pages (/account, /config, etc.) also work with the
 * /en prefix if needed, but don't require it.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-hs-pathname", pathname);

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
