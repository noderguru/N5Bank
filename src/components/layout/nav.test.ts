import { describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/assets",
}));

import { Footer, getRoleNavConfig, PillNav } from "./index";

describe("navigation and app shell layout", () => {
  describe("getRoleNavConfig", () => {
    it("returns correct configuration for guest", () => {
      const config = getRoleNavConfig(null);
      expect(config.items.map((i) => i.label)).toEqual(["Assets", "Buyer Demand", "How it works"]);
      expect(config.cta.label).toBe("Sign in");
      expect(config.cta.href).toBe("/login");
      expect(config.secondaryCta?.label).toBe("List Asset");
    });

    it("returns correct configuration for BUYER with unread counter", () => {
      const config = getRoleNavConfig("BUYER", 3);
      expect(config.items.map((i) => i.label)).toEqual(["Catalogue", "My Matches", "Saved Assets", "Inbox"]);
      const inboxItem = config.items.find((i) => i.label === "Inbox");
      expect(inboxItem?.badge).toBe(3);
      expect(config.cta.label).toBe("+ Post Buy Mandate");
      expect(config.cta.href).toBe("/buyer/mandates/new");
    });

    it("returns correct configuration for SELLER with unread counter", () => {
      const config = getRoleNavConfig("SELLER", 5);
      expect(config.items.map((i) => i.label)).toEqual(["My Listings", "Buyer Demand", "Inquiries", "Inbox"]);
      const inboxItem = config.items.find((i) => i.label === "Inbox");
      expect(inboxItem?.badge).toBe(5);
      expect(config.cta.label).toBe("+ List Asset");
      expect(config.cta.href).toBe("/seller/assets/new");
    });

    it("returns correct configuration for MANAGER", () => {
      const config = getRoleNavConfig("MANAGER");
      expect(config.items.map((i) => i.label)).toEqual(["Dashboard", "Users & KYC", "Moderation", "Deals & Escrow", "Inbox"]);
      expect(config.cta.label).toBe("Audit Logs");
      expect(config.cta.href).toBe("/admin/audit");
    });
  });

  describe("PillNav Component", () => {
    it("renders guest navigation with Sign in button", () => {
      const html = renderToStaticMarkup(React.createElement(PillNav, { user: null }));
      expect(html).toContain("N5");
      expect(html).toContain("Deal");
      expect(html).toContain("Sign in");
      expect(html).toContain("/login");
      expect(html).toContain("Assets");
    });

    it("renders authenticated navigation with role indicator and unread badge", () => {
      const html = renderToStaticMarkup(
        React.createElement(PillNav, {
          user: { id: "usr_buyer_demo", email: "buyer@demo", role: "BUYER", name: "Alexander" },
          unreadCount: 4,
        })
      );

      expect(html).toContain("Alexander");
      expect(html).toContain('data-role="BUYER"');
      expect(html).toContain("+ Post Buy Mandate");
      expect(html).toContain("4"); // Unread badge
    });
  });

  describe("Footer Component", () => {
    it("renders compliance disclaimer and legal info", () => {
      const html = renderToStaticMarkup(React.createElement(Footer));
      expect(html).toContain("Regulatory Notice");
      expect(html).toContain("N5Deal is an introductions platform");
      expect(html).toContain("M&amp;A Platform");
    });
  });
});
