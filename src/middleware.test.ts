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

function createRequest(url: string, cookieValue?: string): NextRequest {
  const req = new NextRequest(new URL(url, "http://localhost:3000"));
  if (cookieValue) {
    req.cookies.set("n5deal_session", cookieValue);
  }
  return req;
}

describe("Next.js Middleware route guards", () => {
  beforeEach(() => {
    tokenMock.verifySession.mockReset();
  });

  it("redirects unauthenticated direct visit on /admin/users to /login with returnTo parameter", async () => {
    // Acceptance criterion: "Прямой заход на /admin/users без сессии уводит на логин и возвращает обратно после входа"
    const req = createRequest("http://localhost:3000/admin/users");
    tokenMock.verifySession.mockResolvedValue(null);

    const res = await middleware(req);
    expect(res.status).toBe(307); // NextResponse.redirect default
    const location = res.headers.get("location");
    expect(location).toContain("/login");
    expect(location).toContain("returnTo=%2Fadmin%2Fusers");
  });

  it("serves 403 forbidden when a BUYER navigates to /seller/assets", async () => {
    // Acceptance criterion: "Байер на /seller/assets получает внятную 403, а не краш"
    const req = createRequest("http://localhost:3000/seller/assets", "valid_buyer_token");
    tokenMock.verifySession.mockResolvedValue({ userId: "usr_buyer", role: "BUYER" });

    const res = await middleware(req);
    expect(res.status).toBe(403);
    const rewriteHeader = res.headers.get("x-middleware-rewrite");
    expect(rewriteHeader).toContain("/forbidden");
  });

  it("serves 403 forbidden when a SELLER navigates to /admin/users", async () => {
    const req = createRequest("http://localhost:3000/admin/users", "valid_seller_token");
    tokenMock.verifySession.mockResolvedValue({ userId: "usr_seller", role: "SELLER" });

    const res = await middleware(req);
    expect(res.status).toBe(403);
  });

  it("allows MANAGER to access /admin/users", async () => {
    const req = createRequest("http://localhost:3000/admin/users", "valid_manager_token");
    tokenMock.verifySession.mockResolvedValue({ userId: "usr_mgr", role: "MANAGER" });

    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("x-locale")).toBe("en");
  });

  it("allows SELLER to access /seller/assets", async () => {
    const req = createRequest("http://localhost:3000/seller/assets", "valid_seller_token");
    tokenMock.verifySession.mockResolvedValue({ userId: "usr_seller", role: "SELLER" });

    const res = await middleware(req);
    expect(res.status).toBe(200);
  });

  it("redirects authenticated user away from /login to their role dashboard", async () => {
    const req = createRequest("http://localhost:3000/login", "valid_seller_token");
    tokenMock.verifySession.mockResolvedValue({ userId: "usr_seller", role: "SELLER" });

    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/seller/assets");
  });

  it("allows public visitors on / without redirecting", async () => {
    const req = createRequest("http://localhost:3000/");
    tokenMock.verifySession.mockResolvedValue(null);

    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("x-locale")).toBe("en");
  });
});
