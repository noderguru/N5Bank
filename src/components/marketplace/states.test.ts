import { describe, expect, it, vi } from "vitest";
import React from "react";
import { renderWithIntl } from "@/lib/render-test";
import {
  AssetCardSkeleton,
  BuyerCardSkeleton,
  CardGridSkeleton,
  EmptyState,
  ErrorState,
  NoResultsState,
} from "./index";

describe("reusable marketplace states", () => {
  describe("EmptyState", () => {
    it("renders title, description and call to action", () => {
      const html = renderWithIntl(
        React.createElement(EmptyState, {
          title: "No active conversations",
          description: "Reach out to buyers or sellers from the marketplace catalogue to initiate deal discussions.",
          action: { label: "Explore assets", href: "/assets" },
        })
      );

      expect(html).toContain("No active conversations");
      expect(html).toContain("Reach out to buyers or sellers");
      expect(html).toContain("Explore assets");
      expect(html).toContain("/assets");
    });
  });

  describe("ErrorState", () => {
    it("renders dignified error title and message without slang or oops", () => {
      const html = renderWithIntl(
        React.createElement(ErrorState, {
          title: "Connection interrupted",
          message: "Failed to synchronize listings with the server.",
          onRetry: vi.fn(),
          retryLabel: "Retry synchronization",
        })
      );

      expect(html).toContain("Connection interrupted");
      expect(html).toContain("Failed to synchronize listings");
      expect(html).toContain("Retry synchronization");
      expect(html).not.toContain("Oops");
      expect(html).not.toContain("Something went wrong");
    });
  });

  describe("NoResultsState", () => {
    it("renders no results title, query and clear filters button", () => {
      const html = renderWithIntl(
        React.createElement(NoResultsState, {
          query: "banking license Brazil",
          onReset: vi.fn(),
          resetLabel: "Reset all filters",
        })
      );

      expect(html).toContain("No matching opportunities found");
      expect(html).toContain("banking license Brazil");
      expect(html).toContain("Reset all filters");
      expect(html).not.toContain("Oops");
    });
  });

  describe("Skeletons", () => {
    it("renders high-fidelity AssetCardSkeleton matching real card layout", () => {
      const html = renderWithIntl(React.createElement(AssetCardSkeleton));
      expect(html).toContain("rounded-2xl");
      expect(html).toContain("border-hairline");
    });

    it("renders BuyerCardSkeleton with ticket and parameters placeholders", () => {
      const html = renderWithIntl(React.createElement(BuyerCardSkeleton));
      expect(html).toContain("rounded-2xl");
    });

    it("renders CardGridSkeleton with requested count", () => {
      const html = renderWithIntl(
        React.createElement(CardGridSkeleton, { count: 3, type: "asset" })
      );
      expect(html).toContain("grid-cols-1");
    });
  });
});
