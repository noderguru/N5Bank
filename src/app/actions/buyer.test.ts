import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePathMock = vi.hoisted(() => vi.fn());
const guardMock = vi.hoisted(() => ({
  requireRole: vi.fn(),
}));

const prismaMock = vi.hoisted(() => ({
  buyerProfile: {
    upsert: vi.fn(),
    findUnique: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/lib/auth/guard", () => ({
  requireRole: guardMock.requireRole,
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: prismaMock,
}));

import { saveBuyerProfileAction } from "./buyer";

describe("buyer server actions", () => {
  const buyerSession = {
    userId: "usr_buyer_1",
    role: "BUYER" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    guardMock.requireRole.mockResolvedValue(buyerSession);
  });

  describe("saveBuyerProfileAction", () => {
    it("rejects invalid input when ticketMin > ticketMax", async () => {
      const formData = new FormData();
      formData.append("company", "Test Buyer");
      formData.append("country", "Germany");
      formData.append("ticketMin", "10000000");
      formData.append("ticketMax", "5000000");

      const res = await saveBuyerProfileAction(null, formData);
      expect(res.success).toBe(false);
      expect(res.errors?.ticketMax).toBeDefined();
      expect(prismaMock.buyerProfile.upsert).not.toHaveBeenCalled();
    });

    it("successfully upserts buyer profile with valid data", async () => {
      const formData = new FormData();
      formData.append("company", "Northstar Capital");
      formData.append("country", "Lithuania");
      formData.append("thesis", "Acquiring operating fintech charters with SWIFT connectivity.");
      formData.append("ticketMin", "1000000");
      formData.append("ticketMax", "8000000");
      formData.append("currency", "EUR");
      formData.append("targetCountries", "Lithuania");
      formData.append("targetCountries", "Estonia");
      formData.append("targetLicenseTypes", "E_MONEY");
      formData.append("targetBusinessTypes", "FINTECH");
      formData.append("horizon", "SHORT_TERM");

      prismaMock.buyerProfile.upsert.mockResolvedValue({
        userId: "usr_buyer_1",
        company: "Northstar Capital",
      });

      const res = await saveBuyerProfileAction(null, formData);
      expect(res.success).toBe(true);
      expect(res.message).toContain("saved successfully");
      expect(prismaMock.buyerProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "usr_buyer_1" },
          create: expect.objectContaining({
            company: "Northstar Capital",
            country: "Lithuania",
            currency: "EUR",
          }),
        })
      );
      expect(revalidatePathMock).toHaveBeenCalledWith("/buyer");
    });
  });
});
