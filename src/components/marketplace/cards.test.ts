import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AssetCard, BuyerCard } from "./index";

describe("marketplace cards", () => {
  describe("AssetCard", () => {
    it("renders full spec-grid, country, and validated badge", () => {
      const html = renderToStaticMarkup(
        React.createElement(AssetCard, {
          asset: {
            id: "ast_1",
            title: "Operating EMI Institution in Lithuania",
            summary: "Established Lithuanian EMI with operational SEPA direct debits and swift codes.",
            country: "Lithuania",
            licenseType: "E_MONEY",
            businessType: "FINTECH",
            businessStatus: "OPERATING",
            askingPrice: 2850000,
            currency: "EUR",
            features: ["Direct SEPA", "SWIFT", "Card issuance"],
            validated: true,
          },
        })
      );

      expect(html).toContain("Operating EMI Institution in Lithuania");
      expect(html).toContain("Lithuania");
      expect(html).toContain("E-Money / EMI");
      expect(html).toContain("Fintech");
      expect(html).toContain("Validated");
      expect(html).toContain("EUR");
      expect(html).toContain("2,850,000");
    });

    it("handles empty price, 150-char long title, and 7 feature chips without breaking (Criterion 1)", () => {
      // Acceptance criterion: "Карточка не разъезжается при пустой цене, длинном названии и семи чипах"
      const longTitle = "A".repeat(150);
      const sevenFeatures = [
        "Feature 1",
        "Feature 2",
        "Feature 3",
        "Feature 4",
        "Feature 5",
        "Feature 6",
        "Feature 7",
      ];

      const html = renderToStaticMarkup(
        React.createElement(AssetCard, {
          asset: {
            id: "ast_stress",
            title: longTitle,
            summary: "Stress test summary with empty price and many chips.",
            country: "United Kingdom",
            licenseType: "PAYMENT",
            businessType: "FINTECH",
            businessStatus: "OPERATING",
            askingPrice: null, // Empty price
            priceMode: "FIXED",
            currency: "USD",
            features: sevenFeatures,
            validated: false,
          },
          maxFeatures: 2,
        })
      );

      // Empty price displays graceful fallback
      expect(html).toContain("Price on request");
      // Title is rendered
      expect(html).toContain(longTitle);
      // First 2 features shown
      expect(html).toContain("Feature 1");
      expect(html).toContain("Feature 2");
      // +5 more overflow chip is shown
      expect(html).toContain("+5 more");
      // Validated badge is omitted when false
      expect(html).not.toContain("Validated");
    });

    it("displays Upon LOI and Under NDA modes cleanly", () => {
      const loiHtml = renderToStaticMarkup(
        React.createElement(AssetCard, {
          asset: {
            id: "ast_loi",
            title: "Private Bank in Switzerland",
            summary: "Established bank.",
            country: "Switzerland",
            licenseType: "BANKING",
            businessType: "BANK",
            businessStatus: "OPERATING",
            priceMode: "ON_LOI",
          },
        })
      );
      expect(loiHtml).toContain("Upon LOI");

      const ndaHtml = renderToStaticMarkup(
        React.createElement(AssetCard, {
          asset: {
            id: "ast_nda",
            title: "Crypto Custody Broker",
            summary: "Custody broker.",
            country: "Estonia",
            licenseType: "CRYPTO",
            businessType: "FINTECH",
            businessStatus: "OPERATING",
            priceMode: "NDA",
          },
        })
      );
      expect(ndaHtml).toContain("Under NDA");
    });
  });

  describe("BuyerCard", () => {
    it("renders buyer details, ticket range badge, and thesis", () => {
      const html = renderToStaticMarkup(
        React.createElement(BuyerCard, {
          buyer: {
            id: "byr_1",
            name: "Elena Rostova",
            company: "Nordic Capital Partners",
            country: "Sweden",
            thesis: "Seeking European EMI licenses with active Tier-1 correspondent banking.",
            ticketMin: 1000000,
            ticketMax: 5000000,
            currency: "EUR",
            targetCountries: ["Lithuania", "Malta", "Cyprus", "Ireland"],
            targetLicenseTypes: ["E_MONEY", "PAYMENT"],
          },
        })
      );

      expect(html).toContain("Nordic Capital Partners");
      expect(html).toContain("Elena Rostova");
      expect(html).toContain("Sweden");
      expect(html).toContain("EUR");
      expect(html).toContain("1,000,000");
      expect(html).toContain("5,000,000");
      expect(html).toContain("Seeking European EMI licenses");
      expect(html).toContain("Lithuania");
      expect(html).toContain("+1"); // 4 countries, 3 shown, +1 overflow
      expect(html).toContain("Send deal memo");
    });

    it("handles missing thesis and flexible ticket without crashing", () => {
      const html = renderToStaticMarkup(
        React.createElement(BuyerCard, {
          buyer: {
            id: "byr_flex",
            name: "Anonymous Fund",
            company: "Apex Ventures",
            country: "United States",
            thesis: null, // Null thesis
            ticketMin: null,
            ticketMax: null,
          },
        })
      );

      expect(html).toContain("Apex Ventures");
      expect(html).toContain("Flexible ticket");
      expect(html).toContain("Actively seeking strategic financial licenses"); // fallback thesis
    });
  });
});
