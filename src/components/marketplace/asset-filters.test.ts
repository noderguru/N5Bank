import { describe, expect, it, vi } from "vitest";
import React from "react";
import { renderWithIntl } from "@/lib/render-test";
import { AssetFilters } from "./asset-filters";
import { NoResultsState } from "./no-results-state";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("AssetFilters component", () => {
  it("renders search bar, category chips with server counts and filter dropdowns", () => {
    const html = renderWithIntl(
      React.createElement(AssetFilters, {
        totalCount: 42,
        chipCounts: {
          BANK: 10,
          FINTECH: 12,
          PAYMENT_INSTITUTION: 8,
          CRYPTO_BUSINESS: 4,
          BROKERAGE: 3,
          INSURANCE_COMPANY: 3,
          OTHER: 2,
        },
        availableCountries: ["Germany", "Lithuania", "United Kingdom"],
      })
    );

    expect(html).toContain("Search assets by title");
    expect(html).toContain("All");
    expect(html).toContain("42");
    expect(html).toContain("Bank");
    expect(html).toContain("10");
    expect(html).toContain("Fintech");
    expect(html).toContain("12");
    expect(html).toContain("Germany");
    expect(html).toContain("Lithuania");
    expect(html).toContain("United Kingdom");
    expect(html).toContain("Banking");
    expect(html).toContain("Operating");
  });

  it("renders NoResultsState with resetHref link correctly", () => {
    const html = renderWithIntl(
      React.createElement(NoResultsState, {
        title: "No matching assets found",
        query: "NonExistentBank",
        resetHref: "/assets",
        resetLabel: "Clear all filters",
      })
    );

    expect(html).toContain("No matching assets found");
    expect(html).toContain("NonExistentBank");
    expect(html).toContain('href="/assets"');
    expect(html).toContain("Clear all filters");
  });
});
