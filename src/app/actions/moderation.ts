"use server";

import { revalidatePath } from "next/cache";
import { UserStatus, AssetStatus, ModerationAction } from "@prisma/client";
import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import {
  moderateUserSchema,
  moderateAssetSchema,
  type ModerateUserInput,
  type ModerateAssetInput,
} from "@/lib/validation/moderation";

export type ModerationActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  logId?: string;
};

export async function moderateUserAction(
  input: ModerateUserInput
): Promise<ModerationActionResult> {
  const session = await requireRole("MANAGER");

  const parsed = moderateUserSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Invalid input";
    return { success: false, error: firstError };
  }

  const { userId, action, reason } = parsed.data;

  // Criterion: "Менеджер не может саспендить сам себя"
  if (session.userId === userId) {
    return {
      success: false,
      error: "Managers cannot perform moderation actions on their own account.",
    };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true, status: true },
  });

  if (!target) {
    return { success: false, error: "Target participant not found." };
  }

  // Criterion: "Нельзя саспендить последнего активного менеджера"
  if (target.role === "MANAGER" && (action === "SUSPEND" || action === "REMOVE")) {
    const activeManagersCount = await prisma.user.count({
      where: {
        role: "MANAGER",
        status: UserStatus.ACTIVE,
      },
    });

    if (activeManagersCount <= 1) {
      return {
        success: false,
        error: "Cannot suspend or remove the last active platform manager.",
      };
    }
  }

  let nextStatus: UserStatus;
  let moderationAction: ModerationAction;

  switch (action) {
    case "SUSPEND":
      nextStatus = UserStatus.SUSPENDED;
      moderationAction = ModerationAction.SUSPEND;
      break;
    case "RESTORE":
      nextStatus = UserStatus.ACTIVE;
      moderationAction = ModerationAction.RESTORE;
      break;
    case "REMOVE":
      nextStatus = UserStatus.REMOVED;
      moderationAction = ModerationAction.REMOVE;
      break;
  }

  const [, log] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { status: nextStatus },
    }),
    prisma.moderationLog.create({
      data: {
        actorId: session.userId,
        targetType: "USER",
        targetId: userId,
        action: moderationAction,
        reason: reason.trim(),
      },
    }),
  ]);

  // Purge cache across marketplace surfaces
  revalidatePath("/admin/users");
  revalidatePath("/admin/assets");
  revalidatePath("/admin/moderation");
  revalidatePath("/assets");
  revalidatePath("/buyers");
  revalidatePath(`/buyers/${userId}`);

  return {
    success: true,
    message: `Participant ${target.name} status updated to ${nextStatus.toLowerCase()}.`,
    logId: log.id,
  };
}

export async function moderateAssetAction(
  input: ModerateAssetInput
): Promise<ModerationActionResult> {
  const session = await requireRole("MANAGER");

  const parsed = moderateAssetSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Invalid input";
    return { success: false, error: firstError };
  }

  const { assetId, action, reason } = parsed.data;

  const target = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { id: true, title: true, status: true, validated: true },
  });

  if (!target) {
    return { success: false, error: "Target asset not found." };
  }

  let nextStatus = target.status;
  let nextValidated = target.validated;
  let moderationAction: ModerationAction;

  switch (action) {
    case "SUSPEND":
      nextStatus = AssetStatus.SUSPENDED;
      moderationAction = ModerationAction.SUSPEND;
      break;
    case "RESTORE":
      nextStatus = AssetStatus.PUBLISHED;
      moderationAction = ModerationAction.RESTORE;
      break;
    case "REMOVE":
      nextStatus = AssetStatus.REMOVED;
      moderationAction = ModerationAction.REMOVE;
      break;
    case "VALIDATE":
      nextValidated = true;
      moderationAction = ModerationAction.VALIDATE;
      break;
    case "REJECT":
      nextValidated = false;
      moderationAction = ModerationAction.REJECT;
      break;
  }

  const [, log] = await prisma.$transaction([
    prisma.asset.update({
      where: { id: assetId },
      data: {
        status: nextStatus,
        validated: nextValidated,
      },
    }),
    prisma.moderationLog.create({
      data: {
        actorId: session.userId,
        targetType: "ASSET",
        targetId: assetId,
        action: moderationAction,
        reason: reason.trim(),
      },
    }),
  ]);

  revalidatePath("/admin/assets");
  revalidatePath("/admin/users");
  revalidatePath("/admin/moderation");
  revalidatePath("/assets");
  revalidatePath(`/assets/${assetId}`);

  return {
    success: true,
    message: `Asset "${target.title}" updated successfully.`,
    logId: log.id,
  };
}
