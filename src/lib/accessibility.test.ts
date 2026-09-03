import { describe, expect, it, vi } from "vitest";
import React from "react";
import { renderWithIntl } from "@/lib/render-test";

vi.mock("next/navigation", () => ({
  usePathname: () => "/assets",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
  notFound: vi.fn(),
  useParams: () => ({ locale: "en" }),
}));

import { AppShell } from "@/components/layout/app-shell";
import { FavoriteButton } from "@/components/marketplace/favorite-button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

describe("Accessibility Standards (N5B-44)", () => {
  it("renders accessible skip link and semantic landmarks in AppShell", () => {
    const html = renderWithIntl(
      React.createElement(
        AppShell,
        { hideFooter: false },
        React.createElement("div", null, "Page content")
      )
    );

    expect(html).toContain('href="#main-content"');
    expect(html).toContain("Skip to main content");
    expect(html).toContain('<main id="main-content"');
    expect(html).toContain("<header");
    expect(html).toContain("<footer");
    expect(html).toContain('aria-label="Main navigation"');
  });

  it("ensures icon-only buttons have explicit aria-label", () => {
    const html = renderWithIntl(
      React.createElement(FavoriteButton, {
        assetId: "ast_a11y_1",
        initialFavorite: false,
      })
    );

    expect(html).toContain('aria-label="Save asset to favorites"');
  });

  it("ensures forms link labels with inputs via htmlFor and id", () => {
    const html = renderWithIntl(
      React.createElement(
        "div",
        null,
        React.createElement(Label, { htmlFor: "target-input" }, "Search Assets"),
        React.createElement(Input, { id: "target-input", name: "q", placeholder: "Filter..." })
      )
    );

    expect(html).toContain('for="target-input"');
    expect(html).toContain('id="target-input"');
  });
});
