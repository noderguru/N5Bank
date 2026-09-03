import { beforeEach, describe, expect, it, vi } from "vitest";

const sessionState = vi.hoisted(() => ({
  current: null as { userId: string; role: "BUYER" | "SELLER" | "MANAGER" } | null,
}));

const redirectMock = vi.hoisted(() => vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
}));

vi.mock("./session", () => ({
  readSession: vi.fn(async () => sessionState.current),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

import {
  AuthError,
  ForbiddenError,
  UnauthorizedError,
  assertOwnership,
  assertRole,
  assertUser,
  isAuthError,
  requireOwnership,
  requireRole,
  requireUser,
  requireUserOrRedirect,
} from "./guard";

describe("RBAC data access guards", () => {
  beforeEach(() => {
    sessionState.current = null;
    redirectMock.mockClear();
  });

  describe("error classes and type guard", () => {
    it("assigns appropriate status codes and identities", () => {
      const unauth = new UnauthorizedError();
      const forbidden = new ForbiddenError();
      const genericAuth = new AuthError("Custom auth message", 401);

      expect(unauth.statusCode).toBe(401);
      expect(unauth.name).toBe("UnauthorizedError");
      expect(isAuthError(unauth)).toBe(true);

      expect(forbidden.statusCode).toBe(403);
      expect(forbidden.name).toBe("ForbiddenError");
      expect(isAuthError(forbidden)).toBe(true);

      expect(genericAuth.statusCode).toBe(401);
      expect(isAuthError(genericAuth)).toBe(true);

      expect(isAuthError(new Error("Generic"))).toBe(false);
      expect(isAuthError(null)).toBe(false);
    });
  });

  describe("requireUser", () => {
    it("returns session when authenticated", async () => {
      sessionState.current = { userId: "usr_1", role: "SELLER" };

      const session = await requireUser();
      expect(session).toEqual({ userId: "usr_1", role: "SELLER" });
    });

    it("throws UnauthorizedError when session is missing", async () => {
      sessionState.current = null;

      await expect(requireUser()).rejects.toThrow(UnauthorizedError);
      await expect(requireUser()).rejects.toMatchObject({ statusCode: 401 });
    });
  });

  describe("requireRole", () => {
    it("allows user with matching role", async () => {
      sessionState.current = { userId: "usr_seller", role: "SELLER" };

      await expect(requireRole("SELLER")).resolves.toEqual(sessionState.current);
    });

    it("allows user matching any of multiple allowed roles", async () => {
      sessionState.current = { userId: "usr_manager", role: "MANAGER" };

      await expect(requireRole(["SELLER", "MANAGER"])).resolves.toEqual(sessionState.current);
    });

    it("blocks a BUYER from invoking SELLER actions (throws ForbiddenError)", async () => {
      // Acceptance Criterion: "Байер не может дёрнуть action публикации ассета даже прямым запросом"
      sessionState.current = { userId: "usr_buyer", role: "BUYER" };

      await expect(requireRole("SELLER")).rejects.toThrow(ForbiddenError);
      await expect(requireRole("SELLER")).rejects.toMatchObject({ statusCode: 403 });
    });

    it("blocks unauthenticated user before checking roles", async () => {
      sessionState.current = null;

      await expect(requireRole("SELLER")).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("requireOwnership", () => {
    it("allows owner to access their resource", async () => {
      sessionState.current = { userId: "seller_alice", role: "SELLER" };

      await expect(requireOwnership("seller_alice")).resolves.toEqual(sessionState.current);
    });

    it("blocks a seller from editing another seller's asset", async () => {
      // Acceptance Criterion: "Продавец не может отредактировать чужой ассет"
      sessionState.current = { userId: "seller_bob", role: "SELLER" };

      await expect(requireOwnership("seller_alice")).rejects.toThrow(ForbiddenError);
      await expect(requireOwnership("seller_alice")).rejects.toMatchObject({ statusCode: 403 });
    });

    it("allows authorized roles (e.g. MANAGER) when allowRoles is specified", async () => {
      sessionState.current = { userId: "manager_root", role: "MANAGER" };

      await expect(
        requireOwnership("seller_alice", { allowRoles: ["MANAGER"] })
      ).resolves.toEqual(sessionState.current);
    });

    it("still blocks unauthorized roles even if not owner", async () => {
      sessionState.current = { userId: "buyer_charlie", role: "BUYER" };

      await expect(
        requireOwnership("seller_alice", { allowRoles: ["MANAGER"] })
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("requireUserOrRedirect", () => {
    it("returns session if authenticated", async () => {
      sessionState.current = { userId: "usr_1", role: "BUYER" };

      const session = await requireUserOrRedirect();
      expect(session).toEqual({ userId: "usr_1", role: "BUYER" });
      expect(redirectMock).not.toHaveBeenCalled();
    });

    it("redirects to /login by default when unauthenticated", async () => {
      sessionState.current = null;

      await expect(requireUserOrRedirect()).rejects.toThrow("NEXT_REDIRECT:/login");
      expect(redirectMock).toHaveBeenCalledWith("/login");
    });

    it("redirects to custom URL when specified", async () => {
      sessionState.current = null;

      await expect(requireUserOrRedirect("/auth/signin")).rejects.toThrow("NEXT_REDIRECT:/auth/signin");
      expect(redirectMock).toHaveBeenCalledWith("/auth/signin");
    });
  });

  describe("assertion helpers", () => {
    it("assertUser throws on null", () => {
      expect(() => assertUser(null)).toThrow(UnauthorizedError);
      expect(() => assertUser({ userId: "1", role: "BUYER" })).not.toThrow();
    });

    it("assertRole throws on disallowed role", () => {
      const session = { userId: "1", role: "BUYER" as const };
      expect(() => assertRole(session, "SELLER")).toThrow(ForbiddenError);
      expect(() => assertRole(session, ["BUYER", "SELLER"])).not.toThrow();
    });

    it("assertOwnership throws on non-owner without exempt role", () => {
      const session = { userId: "seller_1", role: "SELLER" as const };
      expect(() => assertOwnership(session, "seller_2")).toThrow(ForbiddenError);
      expect(() => assertOwnership(session, "seller_1")).not.toThrow();
    });
  });
});
