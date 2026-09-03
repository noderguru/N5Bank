import { NextResponse, type NextRequest } from "next/server";
import { getRoleDashboard } from "./lib/auth/roles";
import { SESSION_COOKIE_NAME, verifySession } from "./lib/auth/token";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "./i18n/locales";

export { LOCALES, DEFAULT_LOCALE } from "./i18n/locales";
export type AppLocale = Locale;

const ROLE_PROTECTED_PREFIXES = [
  { prefix: "/admin", allowedRoles: ["MANAGER"] },
  { prefix: "/seller", allowedRoles: ["SELLER"] },
  { prefix: "/buyer", allowedRoles: ["BUYER"] },
] as const;

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  const hasLocalePrefix = LOCALES.includes(firstSegment as AppLocale);

  // Read saved locale cookie if present
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value as AppLocale | undefined;
  const preferredLocale =
    cookieLocale && LOCALES.includes(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  // 1. If URL has no locale prefix, redirect to /[locale]/...
  if (!hasLocalePrefix) {
    const targetPath = pathname === "/" ? "" : pathname;
    const redirectUrl = new URL(`/${preferredLocale}${targetPath}${search}`, request.url);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set("NEXT_LOCALE", preferredLocale, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
    return response;
  }

  const locale = firstSegment as AppLocale;
  const restSegments = segments.slice(1);
  const restPath = "/" + restSegments.join("/");

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  // 2. Check role-protected routes
  for (const { prefix, allowedRoles } of ROLE_PROTECTED_PREFIXES) {
    if (restPath === prefix || restPath.startsWith(`${prefix}/`)) {
      if (!session) {
        const loginUrl = new URL(`/${locale}/login`, request.url);
        loginUrl.searchParams.set("returnTo", `${pathname}${search}`);
        return NextResponse.redirect(loginUrl);
      }

      const hasAllowedRole = (allowedRoles as readonly string[]).includes(session.role);
      if (!hasAllowedRole) {
        // Rewrite to 403 page with explicit 403 status code
        const forbiddenUrl = new URL(`/${locale}/forbidden`, request.url);
        return NextResponse.rewrite(forbiddenUrl, { status: 403 });
      }
    }
  }

  // 3. Any authenticated role can access /inbox
  if (restPath === "/inbox" || restPath.startsWith("/inbox/")) {
    if (!session) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("returnTo", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. If already authenticated and accessing /login or /register, redirect to role dashboard
  if (session && (restPath === "/login" || restPath === "/register")) {
    const target = getRoleDashboard(session.role);
    return NextResponse.redirect(new URL(`/${locale}${target}`, request.url));
  }

  const response = NextResponse.next();
  response.headers.set("x-locale", locale);
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with file extension (e.g. .svg, .png)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
