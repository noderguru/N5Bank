import { NextResponse, type NextRequest } from "next/server";
import { getRoleDashboard } from "./lib/auth/roles";
import { SESSION_COOKIE_NAME, verifySession } from "./lib/auth/token";

const ROLE_PROTECTED_PREFIXES = [
  { prefix: "/admin", allowedRoles: ["MANAGER"] },
  { prefix: "/seller", allowedRoles: ["SELLER"] },
  { prefix: "/buyer", allowedRoles: ["BUYER"] },
] as const;

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  // Lay the foundation for locale resolution
  const locale = request.cookies.get("NEXT_LOCALE")?.value || "en";

  // Check role-protected routes
  for (const { prefix, allowedRoles } of ROLE_PROTECTED_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      if (!session) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("returnTo", `${pathname}${search}`);
        return NextResponse.redirect(loginUrl);
      }

      const hasAllowedRole = (allowedRoles as readonly string[]).includes(session.role);
      if (!hasAllowedRole) {
        // Rewrite to 403 page with explicit 403 status code
        const forbiddenUrl = new URL("/forbidden", request.url);
        return NextResponse.rewrite(forbiddenUrl, { status: 403 });
      }
    }
  }

  // Any authenticated role can access /inbox
  if (pathname === "/inbox" || pathname.startsWith("/inbox/")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnTo", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already authenticated and accessing /login or /register, redirect to role home
  if (session && (pathname === "/login" || pathname === "/register")) {
    const target = getRoleDashboard(session.role);
    return NextResponse.redirect(new URL(target, request.url));
  }

  const response = NextResponse.next();
  response.headers.set("x-locale", locale);
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
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
