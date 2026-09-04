import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatPrice,
  formatDate,
  formatDateTime,
  formatNumber,
  formatTicketRange,
  formatLicenseType,
  formatEnum,
} from "./formatters";

describe("Intl formatters (N5B-89)", () => {
  describe("formatCurrency", () => {
    it("formats amounts with explicit currency code (USD, EUR, GBP)", () => {
      const formattedUsd = formatCurrency(5000000, "USD", "en-US");
      expect(formattedUsd).toContain("USD");
      expect(formattedUsd).toContain("5,000,000");

      const formattedEur = formatCurrency(2500000, "EUR", "en-US");
      expect(formattedEur).toContain("EUR");
      expect(formattedEur).toContain("2,500,000");
    });

    it("formats amounts correctly across different locales (uk-UA, ru-RU)", () => {
      const formattedUk = formatCurrency(5000000, "USD", "uk-UA");
      expect(formattedUk).toContain("USD");
      // Ukrainian locale formats 5 000 000 with non-breaking space
      expect(formattedUk.replace(/\s+/g, " ")).toMatch(/5\s000\s000/);

      const formattedRu = formatCurrency(2500000, "EUR", "ru-RU");
      expect(formattedRu).toContain("EUR");
      expect(formattedRu.replace(/\s+/g, " ")).toMatch(/2\s500\s000/);
    });

    it("supports custom translated labels", () => {
      const ukLabels = {
        onRequest: "Ціна за запитом",
        uponLoi: "За LOI",
        underNda: "Під NDA",
      };
      expect(formatCurrency(null, "USD", "uk-UA", ukLabels)).toBe("Ціна за запитом");
      expect(formatPrice(null, "ON_LOI", "USD", "uk-UA", ukLabels)).toBe("За LOI");
      expect(formatPrice(null, "NDA", "USD", "uk-UA", ukLabels)).toBe("Під NDA");
    });

    it("supports string amounts", () => {
      const formatted = formatCurrency("1250000", "USD", "en-US");
      expect(formatted).toContain("USD");
      expect(formatted).toContain("1,250,000");
    });

    it("returns 'Price on request' for null, undefined, empty, or NaN", () => {
      expect(formatCurrency(null)).toBe("Price on request");
      expect(formatCurrency(undefined)).toBe("Price on request");
      expect(formatCurrency("")).toBe("Price on request");
      expect(formatCurrency("invalid_number")).toBe("Price on request");
    });

    it("handles non-standard currency codes gracefully via fallback", () => {
      const formatted = formatCurrency(1000, "XYZFAKE", "en-US");
      expect(formatted).toContain("XYZFAKE");
      expect(formatted).toContain("1,000");
    });
  });

  describe("formatPrice", () => {
    it("returns Upon LOI when mode is ON_LOI", () => {
      expect(formatPrice(5000000, "ON_LOI")).toBe("Upon LOI");
    });

    it("returns Under NDA when mode is NDA", () => {
      expect(formatPrice(5000000, "NDA")).toBe("Under NDA");
    });

    it("formats currency when mode is FIXED", () => {
      const res = formatPrice(5000000, "FIXED", "USD", "en-US");
      expect(res).toContain("USD");
      expect(res).toContain("5,000,000");
    });
  });

  describe("formatDate and formatDateTime", () => {
    const testDate = new Date("2026-09-03T12:00:00.000Z");

    it("formats valid dates using Intl", () => {
      const formatted = formatDate(testDate, "en-US");
      expect(formatted).toContain("2026");
      expect(formatted).toContain("Sep");
    });

    it("formats valid datetime using Intl with hours and minutes", () => {
      const formatted = formatDateTime(testDate, "en-US", { timeZone: "UTC" });
      expect(formatted).toContain("2026");
      expect(formatted).toContain("12:00");
    });

    it("returns dash for null, undefined or invalid date", () => {
      expect(formatDate(null)).toBe("—");
      expect(formatDate(undefined)).toBe("—");
      expect(formatDate("not-a-date")).toBe("—");
    });
  });

  describe("formatNumber", () => {
    it("formats numbers according to locale", () => {
      expect(formatNumber(1234567, "en-US")).toBe("1,234,567");
      expect(formatNumber(null)).toBe("—");
    });
  });

  describe("formatTicketRange", () => {
    it("formats both bounds with explicit currency code", () => {
      const range = formatTicketRange(1000000, 5000000, "USD", "en-US");
      expect(range).toContain("USD");
      expect(range).toContain("1,000,000");
      expect(range).toContain("5,000,000");
    });

    it("handles flexible tickets", () => {
      expect(formatTicketRange(null, null)).toBe("Flexible ticket");
      expect(formatTicketRange(1000000, null, "USD", "en-US")).toContain("From");
      expect(formatTicketRange(null, 5000000, "USD", "en-US")).toContain("Up to");
    });
  });

  describe("formatLicenseType and formatEnum", () => {
    it("formats financial license enums nicely", () => {
      expect(formatLicenseType("E_MONEY")).toBe("E-Money / EMI");
      expect(formatLicenseType("BANKING")).toBe("Banking");
      expect(formatLicenseType("PAYMENT")).toBe("Payment (PI)");
      expect(formatLicenseType("CRYPTO")).toBe("Crypto / VASP");
    });

    it("formats snake_case enum to capitalized words", () => {
      expect(formatEnum("READY_MADE")).toBe("Ready Made");
      expect(formatEnum(null)).toBe("");
    });
  });
});
