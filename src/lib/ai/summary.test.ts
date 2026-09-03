import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  auditAssetCompleteness,
  generateDeterministicSummary,
  generateAssetSummary,
} from "./summary";
import { clearOpenRouterCache } from "./openrouter";

describe("Asset Listing Completeness Audit & Summary Generator", () => {
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

  describe("Completeness Audit Heuristics (Rule-based)", () => {
    it("flags missing regulator, missing year, short description, and missing features", () => {
      const warnings = auditAssetCompleteness({
        title: "Test EMI",
        country: "Lithuania",
        licenseType: "E_MONEY",
        businessType: "FINTECH",
        description: "Too short", // < 80 chars
        regulator: "",
        yearOfIssue: null,
        features: "",
      });

      expect(warnings).toHaveLength(4);
      expect(warnings.some((w) => w.field === "regulator")).toBe(true);
      expect(warnings.some((w) => w.field === "yearOfIssue")).toBe(true);
      expect(warnings.some((w) => w.field === "description")).toBe(true);
      expect(warnings.some((w) => w.field === "features")).toBe(true);
    });

    it("returns zero warnings when all professional listing fields are populated", () => {
      const warnings = auditAssetCompleteness({
        title: "Established UK Payment Institution",
        country: "United Kingdom",
        licenseType: "PAYMENT",
        businessType: "PAYMENT_INSTITUTION",
        description:
          "Authorized Payment Institution under the FCA with Tier 1 clearing accounts, active safeguarding, and complete AML compliance frameworks.",
        regulator: "FCA",
        yearOfIssue: "2019",
        features: "SEPA, Faster Payments, SWIFT",
      });

      expect(warnings).toHaveLength(0);
    });
  });

  describe("Deterministic Summary Generation", () => {
    it("produces structured institutional summary from raw fields", () => {
      const summary = generateDeterministicSummary({
        title: "Lithuanian EMI",
        country: "Lithuania",
        licenseType: "E_MONEY",
        businessType: "FINTECH",
        regulator: "Bank of Lithuania",
        yearOfIssue: 2021,
        features: "SEPA Instant, CENTROlink",
      });

      expect(summary).toContain("E Money institution operating from Lithuania");
      expect(summary).toContain("Bank of Lithuania regulatory supervision");
      expect(summary).toContain("charter issued 2021");
      expect(summary).toContain("SEPA Instant, CENTROlink");
    });
  });

  describe("OpenRouter AI Summary Integration & Fallback", () => {
    it("drafts summary with AI when OpenRouter is active", async () => {
      process.env.OPENROUTER_API_KEY = "sk-or-valid-key";

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  summary:
                    "FCA-authorized UK Payment Institution with direct Faster Payments and established European correspondent banking.",
                }),
              },
            },
          ],
        }),
      } as Response);

      const result = await generateAssetSummary({
        title: "UK PI",
        country: "United Kingdom",
        licenseType: "PAYMENT",
        businessType: "PAYMENT_INSTITUTION",
      });

      expect(result.engine).toBe("ai");
      expect(result.summary).toContain("Faster Payments");
    });

    it("falls back to deterministic template when OpenRouter fails", async () => {
      process.env.OPENROUTER_API_KEY = "sk-or-valid-key";

      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Timeout"));

      const result = await generateAssetSummary({
        title: "German Bank",
        country: "Germany",
        licenseType: "BANKING",
        businessType: "BANK",
        regulator: "BaFin",
      });

      expect(result.engine).toBe("rule");
      expect(result.summary).toContain("Banking institution operating from Germany");
      expect(result.summary).toContain("BaFin regulatory supervision");
    });
  });
});
