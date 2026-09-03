import { describe, expect, it } from "vitest";
import { buyerProfileSchema } from "./buyer";

describe("buyerProfileSchema", () => {
  it("validates structured buyer profile with valid ranges", () => {
    const valid = {
      company: "Apex Global Growth Partners",
      country: "United Kingdom",
      bio: "Private equity fund focused on fintech assets.",
      thesis: "Targeting Tier-2 European payment and banking charters with established correspondent relationships.",
      ticketMin: "2000000",
      ticketMax: "15000000",
      currency: "EUR",
      targetCountries: ["United Kingdom", "Germany", "Lithuania"],
      targetLicenseTypes: ["BANKING", "E_MONEY"],
      targetBusinessTypes: ["BANK", "FINTECH"],
      horizon: "MEDIUM_TERM",
    };

    const parsed = buyerProfileSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.ticketMin).toBe(2000000);
      expect(parsed.data.ticketMax).toBe(15000000);
      expect(parsed.data.company).toBe("Apex Global Growth Partners");
    }
  });

  it("rejects when ticketMin is greater than ticketMax", () => {
    const invalid = {
      company: "Inverted Capital",
      country: "Switzerland",
      ticketMin: 10000000,
      ticketMax: 5000000,
    };

    const parsed = buyerProfileSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      expect(fieldErrors.ticketMax?.[0]).toContain("Minimum ticket size cannot exceed maximum ticket size.");
    }
  });

  it("accepts equal ticketMin and ticketMax (fixed ticket)", () => {
    const valid = {
      company: "Exact Match Ltd",
      country: "Singapore",
      ticketMin: 5000000,
      ticketMax: 5000000,
    };

    const parsed = buyerProfileSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("handles null and empty string tickets gracefully", () => {
    const valid = {
      company: "Flexible Capital",
      country: "Cyprus",
      ticketMin: "",
      ticketMax: null,
    };

    const parsed = buyerProfileSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.ticketMin).toBeNull();
      expect(parsed.data.ticketMax).toBeNull();
    }
  });
});
