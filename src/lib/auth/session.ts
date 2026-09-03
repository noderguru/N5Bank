import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  type Session,
  signSession,
  verifySession,
} from "./token";

export { SESSION_COOKIE_NAME, type Session, verifySession };

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

export async function resolveSession(token: string): Promise<Session | null> {
  const verified = await verifySession(token);
  if (!verified) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: verified.userId },
    select: { id: true, role: true, status: true },
  });

  if (!user || user.status !== "ACTIVE") {
    return null;
  }

  return { userId: user.id, role: user.role };
}

export async function readSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  return token ? resolveSession(token) : null;
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}

