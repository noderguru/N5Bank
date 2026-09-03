import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getMatchesForBuyer } from "./matching";
import { clearOpenRouterCache } from "./openrouter";
import type { Asset, BuyerProfile } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

describe("Buyer Asset Matching Service", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    clearOpenRouterCache();
    process.env = { ...originalEnv };
    delete process.env.OPENROUTER_API_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  const baseBuyer: BuyerProfile = {
    userId: "buyer-1",
    company: "Apex Capital Partners",
    country: "United Kingdom",
    bio: "Global fintech growth fund",
    thesis: "Acquiring regulated payment rails and EMIs across Western Europe",
    ticketMin: new Decimal(1_000_000),
    ticketMax: new Decimal(5_000_000),
    currency: "USD",
    targetCountries: ["United Kingdom", "Lithuania"],
    targetLicenseTypes: ["PAYMENT", "E_MONEY"],
    targetBusinessTypes: ["PAYMENT_INSTITUTION", "FINTECH"],
    horizon: "MEDIUM_TERM",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const assetUK: Asset = {
    id: "asset-uk",
    sellerId: "seller-1",
    title: "UK EMI Institution",
    summary: "Authorized electronic money institution with direct Faster Payments",
    description: "Detailed description",
    country: "United Kingdom",
    licenseType: "E_MONEY",
    businessType: "PAYMENT_INSTITUTION",
    businessStatus: "OPERATING",
    askingPrice: new Decimal(3_500_000),
    priceMode: "FIXED",
    currency: "USD",
    yearOfIssue: 2020,
    employees: 12,
    regulator: "FCA",
    features: ["SEPA", "Faster Payments"],
    status: "PUBLISHED",
    validated: true,
    views: 45,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const assetCyprus: Asset = {
    id: "asset-cyprus",
    sellerId: "seller-2",
    title: "Cyprus CIF Brokerage",
    summary: "CySEC regulated investment firm",
    description: "Detailed description",
    country: "Cyprus",
    licenseType: "BROKERAGE",
    businessType: "BROKERAGE",
    businessStatus: "OPERATING",
    askingPrice: new Decimal(2_000_000),
    priceMode: "FIXED",
    currency: "USD",
    yearOfIssue: 2019,
    employees: 8,
    regulator: "CySEC",
    features: ["MetaTrader 5"],
    status: "PUBLISHED",
    validated: true,
    views: 120,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const assetLithuania: Asset = {
    id: "asset-lt",
    sellerId: "seller-3",
    title: "Lithuanian Payment Charter",
    summary: "BoL authorized payment institution with SEPA Instant access",
    description: "Detailed BoL info",
    country: "Lithuania",
    licenseType: "PAYMENT",
    businessType: "FINTECH",
    businessStatus: "OPERATING",
    askingPrice: new Decimal(4_200_000),
    priceMode: "FIXED",
    currency: "USD",
    yearOfIssue: 2021,
    employees: 15,
    regulator: "Bank of Lithuania",
    features: ["SEPA Instant", "CENTROlink"],
    status: "PUBLISHED",
    validated: true,
    views: 88,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("ranks matching opportunities deterministically and differentiates scores", async () => {
    const result = await getMatchesForBuyer(baseBuyer, [assetCyprus, assetUK, assetLithuania]);

    expect(result.engine).toBe("rule");
    expect(result.totalEvaluated).toBe(3);
    // UK and Lithuania match target countries, license and business models, Cyprus does not
    expect(result.matches.length).toBeGreaterThanOrEqual(2);

    const first = result.matches[0];
    const second = result.matches[1];

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(first!.matchScore).toBeGreaterThanOrEqual(second!.matchScore);
    expect(first!.matchScore).toBe(100);
    expect(first!.asset.id).toBe("asset-uk");
    expect(first!.matchReasons.length).toBeGreaterThan(0);
  });

  it("updates ranking order when buyer mandate profile changes", async () => {
    // Modify mandate to target Brokerage in Cyprus
    const brokerageBuyer: BuyerProfile = {
      ...baseBuyer,
      targetCountries: ["Cyprus"],
      targetLicenseTypes: ["BROKERAGE"],
      targetBusinessTypes: ["BROKERAGE"],
    };

    const result = await getMatchesForBuyer(brokerageBuyer, [assetUK, assetCyprus, assetLithuania]);

    expect(result.matches[0]!.asset.id).toBe("asset-cyprus");
    expect(result.matches[0]!.matchScore).toBe(100);
  });

  it("enriches matches with AI thesis explanation when OpenRouter is configured", async () => {
    process.env.OPENROUTER_API_KEY = "sk-or-test-key-valid";

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                matches: [
                  {
                    assetId: "asset-uk",
                    aiExplanation:
                      "Directly secures the buyer's UK cross-border settlement goals with active FCA charter.",
                  },
                ],
              }),
            },
          },
        ],
      }),
    } as Response);

    const result = await getMatchesForBuyer(baseBuyer, [assetUK]);

    expect(result.engine).toBe("ai");
    expect(result.matches[0]!.aiExplanation).toContain("FCA charter");
    expect(result.matches[0]!.engine).toBe("ai");
  });

  it("falls back to rule engine if AI call fails or times out", async () => {
    process.env.OPENROUTER_API_KEY = "sk-or-test-key-valid";

    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network connection reset"));

    const result = await getMatchesForBuyer(baseBuyer, [assetUK]);

    expect(result.engine).toBe("rule");
    expect(result.matches[0]!.matchScore).toBe(100);
    expect(result.matches[0]!.engine).toBe("rule");
  });
});
