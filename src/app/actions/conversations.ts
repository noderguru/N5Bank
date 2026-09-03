"use server";

import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";

export type ConversationActionResult = {
  success: boolean;
  conversationId?: string;
  error?: string;
};

export async function getOrCreateConversationAction(
  targetId: string,
  assetId?: string
): Promise<ConversationActionResult> {
  const session = await requireUser();

  if (session.userId === targetId) {
    return {
      success: false,
      error: "Cannot start a deal thread with yourself.",
    };
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, role: true, status: true },
  });

  if (!targetUser) {
    return { success: false, error: "Counterparty account not found." };
  }

  if (targetUser.status === "SUSPENDED" || targetUser.status === "REMOVED") {
    return {
      success: false,
      error: "This counterparty is suspended by platform compliance and cannot be contacted.",
    };
  }

  let buyerId: string;
  let sellerId: string;

  if (assetId) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { id: true, sellerId: true, status: true },
    });

    if (!asset || asset.status === "REMOVED") {
      return { success: false, error: "Referenced asset is unavailable." };
    }

    sellerId = asset.sellerId;
    buyerId = session.userId === sellerId ? targetId : session.userId;
  } else {
    // If target is seller, current user is buyer; otherwise current user is seller
    if (targetUser.role === "SELLER") {
      sellerId = targetUser.id;
      buyerId = session.userId;
    } else {
      buyerId = targetUser.id;
      sellerId = session.userId;
    }
  }

  // Check if existing thread already exists between counterparty pair
  const existing = await prisma.conversation.findFirst({
    where: {
      buyerId,
      sellerId,
      assetId: assetId ?? null,
    },
  });

  if (existing) {
    return {
      success: true,
      conversationId: existing.id,
    };
  }

  // Atomically create thread
  const created = await prisma.conversation.create({
    data: {
      buyerId,
      sellerId,
      assetId: assetId ?? null,
    },
  });

  return {
    success: true,
    conversationId: created.id,
  };
}


export async function sendMessageAction(
  conversationId: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  const session = await requireUser();

  if (!body || !body.trim()) {
    return { success: false, error: "Message body cannot be empty." };
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      buyer: { select: { id: true, status: true } },
      seller: { select: { id: true, status: true } },
    },
  });

  if (!conversation) {
    return { success: false, error: "Conversation not found." };
  }

  if (
    conversation.buyerId !== session.userId &&
    conversation.sellerId !== session.userId
  ) {
    return {
      success: false,
      error: "Forbidden: You are not a participant in this conversation.",
    };
  }

  const counterparty =
    conversation.buyerId === session.userId
      ? conversation.seller
      : conversation.buyer;

  if (counterparty.status === "SUSPENDED" || counterparty.status === "REMOVED") {
    return {
      success: false,
      error: "Cannot send messages because the counterparty has been suspended by compliance.",
    };
  }

  await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId: session.userId,
        body: body.trim(),
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return { success: true };
}
