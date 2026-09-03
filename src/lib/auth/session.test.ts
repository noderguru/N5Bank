import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
}));

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: prismaMock,
}));

import {
  SESSION_COOKIE_NAME,
  createSession,
  destroySession,
  readSession,
  resolveSession,
  verifySession,
} from "./session";

const session = { userId: "usr_buyer_demo", role: "BUYER" as const };

describe("cookie sessions", () => {
  beforeEach(() => {
    vi.stubEnv("AUTH_SECRET", "test-secret-that-is-at-least-32-characters");
    cookieStore.delete.mockReset();
    cookieStore.get.mockReset();
    cookieStore.set.mockReset();
    prismaMock.user.findUnique.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates a secure server-only cookie with a verifiable session", async () => {
    await createSession(session);

    expect(cookieStore.set).toHaveBeenCalledOnce();
    const [name, token, options] = cookieStore.set.mock.calls[0] ?? [];

    expect(name).toBe(SESSION_COOKIE_NAME);
    expect(options).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    await expect(verifySession(token)).resolves.toEqual(session);
  });

  it("marks the cookie as secure in production", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await createSession(session);

    expect(cookieStore.set.mock.calls[0]?.[2]).toMatchObject({ secure: true });
  });

  it("reads and resolves the session for an active user", async () => {
    await createSession(session);
    const token = cookieStore.set.mock.calls[0]?.[1] as string;
    cookieStore.get.mockReturnValue({ value: token });
    prismaMock.user.findUnique.mockResolvedValue({
      id: session.userId,
      role: session.role,
      status: "ACTIVE",
    });

    await expect(readSession()).resolves.toEqual(session);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: session.userId },
      select: { id: true, role: true, status: true },
    });
  });

  it("rejects a modified token", async () => {
    await createSession(session);
    const token = cookieStore.set.mock.calls[0]?.[1] as string;

    await expect(verifySession(`${token}modified`)).resolves.toBeNull();
    await expect(resolveSession(`${token}modified`)).resolves.toBeNull();
  });

  it("blocks suspended users upon session resolution", async () => {
    await createSession(session);
    const token = cookieStore.set.mock.calls[0]?.[1] as string;
    cookieStore.get.mockReturnValue({ value: token });
    prismaMock.user.findUnique.mockResolvedValue({
      id: session.userId,
      role: session.role,
      status: "SUSPENDED",
    });

    await expect(readSession()).resolves.toBeNull();
    await expect(resolveSession(token)).resolves.toBeNull();
  });

  it("blocks removed users upon session resolution", async () => {
    await createSession(session);
    const token = cookieStore.set.mock.calls[0]?.[1] as string;
    cookieStore.get.mockReturnValue({ value: token });
    prismaMock.user.findUnique.mockResolvedValue({
      id: session.userId,
      role: session.role,
      status: "REMOVED",
    });

    await expect(readSession()).resolves.toBeNull();
    await expect(resolveSession(token)).resolves.toBeNull();
  });

  it("rejects session when user does not exist in database", async () => {
    await createSession(session);
    const token = cookieStore.set.mock.calls[0]?.[1] as string;
    cookieStore.get.mockReturnValue({ value: token });
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(readSession()).resolves.toBeNull();
  });

  it("returns null when the session cookie is absent", async () => {
    cookieStore.get.mockReturnValue(undefined);

    await expect(readSession()).resolves.toBeNull();
  });

  it("deletes the session cookie", async () => {
    await destroySession();

    expect(cookieStore.delete).toHaveBeenCalledWith(SESSION_COOKIE_NAME);
  });
});
