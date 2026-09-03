import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

import {
  SESSION_COOKIE_NAME,
  createSession,
  destroySession,
  readSession,
  verifySession,
} from "./session";

const session = { userId: "usr_buyer_demo", role: "BUYER" as const };

describe("cookie sessions", () => {
  beforeEach(() => {
    vi.stubEnv("AUTH_SECRET", "test-secret-that-is-at-least-32-characters");
    cookieStore.delete.mockReset();
    cookieStore.get.mockReset();
    cookieStore.set.mockReset();
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

  it("reads the token from cookies and rejects a modified token", async () => {
    await createSession(session);
    const token = cookieStore.set.mock.calls[0]?.[1] as string;
    cookieStore.get.mockReturnValue({ value: token });

    await expect(readSession()).resolves.toEqual(session);
    await expect(verifySession(`${token}modified`)).resolves.toBeNull();
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
