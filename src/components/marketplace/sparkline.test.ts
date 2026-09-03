import { describe, expect, it } from "vitest";
import React from "react";
import { renderWithIntl } from "@/lib/render-test";
import { Sparkline } from "./sparkline";
import { FavoriteButton } from "./favorite-button";

describe("Sparkline component", () => {
  it("renders SVG sparkline, change percentage, and time horizons", () => {
    const html = renderWithIntl(
      React.createElement(Sparkline, {
        label: "Banking Charter Index",
        changePercent: "+24.5% YoY",
        data: [10, 15, 20, 25, 30],
      })
    );

    expect(html).toContain("Banking Charter Index");
    expect(html).toContain("+24.5% YoY");
    expect(html).toContain("<svg");
    expect(html).toContain("<polyline");
    expect(html).toContain("Q1 2025");
    expect(html).toContain("Present");
  });
});

describe("FavoriteButton component", () => {
  it("renders with un-saved initial state", () => {
    const html = renderWithIntl(
      React.createElement(FavoriteButton, {
        assetId: "ast_1",
        initialFavorite: false,
      })
    );

    expect(html).toContain("Save to Favorites");
    expect(html).toContain('data-testid="favorite-button"');
    expect(html).toContain('data-active="false"');
  });

  it("renders with saved initial state", () => {
    const html = renderWithIntl(
      React.createElement(FavoriteButton, {
        assetId: "ast_1",
        initialFavorite: true,
      })
    );

    expect(html).toContain("Saved to Favorites");
    expect(html).toContain('data-active="true"');
  });
});
