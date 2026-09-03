import { describe, expect, it } from "vitest";
import React from "react";
import { renderWithIntl } from "@/lib/render-test";
import { AssetCard } from "@/components/marketplace/asset-card";
import { BuyerCard } from "@/components/marketplace/buyer-card";

describe("Routing & Input Edge Cases (N5B-96)", () => {
  it("renders AssetCard safely when given extremely long strings without crashing", () => {
    const longString = "A".repeat(1000);
    const html = renderWithIntl(
      React.createElement(AssetCard, {
        asset: {
          id: "ast_long_1",
          title: longString,
          summary: longString,
          country: "Lithuania",
          licenseType: "E_MONEY",
          businessType: "FINTECH",
          businessStatus: "OPERATING",
          regulator: longString,
        },
      })
    );

    expect(html).toContain("line-clamp-2");
    expect(html).toContain("ast_long_1");
  });

  it("renders BuyerCard safely when given very long company name and thesis", () => {
    const longThesis = "B".repeat(1000);
    const html = renderWithIntl(
      React.createElement(BuyerCard, {
        buyer: {
          id: "byr_long_1",
          name: "Dr. Long Name",
          company: "Very Long Holding Corporation Name That Exceeds Normal Limits",
          country: "United Kingdom",
          thesis: longThesis,
        },
      })
    );

    expect(html).toContain("line-clamp-2");
    expect(html).toContain("truncate");
  });
});
