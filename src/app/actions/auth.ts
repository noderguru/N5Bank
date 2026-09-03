"use server";

import type { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { loginSchema, registerSchema } from "../../lib/validation/auth";

import { getRoleDashboard } from "../../lib/auth/roles";

export type AuthFormState = {
  success?: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

function sanitizeReturnTo(returnTo: unknown, role: UserRole): string {
  if (
    typeof returnTo === "string" &&
    returnTo.startsWith("/") &&
    !returnTo.startsWith("//") &&
    !returnTo.startsWith("/login") &&
    !returnTo.startsWith("/register")
  ) {
    return returnTo;
  }
  return getRoleDashboard(role);
}

export async function loginAction(
  _prevState: AuthFormState | null,
  formData: FormData
): Promise<AuthFormState> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  const returnTo = formData.get("returnTo");

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return {
      success: false,
      errors: {
        _form: ["Invalid email address or password."],
      },
    };
  }

  if (user.status === "SUSPENDED") {
    return {
      success: false,
      errors: {
        _form: [
          "Your account has been suspended by platform compliance. Please contact support.",
        ],
      },
    };
  }

  if (user.status === "REMOVED") {
    return {
      success: false,
      errors: {
        _form: ["This account has been removed."],
      },
    };
  }

  await createSession({ userId: user.id, role: user.role });

  const target = sanitizeReturnTo(returnTo, user.role);
  redirect(target);
}

export async function demoLoginAction(
  role: UserRole,
  returnTo?: string
): Promise<void> {
  const demoEmailMap: Record<UserRole, string> = {
    BUYER: "buyer@demo",
    SELLER: "seller@demo",
    MANAGER: "manager@demo",
  };

  const email = demoEmailMap[role];
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.status !== "ACTIVE") {
    throw new Error(`Demo account for ${role} is not available.`);
  }

  await createSession({ userId: user.id, role: user.role });

  const target = sanitizeReturnTo(returnTo, user.role);
  redirect(target);
}

export async function registerAction(
  _prevState: AuthFormState | null,
  formData: FormData
): Promise<AuthFormState> {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    company: formData.get("company"),
    country: formData.get("country"),
  };

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, password, role, company, country } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    return {
      success: false,
      errors: {
        email: ["An account with this email address already exists."],
      },
    };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        status: "ACTIVE",
      },
    });

    if (role === "BUYER") {
      await tx.buyerProfile.create({
        data: {
          userId: newUser.id,
          company,
          country,
        },
      });
    } else if (role === "SELLER") {
      await tx.sellerProfile.create({
        data: {
          userId: newUser.id,
          company,
          country,
        },
      });
    }

    return newUser;
  });

  await createSession({ userId: user.id, role: user.role });

  redirect(getRoleDashboard(user.role));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
