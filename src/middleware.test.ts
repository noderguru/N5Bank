import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const tokenMock = vi.hoisted(() => ({
  verifySession: vi.fn(),
  SESSION_COOKIE_NAME: "n5deal_session",
}));

vi.mock("./lib/auth/token", () => ({
  verifySession: tokenMock.verifySession,
  SESSION_COOKIE_NAME: tokenMock.SESSION_COOKIE_NAME,
}));

import { middleware } from "./middleware";

function createRequest(
  url: string,
  options?: { sessionToken?: string; localeCookie?: string }
): NextRequest {
  const req = new NextRequest(new URL(url, "http://localhost:3000"));
  if (options?.sessionToken) {
    req.cookies.set("n5deal_session", options.sessionToken);
  }
  if (options?.localeCookie) {
    req.cookies.set("NEXT_LOCALE", options.localeCookie);
  }
  return req;
}

describe("Next.js Middleware route guards & i18n prefix resolution", () => {
  beforeEach(() => {
    tokenMock.verifySession.mockReset();
  });

  it("redirects root / to /en by default", async () => {
    const req = createRequest("http://localhost:3000/");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/en");
  });

  it("redirects root / to cookie locale when NEXT_LOCALE is set", async () => {
    const req = createRequest("http://localhost:3000/", { localeCookie: "uk" });
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/uk");
  });

  it("redirects non-prefixed routes to /[locale]/route preserving query string", async () => {
    const req = createRequest("http://localhost:3000/assets?country=GB&licence=PAYMENT");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/en/assets?country=GB&licence=PAYMENT"
    );
  });

  it("redirects unauthenticated direct visit on /en/admin/users to /en/login with returnTo parameter", async () => {
    const req = createRequest("http://localhost:3000/en/admin/users");
    tokenMock.verifySession.mockResolvedValue(null);

    const res = await middleware(req);
    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("/en/login");
    expect(location).toContain("returnTo=%2Fen%2Fadmin%2Fusers");
  });

  it("serves 403 forbidden when a BUYER navigates to /en/seller/assets", async () => {
    const req = createRequest("http://localhost:3000/en/seller/assets", {
      sessionToken: "valid_buyer_token",
    });
    tokenMock.verifySession.mockResolvedValue({ userId: "usr_buyer", role: "BUYER" });

    const res = await middleware(req);
    expect(res.status).toBe(403);
    const rewriteHeader = res.headers.get("x-middleware-rewrite");
    expect(rewriteHeader).toContain("/en/forbidden");
  });

  it("allows MANAGER to access /en/admin/users with locale header", async () => {
    const req = createRequest("http://localhost:3000/en/admin/users", {
      sessionToken: "valid_manager_token",
    });
    tokenMock.verifySession.mockResolvedValue({ userId: "usr_mgr", role: "MANAGER" });

    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("x-locale")).toBe("en");
  });

  it("redirects authenticated user away from /en/login to their role dashboard", async () => {
    const req = createRequest("http://localhost:3000/en/login", {
      sessionToken: "valid_seller_token",
    });
    tokenMock.verifySession.mockResolvedValue({ userId: "usr_seller", role: "SELLER" });

    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/en/seller/assets");
  });

  it("allows public visitors on /en without redirecting", async () => {
    const req = createRequest("http://localhost:3000/en");
    tokenMock.verifySession.mockResolvedValue(null);

    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("x-locale")).toBe("en");
  });
});
