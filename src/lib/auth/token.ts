import type { UserRole } from "@prisma/client";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "n5deal_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

const JWT_ALGORITHM = "HS256";
const JWT_ISSUER = "n5deal";
const JWT_AUDIENCE = "n5deal-web";
const USER_ROLES = new Set<UserRole>(["BUYER", "SELLER", "MANAGER"]);

export type Session = {
  userId: string;
  role: UserRole;
};

export function getSessionSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must contain at least 32 characters.");
  }

  return new TextEncoder().encode(secret);
}

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.has(value as UserRole);
}

export async function signSession(session: Session): Promise<string> {
  return new SignJWT({ role: session.role })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .sign(getSessionSecret());
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
