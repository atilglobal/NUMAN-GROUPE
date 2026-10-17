import { NextResponse, type NextRequest } from "next/server";
import { isLocale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { homePath, isUnknownPublicPath } from "@/i18n/routes";

const SESSION_COOKIES = ["better-auth.session_token", "__Secure-better-auth.session_token"];
const RESERVED = new Set(["admin", "setup", "media", "en", "tr", "_next", "api"]);

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isAdminSignIn(pathname: string): boolean {
  return pathname === "/admin/giris" || pathname.startsWith("/admin/giris/");
}

function unknownPublicResponse(pathname: string): NextResponse {
  const localeSegment = pathname.split("/").filter(Boolean)[0];
  const locale = localeSegment && isLocale(localeSegment) ? localeSegment : "fr";
  const dict = dictionaries[locale];
  const home = homePath(locale);
  const html = `<!DOCTYPE html><html lang="${locale}"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>${dict.notFound.title} | NUMAN GROUPE</title></head><body><main><p>${dict.notFound.eyebrow}</p><h1>${dict.notFound.title}</h1><p>${dict.notFound.body}</p><p><a href="${home}">${dict.notFound.backHome}</a></p></main></body></html>`;
  return new NextResponse(html, {
    status: 404,
    headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex, nofollow" },
  });
}

function rewriteToFrench(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/fr" : `/fr${pathname}`;
  return NextResponse.rewrite(url);
}

/**
 * Optimistic panel cookie check, French unprefixed URLs, and HTTP 404 for
 * unknown public section URLs. Session validity is still decided in session.ts.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAdminPath(pathname)) {
    if (isAdminSignIn(pathname)) return NextResponse.next();
    if (SESSION_COOKIES.some((name) => request.cookies.has(name))) return NextResponse.next();
    return NextResponse.redirect(new URL("/admin/giris", request.url));
  }

  if (pathname === "/fr" || pathname.startsWith("/fr/")) {
    const nextPath = pathname === "/fr" ? "/" : pathname.slice(3) || "/";
    const url = request.nextUrl.clone();
    url.pathname = nextPath;
    return NextResponse.redirect(url, 308);
  }

  if (isUnknownPublicPath(pathname)) {
    return unknownPublicResponse(pathname);
  }

  const first = pathname.split("/").filter(Boolean)[0];
  if (!first) return rewriteToFrench(request, "/");
  if (!RESERVED.has(first)) return rewriteToFrench(request, pathname);

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin",
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|brand/).*)",
  ],
};
