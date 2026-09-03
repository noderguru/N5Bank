import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() =>
  vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  })
);

const sessionMock = vi.hoisted(() => ({
  createSession: vi.fn(),
  destroySession: vi.fn(),
}));

const passwordMock = vi.hoisted(() => ({
  hashPassword: vi.fn(async (pwd: string) => `hashed_${pwd}`),
  verifyPassword: vi.fn(),
}));

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  buyerProfile: {
    create: vi.fn(),
  },
  sellerProfile: {
    create: vi.fn(),
  },
  $transaction: vi.fn(async <T>(callback: (tx: typeof prismaMock) => Promise<T>): Promise<T> => callback(prismaMock)),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/auth/session", () => ({
  createSession: sessionMock.createSession,
  destroySession: sessionMock.destroySession,
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword: passwordMock.hashPassword,
  verifyPassword: passwordMock.verifyPassword,
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: prismaMock,
}));

import { getRoleDashboard } from "../../lib/auth/roles";
import { demoLoginAction, loginAction, logoutAction, registerAction } from "./auth";

describe("auth server actions", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    sessionMock.createSession.mockReset();
    sessionMock.destroySession.mockReset();
    passwordMock.verifyPassword.mockReset();
    passwordMock.hashPassword.mockClear();
    prismaMock.user.findUnique.mockReset();
  });

  describe("getRoleDashboard", () => {
    it("maps roles to their respective home routes", () => {
      expect(getRoleDashboard("BUYER")).toBe("/buyer");
      expect(getRoleDashboard("SELLER")).toBe("/seller/assets");
      expect(getRoleDashboard("MANAGER")).toBe("/admin/users");
    });
  });

  describe("loginAction", () => {
    it("returns inline field errors for invalid input", async () => {
      const formData = new FormData();
      formData.set("email", "not-email");
      formData.set("password", "");

      const result = await loginAction(null, formData);
      expect(result.success).toBe(false);
      expect(result.errors?.email).toBeDefined();
      expect(result.errors?.password).toBeDefined();
    });

    it("rejects non-existent users", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const formData = new FormData();
      formData.set("email", "unknown@domain.com");
      formData.set("password", "pass1234");

      const result = await loginAction(null, formData);
      expect(result.success).toBe(false);
      expect(result.errors?._form?.[0]).toContain("Invalid email address or password");
    });

    it("rejects incorrect passwords", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "usr_1",
        email: "test@domain.com",
        passwordHash: "hash123",
        status: "ACTIVE",
        role: "BUYER",
      });
      passwordMock.verifyPassword.mockResolvedValue(false);

      const formData = new FormData();
      formData.set("email", "test@domain.com");
      formData.set("password", "wrongpass");

      const result = await loginAction(null, formData);
      expect(result.success).toBe(false);
      expect(result.errors?._form?.[0]).toContain("Invalid email address or password");
    });

    it("displays an explanatory error when the user account is SUSPENDED", async () => {
      // Acceptance criterion: "Саспенднутый пользователь получает внятное сообщение, а не белый экран"
      prismaMock.user.findUnique.mockResolvedValue({
        id: "usr_suspended",
        email: "seller.suspended@n5deal.demo",
        passwordHash: "hash123",
        status: "SUSPENDED",
        role: "SELLER",
      });
      passwordMock.verifyPassword.mockResolvedValue(true);

      const formData = new FormData();
      formData.set("email", "seller.suspended@n5deal.demo");
      formData.set("password", "demo123");

      const result = await loginAction(null, formData);
      expect(result.success).toBe(false);
      expect(result.errors?._form?.[0]).toContain("suspended by platform compliance");
      expect(sessionMock.createSession).not.toHaveBeenCalled();
    });

    it("displays an error when the user account is REMOVED", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "usr_removed",
        email: "removed@n5deal.demo",
        passwordHash: "hash123",
        status: "REMOVED",
        role: "BUYER",
      });
      passwordMock.verifyPassword.mockResolvedValue(true);

      const formData = new FormData();
      formData.set("email", "removed@n5deal.demo");
      formData.set("password", "demo123");

      const result = await loginAction(null, formData);
      expect(result.success).toBe(false);
      expect(result.errors?._form?.[0]).toContain("account has been removed");
    });

    it("creates session and redirects to role dashboard upon successful login", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "usr_buyer_demo",
        email: "buyer@demo",
        passwordHash: "hash123",
        status: "ACTIVE",
        role: "BUYER",
      });
      passwordMock.verifyPassword.mockResolvedValue(true);

      const formData = new FormData();
      formData.set("email", "buyer@demo");
      formData.set("password", "demo123");

      await expect(loginAction(null, formData)).rejects.toThrow("NEXT_REDIRECT:/buyer");
      expect(sessionMock.createSession).toHaveBeenCalledWith({
        userId: "usr_buyer_demo",
        role: "BUYER",
      });
    });

    it("respects safe returnTo destination", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "usr_seller_demo",
        email: "seller@demo",
        passwordHash: "hash123",
        status: "ACTIVE",
        role: "SELLER",
      });
      passwordMock.verifyPassword.mockResolvedValue(true);

      const formData = new FormData();
      formData.set("email", "seller@demo");
      formData.set("password", "demo123");
      formData.set("returnTo", "/seller/assets/new");

      await expect(loginAction(null, formData)).rejects.toThrow("NEXT_REDIRECT:/seller/assets/new");
    });
  });

  describe("demoLoginAction", () => {
    // Acceptance criterion: "Демо-вход в один клик работает для всех трёх ролей"
    it("logs in demo BUYER in one click", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "usr_buyer_demo",
        email: "buyer@demo",
        role: "BUYER",
        status: "ACTIVE",
      });

      await expect(demoLoginAction("BUYER")).rejects.toThrow("NEXT_REDIRECT:/buyer");
      expect(sessionMock.createSession).toHaveBeenCalledWith({
        userId: "usr_buyer_demo",
        role: "BUYER",
      });
    });

    it("logs in demo SELLER in one click", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "usr_seller_demo",
        email: "seller@demo",
        role: "SELLER",
        status: "ACTIVE",
      });

      await expect(demoLoginAction("SELLER")).rejects.toThrow("NEXT_REDIRECT:/seller/assets");
      expect(sessionMock.createSession).toHaveBeenCalledWith({
        userId: "usr_seller_demo",
        role: "SELLER",
      });
    });

    it("logs in demo MANAGER in one click", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "usr_manager_demo",
        email: "manager@demo",
        role: "MANAGER",
        status: "ACTIVE",
      });

      await expect(demoLoginAction("MANAGER")).rejects.toThrow("NEXT_REDIRECT:/admin/users");
      expect(sessionMock.createSession).toHaveBeenCalledWith({
        userId: "usr_manager_demo",
        role: "MANAGER",
      });
    });
  });

  describe("registerAction", () => {
    it("returns inline field errors for incomplete registration", async () => {
      const formData = new FormData();
      formData.set("name", "");
      formData.set("email", "bad-email");
      formData.set("password", "12");

      const result = await registerAction(null, formData);
      expect(result.success).toBe(false);
      expect(result.errors?.name).toBeDefined();
      expect(result.errors?.email).toBeDefined();
      expect(result.errors?.password).toBeDefined();
    });

    it("rejects duplicate email registrations", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: "existing" });

      const formData = new FormData();
      formData.set("name", "Existing User");
      formData.set("email", "exists@example.com");
      formData.set("password", "password123");
      formData.set("role", "BUYER");
      formData.set("company", "Alpha Corp");
      formData.set("country", "Germany");

      const result = await registerAction(null, formData);
      expect(result.success).toBe(false);
      expect(result.errors?.email?.[0]).toContain("already exists");
    });

    it("registers a new buyer with profile and redirects to /buyer", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: "usr_new_buyer",
        email: "newbuyer@example.com",
        role: "BUYER",
      });

      const formData = new FormData();
      formData.set("name", "New Buyer");
      formData.set("email", "newbuyer@example.com");
      formData.set("password", "password123");
      formData.set("role", "BUYER");
      formData.set("company", "Beta Fund");
      formData.set("country", "Lithuania");

      await expect(registerAction(null, formData)).rejects.toThrow("NEXT_REDIRECT:/buyer");
      expect(sessionMock.createSession).toHaveBeenCalledWith({
        userId: "usr_new_buyer",
        role: "BUYER",
      });
    });
  });

  describe("logoutAction", () => {
    it("destroys session and redirects to /login", async () => {
      await expect(logoutAction()).rejects.toThrow("NEXT_REDIRECT:/login");
      expect(sessionMock.destroySession).toHaveBeenCalled();
    });
  });
});
