import type { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { readSession, type Session } from "./session";

export class AuthError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message = "Authentication required") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AuthError {
  constructor(message = "Access forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

export function assertUser(session: Session | null): asserts session is Session {
  if (!session) {
    throw new UnauthorizedError();
  }
}

export function assertRole(
  session: Session,
  roles: UserRole | readonly UserRole[]
): void {
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(session.role)) {
    throw new ForbiddenError(
      `Forbidden: role '${session.role}' is not allowed. Required: ${allowed.join(", ")}`
    );
  }
}

export function assertOwnership(
  session: Session,
  ownerId: string,
  options?: { allowRoles?: readonly UserRole[] }
): void {
  if (session.userId === ownerId) {
    return;
  }

  if (options?.allowRoles && options.allowRoles.includes(session.role)) {
    return;
  }

  throw new ForbiddenError(
    `Forbidden: user '${session.userId}' is not the owner of this resource`
  );
}

export async function requireUser(): Promise<Session> {
  const session = await readSession();
  assertUser(session);
  return session;
}

export async function requireRole(
  roles: UserRole | readonly UserRole[]
): Promise<Session> {
  const session = await requireUser();
  assertRole(session, roles);
  return session;
}

export async function requireOwnership(
  ownerId: string,
  options?: { allowRoles?: readonly UserRole[] }
): Promise<Session> {
  const session = await requireUser();
  assertOwnership(session, ownerId, options);
  return session;
}

export async function requireUserOrRedirect(
  redirectTo = "/login"
): Promise<Session> {
  const session = await readSession();
  if (!session) {
    redirect(redirectTo);
  }
  return session;
}
