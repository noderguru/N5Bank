import type { UserRole } from "@prisma/client";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "n5deal_session";

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;
const JWT_ALGORITHM = "HS256";
const JWT_ISSUER = "n5deal";
const JWT_AUDIENCE = "n5deal-web";
const USER_ROLES = new Set<UserRole>(["BUYER", "SELLER", "MANAGER"]);

export type Session = {
  userId: string;
  role: UserRole;
};

function getSessionSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must contain at least 32 characters.");
  }

  return new TextEncoder().encode(secret);
}

function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.has(value as UserRole);
}

async function signSession(session: Session): Promise<string> {
  return new SignJWT({ role: session.role })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .sign(getSessionSecret());
}

export async function createSession(session: Session): Promise<void> {
  const token = await signSession(session);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function verifySession(token: string): Promise<Session | null> {
  const secret = getSessionSecret();

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [JWT_ALGORITHM],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    if (!payload.sub || !isUserRole(payload.role)) {
      return null;
    }

    return { userId: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export async function readSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  return token ? verifySession(token) : null;
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}
