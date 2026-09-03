import { beforeEach, describe, expect, it, vi } from "vitest";

const guardMock = vi.hoisted(() => ({
  requireUser: vi.fn(),
}));

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
  conversation: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  message: {
    create: vi.fn(),
  },
  $transaction: vi.fn(async (calls: unknown[]) => calls),
}));

vi.mock("@/lib/auth/guard", () => ({
  requireUser: guardMock.requireUser,
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: prismaMock,
}));

import {
  getOrCreateConversationAction,
  sendMessageAction,
} from "./conversations";

describe("conversations server actions", () => {
  const sellerSession = {
    userId: "usr_seller_1",
    role: "SELLER" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    guardMock.requireUser.mockResolvedValue(sellerSession);
  });

  describe("getOrCreateConversationAction", () => {
    it("reuses existing conversation without duplicate creation", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "usr_buyer_1",
        role: "BUYER",
        status: "ACTIVE",
      });

      prismaMock.conversation.findFirst.mockResolvedValue({
        id: "conv_existing_123",
        buyerId: "usr_buyer_1",
        sellerId: "usr_seller_1",
        assetId: null,
      });

      const result = await getOrCreateConversationAction("usr_buyer_1");
      expect(result.success).toBe(true);
      expect(result.conversationId).toBe("conv_existing_123");
      expect(prismaMock.conversation.create).not.toHaveBeenCalled();
    });

    it("creates a new thread if no existing conversation exists", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "usr_buyer_1",
        role: "BUYER",
        status: "ACTIVE",
      });

      prismaMock.conversation.findFirst.mockResolvedValue(null);
      prismaMock.conversation.create.mockResolvedValue({
        id: "conv_new_456",
        buyerId: "usr_buyer_1",
        sellerId: "usr_seller_1",
        assetId: null,
      });

      const result = await getOrCreateConversationAction("usr_buyer_1");
      expect(result.success).toBe(true);
      expect(result.conversationId).toBe("conv_new_456");
      expect(prismaMock.conversation.create).toHaveBeenCalledWith({
        data: {
          buyerId: "usr_buyer_1",
          sellerId: "usr_seller_1",
          assetId: null,
        },
      });
    });

    it("rejects contact if counterparty is SUSPENDED", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "usr_buyer_suspended",
        role: "BUYER",
        status: "SUSPENDED",
      });

      const result = await getOrCreateConversationAction("usr_buyer_suspended");
      expect(result.success).toBe(false);
      expect(result.error).toContain("suspended by platform compliance");
      expect(prismaMock.conversation.findFirst).not.toHaveBeenCalled();
      expect(prismaMock.conversation.create).not.toHaveBeenCalled();
    });

    it("rejects self conversation", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "usr_seller_1",
        role: "SELLER",
        status: "ACTIVE",
      });

      const result = await getOrCreateConversationAction("usr_seller_1");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Cannot start a deal thread with yourself");
    });
  });

  describe("sendMessageAction", () => {
    it("rejects empty message body", async () => {
      const result = await sendMessageAction("conv_1", "   ");
      expect(result.success).toBe(false);
      expect(result.error).toContain("cannot be empty");
    });

    it("rejects non-participants", async () => {
      prismaMock.conversation.findUnique.mockResolvedValue({
        id: "conv_1",
        buyerId: "other_buyer",
        sellerId: "other_seller",
        buyer: { id: "other_buyer", status: "ACTIVE" },
        seller: { id: "other_seller", status: "ACTIVE" },
      });

      const result = await sendMessageAction("conv_1", "Hello there");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Forbidden");
    });

    it("blocks messages if counterparty is SUSPENDED", async () => {
      prismaMock.conversation.findUnique.mockResolvedValue({
        id: "conv_1",
        buyerId: "usr_buyer_susp",
        sellerId: "usr_seller_1",
        buyer: { id: "usr_buyer_susp", status: "SUSPENDED" },
        seller: { id: "usr_seller_1", status: "ACTIVE" },
      });

      const result = await sendMessageAction("conv_1", "Are you available?");
      expect(result.success).toBe(false);
      expect(result.error).toContain("counterparty has been suspended");
    });

    it("blocks messages if counterparty is REMOVED", async () => {
      prismaMock.conversation.findUnique.mockResolvedValue({
        id: "conv_1",
        buyerId: "usr_buyer_removed",
        sellerId: "usr_seller_1",
        buyer: { id: "usr_buyer_removed", status: "REMOVED" },
        seller: { id: "usr_seller_1", status: "ACTIVE" },
      });

      const result = await sendMessageAction("conv_1", "Are you available?");
      expect(result.success).toBe(false);
      expect(result.error).toContain("counterparty has been suspended");
    });

    it("sends message and updates thread timestamp", async () => {
      prismaMock.conversation.findUnique.mockResolvedValue({
        id: "conv_1",
        buyerId: "usr_buyer_active",
        sellerId: "usr_seller_1",
        buyer: { id: "usr_buyer_active", status: "ACTIVE" },
        seller: { id: "usr_seller_1", status: "ACTIVE" },
      });

      const result = await sendMessageAction("conv_1", "We are interested in discussing the asset.");
      expect(result.success).toBe(true);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });
});
