import { NextResponse, type NextRequest } from "next/server";
import { isLocale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { homePath, isUnknownPublicPath } from "@/i18n/routes";

const SESSION_COOKIES = ["better-auth.session_token", "__Secure-better-auth.session_token"];

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

/**
 * Optimistic panel cookie check, plus HTTP 404 for unknown public section URLs.
 * Session validity and permissions are still decided in `src/auth/session.ts`.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAdminPath(pathname)) {
    if (isAdminSignIn(pathname)) return NextResponse.next();
    if (SESSION_COOKIES.some((name) => request.cookies.has(name))) return NextResponse.next();
    return NextResponse.redirect(new URL("/admin/giris", request.url));
  }

  if (isUnknownPublicPath(pathname)) {
    return unknownPublicResponse(pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/fr/:path*", "/en/:path*", "/tr/:path*"],
};
