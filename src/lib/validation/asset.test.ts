import { describe, expect, it } from "vitest";
import { assetFormSchema } from "./asset";

describe("assetFormSchema", () => {
  const validBase = {
    title: "European EMI & Payment Hub",
    summary: "Fully authorized Electronic Money Institution with SEPA Direct Debit access.",
    description: "Operates with passporting rights across all EEA member states, fully compliant AML/CFT framework, robust tier-1 banking rails.",
    country: "Lithuania",
    licenseType: "E_MONEY",
    businessType: "PAYMENT_INSTITUTION",
    businessStatus: "OPERATING",
    yearOfIssue: 2021,
    employees: 12,
    regulator: "Bank of Lithuania",
    features: ["SEPA Instant", "Mastercard Principal Member"],
    status: "DRAFT",
  };

  describe("FIXED price mode", () => {
    it("accepts valid fixed price payload", () => {
      const result = assetFormSchema.safeParse({
        ...validBase,
        priceMode: "FIXED",
        askingPrice: 2500000,
        currency: "EUR",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.askingPrice).toBe(2500000);
        expect(result.data.currency).toBe("EUR");
      }
    });

    it("coerces string number to number for askingPrice", () => {
      const result = assetFormSchema.safeParse({
        ...validBase,
        priceMode: "FIXED",
        askingPrice: "1850000",
        currency: "USD",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.askingPrice).toBe(1850000);
      }
    });

    it("rejects 0 or negative asking price", () => {
      const zeroResult = assetFormSchema.safeParse({
        ...validBase,
        priceMode: "FIXED",
        askingPrice: 0,
      });
      expect(zeroResult.success).toBe(false);

      const negResult = assetFormSchema.safeParse({
        ...validBase,
        priceMode: "FIXED",
        askingPrice: -1000,
      });
      expect(negResult.success).toBe(false);
    });

    it("rejects missing asking price", () => {
      const result = assetFormSchema.safeParse({
        ...validBase,
        priceMode: "FIXED",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ON_LOI price mode", () => {
    it("accepts payload with null or omitted askingPrice", () => {
      const result = assetFormSchema.safeParse({
        ...validBase,
        priceMode: "ON_LOI",
        askingPrice: null,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.askingPrice).toBeNull();
      }
    });

    it("converts empty string askingPrice to null", () => {
      const result = assetFormSchema.safeParse({
        ...validBase,
        priceMode: "ON_LOI",
        askingPrice: "",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.askingPrice).toBeNull();
      }
    });

    it("rejects non-null numeric askingPrice in ON_LOI mode", () => {
      const result = assetFormSchema.safeParse({
        ...validBase,
        priceMode: "ON_LOI",
        askingPrice: 500000,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("NDA price mode", () => {
    it("accepts payload with null or undefined askingPrice", () => {
      const result = assetFormSchema.safeParse({
        ...validBase,
        priceMode: "NDA",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.askingPrice).toBeNull();
      }
    });

    it("rejects non-null numeric askingPrice in NDA mode", () => {
      const result = assetFormSchema.safeParse({
        ...validBase,
        priceMode: "NDA",
        askingPrice: 1200000,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Field constraints", () => {
    it("rejects too short title and summary", () => {
      const result = assetFormSchema.safeParse({
        ...validBase,
        priceMode: "FIXED",
        askingPrice: 100000,
        title: "AB",
        summary: "Too short",
      });
      expect(result.success).toBe(false);
    });

    it("parses comma-separated features string into array", () => {
      const result = assetFormSchema.safeParse({
        ...validBase,
        priceMode: "FIXED",
        askingPrice: 100000,
        features: "API Ready, Tier 1 Banking, SWIFT",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.features).toEqual(["API Ready", "Tier 1 Banking", "SWIFT"]);
      }
    });

    it("converts empty string optional numeric fields to null", () => {
      const result = assetFormSchema.safeParse({
        ...validBase,
        priceMode: "FIXED",
        askingPrice: 100000,
        yearOfIssue: "",
        employees: "",
        regulator: "",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.yearOfIssue).toBeNull();
        expect(result.data.employees).toBeNull();
        expect(result.data.regulator).toBeNull();
      }
    });
  });
});
