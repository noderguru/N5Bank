import { describe, expect, it } from "vitest";
import React from "react";
import { renderWithIntl } from "@/lib/render-test";
import { AssetCard } from "./asset-card";
import { BuyerCard } from "./buyer-card";

describe("Marketplace Edge Case Handling (N5B-94)", () => {
  it("renders AssetCard gracefully when price is missing or zero", () => {
    const html = renderWithIntl(
      React.createElement(AssetCard, {
        asset: {
          id: "ast_edge_1",
          title: "Asset Without Price",
          summary: "Summary for incomplete asset",
          country: "Estonia",
          licenseType: "CRYPTO",
          businessType: "CRYPTO_BUSINESS",
          businessStatus: "OPERATING",
          askingPrice: null,
          features: [],
        },
      })
    );

    expect(html).toContain("Price on request");
    expect(html).toContain("Asset Without Price");
  });

  it("renders AssetCard with ON_LOI and CONFIDENTIAL price modes", () => {
    const loiHtml = renderWithIntl(
      React.createElement(AssetCard, {
        asset: {
          id: "ast_loi",
          title: "LOI Charter",
          summary: "Available upon Letter of Intent",
          country: "Lithuania",
          licenseType: "E_MONEY",
          businessType: "FINTECH",
          businessStatus: "OPERATING",
          priceMode: "ON_LOI",
        },
      })
    );
    expect(loiHtml).toContain("Upon LOI");

    const ndaHtml = renderWithIntl(
      React.createElement(AssetCard, {
        asset: {
          id: "ast_nda",
          title: "Confidential Banking Charter",
          summary: "Protected bank",
          country: "Switzerland",
          licenseType: "BANKING",
          businessType: "BANK",
          businessStatus: "OPERATING",
          priceMode: "NDA",
        },
      })
    );
    expect(ndaHtml).toContain("Under NDA");
  });

  it("renders BuyerCard with missing thesis, empty target markets and licenses", () => {
    const html = renderWithIntl(
      React.createElement(BuyerCard, {
        buyer: {
          id: "byr_edge_1",
          name: "Anonymous Partner",
          company: "Stealth Capital",
          country: "United Kingdom",
          thesis: null,
          ticketMin: null,
          ticketMax: null,
          targetCountries: [],
          targetLicenseTypes: [],
        },
      })
    );

    expect(html).toContain("Stealth Capital");
    expect(html).toContain("Global / any");
    expect(html).toContain("Flexible");
    expect(html).toContain("Actively seeking strategic financial licenses");
  });
});
