import { describe, it, expect } from "vitest";
import {
  scoreAssetMatch,
  MATCH_WEIGHTS,
  type BuyerMandateCriteria,
  type AssetMatchingAttributes,
} from "./scorer";

describe("Deterministic Buyer ↔ Asset Matching Scorer", () => {
  const perfectBuyer: BuyerMandateCriteria = {
    targetCountries: ["United Kingdom", "Lithuania"],
    targetLicenseTypes: ["PAYMENT", "E_MONEY"],
    targetBusinessTypes: ["PAYMENT_INSTITUTION", "FINTECH"],
    ticketMin: 1_000_000,
    ticketMax: 5_000_000,
    currency: "USD",
  };

  const perfectAsset: AssetMatchingAttributes = {
    country: "United Kingdom",
    licenseType: "PAYMENT",
    businessType: "PAYMENT_INSTITUTION",
    askingPrice: 2_500_000,
    priceMode: "FIXED",
    currency: "USD",
    title: "Established UK Payment Institution",
    summary: "Fully authorized EMI/PI with SEPA and Faster Payments access",
  };

  it("produces a 100% score and complete human-readable explanations on full match", () => {
    const result = scoreAssetMatch(perfectBuyer, perfectAsset);

    expect(result.score).toBe(100);
    expect(result.breakdown.licenseScore).toBe(MATCH_WEIGHTS.LICENSE_TYPE);
    expect(result.breakdown.jurisdictionScore).toBe(MATCH_WEIGHTS.JURISDICTION);
    expect(result.breakdown.businessTypeScore).toBe(MATCH_WEIGHTS.BUSINESS_TYPE);
    expect(result.breakdown.ticketScore).toBe(MATCH_WEIGHTS.TICKET_ENVELOPE);

    expect(result.reasons).toHaveLength(4);
    expect(result.reasons[0]).toContain("Matches required license charter");
    expect(result.reasons[1]).toContain("Located in target jurisdiction (United Kingdom)");
    expect(result.reasons[2]).toContain("Fits target business model");
    expect(result.reasons[3]).toContain("fits your budget");
  });

  it("produces a 0 score and empty match reasons on complete mismatch", () => {
    const mismatchAsset: AssetMatchingAttributes = {
      country: "Singapore",
      licenseType: "CRYPTO",
      businessType: "CRYPTO_BUSINESS",
      askingPrice: 15_000_000, // far above 5M budget
      priceMode: "FIXED",
      currency: "USD",
      title: "Singapore Digital Asset Exchange",
      summary: "MAS MPI crypto exchange",
    };

    const result = scoreAssetMatch(perfectBuyer, mismatchAsset);

    expect(result.score).toBe(0);
    expect(result.breakdown.licenseScore).toBe(0);
    expect(result.breakdown.jurisdictionScore).toBe(0);
    expect(result.breakdown.businessTypeScore).toBe(0);
    expect(result.breakdown.ticketScore).toBe(0);
    expect(result.reasons).toHaveLength(0);
  });

  it("calculates partial matches accurately and differentiates scores", () => {
    // Matches jurisdiction and license, but different business type and over budget by 10%
    const partialAsset: AssetMatchingAttributes = {
      country: "Lithuania",
      licenseType: "E_MONEY",
      businessType: "BANK", // not in target
      askingPrice: 5_500_000, // 10% over 5M ceiling (eligible for tolerance points)
      priceMode: "FIXED",
      currency: "USD",
      title: "Lithuanian Specialized Bank",
      summary: "Full banking charter in Vilnius",
    };

    const result = scoreAssetMatch(perfectBuyer, partialAsset);

    // 35 (license) + 30 (country) + 0 (business) + 8 (within 20% over budget) = 73
    expect(result.score).toBe(73);
    expect(result.breakdown.licenseScore).toBe(35);
    expect(result.breakdown.jurisdictionScore).toBe(30);
    expect(result.breakdown.businessTypeScore).toBe(0);
    expect(result.breakdown.ticketScore).toBe(8);

    expect(result.reasons.some((r) => r.includes("E Money"))).toBe(true);
    expect(result.reasons.some((r) => r.includes("Lithuania"))).toBe(true);
    expect(result.reasons.some((r) => r.includes("20% negotiable range"))).toBe(true);
  });

  it("is strictly deterministic: identical inputs yield identical outputs across repeated calls", () => {
    const run1 = scoreAssetMatch(perfectBuyer, perfectAsset);
    for (let i = 0; i < 50; i++) {
      const runN = scoreAssetMatch(perfectBuyer, perfectAsset);
      expect(runN.score).toBe(run1.score);
      expect(runN.reasons).toEqual(run1.reasons);
      expect(runN.breakdown).toEqual(run1.breakdown);
    }
  });

  it("formats reasons with human-friendly text rather than raw enum tokens or identifiers", () => {
    const asset: AssetMatchingAttributes = {
      country: "United Kingdom",
      licenseType: "E_MONEY",
      businessType: "PAYMENT_INSTITUTION",
      priceMode: "ON_LOI",
      currency: "USD",
    };

    const result = scoreAssetMatch(perfectBuyer, asset);
    for (const reason of result.reasons) {
      // Must not contain raw unformatted enum keys
      expect(reason).not.toContain("E_MONEY");
      expect(reason).not.toContain("PAYMENT_INSTITUTION");
      expect(reason).not.toContain("targetLicenseTypes");
      expect(reason).not.toContain("targetCountries");
    }
    expect(result.reasons.some((r) => r.includes("Letter of Intent (LOI)"))).toBe(true);
  });

  it("handles NDA confidential pricing mode gracefully", () => {
    const asset: AssetMatchingAttributes = {
      country: "United Kingdom",
      licenseType: "PAYMENT",
      businessType: "PAYMENT_INSTITUTION",
      priceMode: "NDA",
      currency: "USD",
    };

    const result = scoreAssetMatch(perfectBuyer, asset);
    expect(result.breakdown.ticketScore).toBe(12);
    expect(result.reasons.some((r) => r.includes("Confidential pricing subject to NDA review"))).toBe(true);
  });

  it("gracefully assigns neutral baseline scores for open/unconstrained buyer mandates", () => {
    const openBuyer: BuyerMandateCriteria = {
      targetCountries: [],
      targetLicenseTypes: [],
      targetBusinessTypes: [],
      ticketMin: null,
      ticketMax: null,
    };

    const result = scoreAssetMatch(openBuyer, perfectAsset);
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(100);
  });
});
