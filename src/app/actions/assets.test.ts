import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePathMock = vi.hoisted(() => vi.fn());
const guardMock = vi.hoisted(() => ({
  requireRole: vi.fn(),
  requireUser: vi.fn(),
  assertOwnership: vi.fn(),
}));

const prismaMock = vi.hoisted(() => ({
  asset: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  favorite: {
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/auth/guard", () => ({
  requireRole: guardMock.requireRole,
  requireUser: guardMock.requireUser,
  assertOwnership: guardMock.assertOwnership,
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: prismaMock,
}));

import {
  createAssetAction,
  removeAssetAction,
  toggleAssetStatusAction,
  toggleFavoriteAction,
  updateAssetAction,
} from "./assets";

describe("asset server actions", () => {
  const sellerSession = {
    userId: "seller_1",
    role: "SELLER" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    guardMock.requireRole.mockResolvedValue(sellerSession);
    guardMock.requireUser.mockResolvedValue(sellerSession);
    guardMock.assertOwnership.mockReturnValue(undefined);
  });

  describe("createAssetAction", () => {
    it("rejects invalid input without touching database", async () => {
      const formData = new FormData();
      formData.set("priceMode", "FIXED");
      formData.set("title", "AB"); // too short

      const result = await createAssetAction(null, formData);
      expect(result.success).toBe(false);
      expect(result.errors?.title).toBeDefined();
      expect(prismaMock.asset.create).not.toHaveBeenCalled();
    });

    it("enforces FIXED price mode requires positive price", async () => {
      const formData = new FormData();
      formData.set("title", "Valid Title For Bank");
      formData.set("summary", "A very comprehensive summary for testing.");
      formData.set("description", "A very detailed description of this financial asset listing.");
      formData.set("country", "Germany");
      formData.set("licenseType", "BANKING");
      formData.set("businessType", "BANK");
      formData.set("businessStatus", "OPERATING");
      formData.set("priceMode", "FIXED");
      formData.set("askingPrice", "0"); // Invalid 0

      const result = await createAssetAction(null, formData);
      expect(result.success).toBe(false);
      expect(result.errors?.askingPrice).toBeDefined();
      expect(prismaMock.asset.create).not.toHaveBeenCalled();
    });

    it("creates asset with valid FIXED price payload", async () => {
      prismaMock.asset.create.mockResolvedValue({ id: "ast_new_1" });

      const formData = new FormData();
      formData.set("title", "Valid German Digital Bank");
      formData.set("summary", "Fully operational bank license with passporting.");
      formData.set("description", "Complete tech stack, operational tier 1 core banking, active client base.");
      formData.set("country", "Germany");
      formData.set("licenseType", "BANKING");
      formData.set("businessType", "BANK");
      formData.set("businessStatus", "OPERATING");
      formData.set("priceMode", "FIXED");
      formData.set("askingPrice", "5000000");
      formData.set("currency", "EUR");
      formData.set("features", "SEPA, SWIFT, Core Banking");
      formData.set("status", "PUBLISHED");

      const result = await createAssetAction(null, formData);
      expect(result.success).toBe(true);
      expect(result.assetId).toBe("ast_new_1");
      expect(prismaMock.asset.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sellerId: "seller_1",
            title: "Valid German Digital Bank",
            priceMode: "FIXED",
            currency: "EUR",
            features: ["SEPA", "SWIFT", "Core Banking"],
            status: "PUBLISHED",
          }),
        })
      );
      expect(revalidatePathMock).toHaveBeenCalledWith("/seller/assets");
    });
  });

  describe("updateAssetAction", () => {
    it("fails when asset is not found", async () => {
      prismaMock.asset.findUnique.mockResolvedValue(null);
      const formData = new FormData();

      const result = await updateAssetAction("non_existent", null, formData);
      expect(result.success).toBe(false);
      expect(result.errors?._form?.[0]).toContain("Asset not found");
    });

    it("asserts ownership and rejects non-owners", async () => {
      prismaMock.asset.findUnique.mockResolvedValue({
        id: "ast_1",
        sellerId: "another_seller",
        status: "DRAFT",
      });
      guardMock.assertOwnership.mockImplementation(() => {
        throw new Error("Forbidden: user is not the owner");
      });

      const formData = new FormData();
      await expect(updateAssetAction("ast_1", null, formData)).rejects.toThrow("Forbidden");
    });

    it("blocks editing if asset is SUSPENDED by moderation", async () => {
      prismaMock.asset.findUnique.mockResolvedValue({
        id: "ast_suspended",
        sellerId: "seller_1",
        status: "SUSPENDED",
      });

      const formData = new FormData();
      const result = await updateAssetAction("ast_suspended", null, formData);
      expect(result.success).toBe(false);
      expect(result.errors?._form?.[0]).toContain("suspended or removed");
      expect(prismaMock.asset.update).not.toHaveBeenCalled();
    });

    it("updates asset with valid data", async () => {
      prismaMock.asset.findUnique.mockResolvedValue({
        id: "ast_1",
        sellerId: "seller_1",
        status: "DRAFT",
      });
      prismaMock.asset.update.mockResolvedValue({ id: "ast_1" });

      const formData = new FormData();
      formData.set("title", "Updated Bank Title");
      formData.set("summary", "Updated summary with enough characters.");
      formData.set("description", "Updated detailed description of the asset being offered.");
      formData.set("country", "Cyprus");
      formData.set("licenseType", "BROKERAGE");
      formData.set("businessType", "BROKERAGE");
      formData.set("businessStatus", "OPERATING");
      formData.set("priceMode", "NDA");
      formData.set("status", "PUBLISHED");

      const result = await updateAssetAction("ast_1", null, formData);
      expect(result.success).toBe(true);
      expect(prismaMock.asset.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "ast_1" },
          data: expect.objectContaining({
            title: "Updated Bank Title",
            country: "Cyprus",
            priceMode: "NDA",
          }),
        })
      );
    });
  });

  describe("toggleAssetStatusAction", () => {
    it("toggles DRAFT to PUBLISHED", async () => {
      prismaMock.asset.findUnique.mockResolvedValue({
        id: "ast_1",
        sellerId: "seller_1",
        status: "DRAFT",
      });

      const result = await toggleAssetStatusAction("ast_1");
      expect(result.success).toBe(true);
      expect(prismaMock.asset.update).toHaveBeenCalledWith({
        where: { id: "ast_1" },
        data: { status: "PUBLISHED" },
      });
    });

    it("blocks toggle if asset is SUSPENDED", async () => {
      prismaMock.asset.findUnique.mockResolvedValue({
        id: "ast_susp",
        sellerId: "seller_1",
        status: "SUSPENDED",
      });

      const result = await toggleAssetStatusAction("ast_susp");
      expect(result.success).toBe(false);
      expect(result.errors?._form?.[0]).toContain("suspended");
      expect(prismaMock.asset.update).not.toHaveBeenCalled();
    });
  });

  describe("removeAssetAction", () => {
    it("soft deletes asset by setting status to REMOVED", async () => {
      prismaMock.asset.findUnique.mockResolvedValue({
        id: "ast_1",
        sellerId: "seller_1",
        status: "DRAFT",
      });

      const result = await removeAssetAction("ast_1");
      expect(result.success).toBe(true);
      expect(prismaMock.asset.update).toHaveBeenCalledWith({
        where: { id: "ast_1" },
        data: { status: "REMOVED" },
      });
    });
  });

  describe("toggleFavoriteAction", () => {
    it("adds asset to favorites when not previously favorited", async () => {
      prismaMock.asset.findUnique.mockResolvedValue({
        id: "ast_1",
        status: "PUBLISHED",
        seller: { status: "ACTIVE" },
      });
      prismaMock.favorite.findUnique.mockResolvedValue(null);
      prismaMock.favorite.create.mockResolvedValue({
        userId: "seller_1",
        assetId: "ast_1",
      });

      const res = await toggleFavoriteAction("ast_1");
      expect(res.success).toBe(true);
      expect(res.isFavorite).toBe(true);
      expect(prismaMock.favorite.create).toHaveBeenCalledWith({
        data: { userId: "seller_1", assetId: "ast_1" },
      });
    });

    it("removes asset from favorites when already favorited", async () => {
      prismaMock.asset.findUnique.mockResolvedValue({
        id: "ast_1",
        status: "PUBLISHED",
        seller: { status: "ACTIVE" },
      });
      prismaMock.favorite.findUnique.mockResolvedValue({
        userId: "seller_1",
        assetId: "ast_1",
      });
      prismaMock.favorite.delete.mockResolvedValue({
        userId: "seller_1",
        assetId: "ast_1",
      });

      const res = await toggleFavoriteAction("ast_1");
      expect(res.success).toBe(true);
      expect(res.isFavorite).toBe(false);
      expect(prismaMock.favorite.delete).toHaveBeenCalledWith({
        where: {
          userId_assetId: { userId: "seller_1", assetId: "ast_1" },
        },
      });
    });

    it("rejects favorite toggle if asset is not published", async () => {
      prismaMock.asset.findUnique.mockResolvedValue({
        id: "ast_draft",
        status: "DRAFT",
        seller: { status: "ACTIVE" },
      });

      const res = await toggleFavoriteAction("ast_draft");
      expect(res.success).toBe(false);
      expect(res.error).toBe("Asset not available.");
      expect(prismaMock.favorite.create).not.toHaveBeenCalled();
    });
  });
});

