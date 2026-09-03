import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  parseSearchQueryDeterministic,
  parseSearchQuery,
} from "./query-parser";
import { clearOpenRouterCache } from "./openrouter";

describe("Natural Language Query Parser", () => {
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

  describe("Deterministic Fallback (N5B-84)", () => {
    it("extracts country, license type, and price envelope from natural phrases", () => {
      const result = parseSearchQueryDeterministic("payment licence in Brazil under 5M");

      expect(result.country).toBe("Brazil");
      expect(result.licenseType).toBe("PAYMENT");
      expect(result.price).toBe("1m_5m");
      expect(result.confidence).toBe("high");
      expect(result.engine).toBe("rule");
    });

    it("parses European banking charters and statuses accurately", () => {
      const result = parseSearchQueryDeterministic("operating bank in Germany");

      expect(result.country).toBe("Germany");
      expect(result.licenseType).toBe("BANKING");
      expect(result.businessStatus).toBe("OPERATING");
      expect(result.engine).toBe("rule");
    });

    it("parses crypto VASP in Lithuania under 1M", () => {
      const result = parseSearchQueryDeterministic("crypto VASP in Lithuania under 1M");

      expect(result.country).toBe("Lithuania");
      expect(result.licenseType).toBe("CRYPTO");
      expect(result.price).toBe("under_1m");
    });

    it("gives an honest 'not understood' response for nonsense or gibberish without fabricating filters", () => {
      const result = parseSearchQueryDeterministic("asdfghjkl qwert");

      expect(result.confidence).toBe("none");
      expect(result.country).toBeUndefined();
      expect(result.licenseType).toBeUndefined();
      expect(result.price).toBeUndefined();
      expect(result.explanation).toContain("Could not interpret search terms");
    });

    it("treats unclassified text terms as standard keyword search", () => {
      const result = parseSearchQueryDeterministic("revolving credit facility");

      expect(result.q).toBe("revolving credit facility");
      expect(result.confidence).toBe("medium");
      expect(result.country).toBeUndefined();
    });
  });

  describe("OpenRouter AI Integration & Fallback (N5B-99, N5B-84)", () => {
    it("uses OpenRouter structured output when key is configured", async () => {
      process.env.OPENROUTER_API_KEY = "sk-or-valid-key";

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  country: "Brazil",
                  licenseType: "PAYMENT",
                  price: "1m_5m",
                  confidence: "high",
                  explanation: "Matched Payment license in Brazil with budget up to $5M.",
                }),
              },
            },
          ],
        }),
      } as Response);

      const result = await parseSearchQuery("payment licence in Brazil under 5M");

      expect(result.engine).toBe("ai");
      expect(result.country).toBe("Brazil");
      expect(result.licenseType).toBe("PAYMENT");
      expect(result.price).toBe("1m_5m");
      expect(result.confidence).toBe("high");
    });

    it("returns honest 'none' confidence when AI flags nonsense query", async () => {
      process.env.OPENROUTER_API_KEY = "sk-or-valid-key";

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  confidence: "none",
                  explanation: "The query does not describe any financial asset criteria.",
                }),
              },
            },
          ],
        }),
      } as Response);

      const result = await parseSearchQuery("banana spaceship rainbow 123");

      expect(result.confidence).toBe("none");
      expect(result.country).toBeUndefined();
      expect(result.licenseType).toBeUndefined();
    });

    it("gracefully degrades to deterministic parser when network fails", async () => {
      process.env.OPENROUTER_API_KEY = "sk-or-valid-key";

      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Connection refused"));

      const result = await parseSearchQuery("crypto in Lithuania");

      expect(result.engine).toBe("rule");
      expect(result.country).toBe("Lithuania");
      expect(result.licenseType).toBe("CRYPTO");
    });
  });
});
