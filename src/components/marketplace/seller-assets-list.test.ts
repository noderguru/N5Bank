import { describe, expect, it, vi } from "vitest";
import React from "react";
import { renderWithIntl } from "@/lib/render-test";
import { SellerAssetsList, type SellerAssetItem } from "./seller-assets-list";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("SellerAssetsList", () => {
  it("renders empty state pointing to /seller/assets/new when no assets exist", () => {
    const html = renderWithIntl(
      React.createElement(SellerAssetsList, { assets: [] })
    );

    expect(html).toContain("No listings created yet");
    expect(html).toContain("+ Publish First Asset");
    expect(html).toContain("/seller/assets/new");
  });

  it("renders list of assets with status badges and details", () => {
    const assets: SellerAssetItem[] = [
      {
        id: "ast_1",
        title: "Lithuanian EMI with SEPA Instant",
        summary: "Authorized electronic money institution in Vilnius.",
        country: "Lithuania",
        licenseType: "E_MONEY",
        businessType: "FINTECH",
        businessStatus: "OPERATING",
        askingPrice: 2500000,
        priceMode: "FIXED",
        currency: "EUR",
        status: "PUBLISHED",
        views: 142,
        createdAt: new Date(),
      },
      {
        id: "ast_2",
        title: "Swiss Crypto Brokerage Draft",
        summary: "Turnkey VASP entity with active banking rails.",
        country: "Switzerland",
        licenseType: "CRYPTO",
        businessType: "CRYPTO_BUSINESS",
        businessStatus: "PRE_LAUNCH",
        askingPrice: null,
        priceMode: "ON_LOI",
        currency: "USD",
        status: "DRAFT",
        views: 0,
        createdAt: new Date(),
      },
    ];

    const html = renderWithIntl(
      React.createElement(SellerAssetsList, { assets })
    );

    expect(html).toContain("Lithuanian EMI with SEPA Instant");
    expect(html).toContain("Published");
    expect(html).toContain("142 views");
    expect(html).toContain("Swiss Crypto Brokerage Draft");
    expect(html).toContain("Draft");
    expect(html).toContain("Upon LOI");
  });

  it("renders moderation reason for suspended assets", () => {
    const assets: SellerAssetItem[] = [
      {
        id: "ast_susp",
        title: "Offshore Entity Under Review",
        summary: "Brokerage entity.",
        country: "Seychelles",
        licenseType: "BROKERAGE",
        businessType: "BROKERAGE",
        businessStatus: "OPERATING",
        askingPrice: null,
        priceMode: "NDA",
        currency: "USD",
        status: "SUSPENDED",
        views: 31,
        createdAt: new Date(),
        moderationReason: "Pending updated proof of supervisory clearance",
      },
    ];

    const html = renderWithIntl(
      React.createElement(SellerAssetsList, { assets })
    );

    expect(html).toContain("Suspended by Moderation");
    expect(html).toContain("Reason from platform compliance:");
    expect(html).toContain("Pending updated proof of supervisory clearance");
  });
});
