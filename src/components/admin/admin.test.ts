import { describe, expect, it, vi } from "vitest";
import React from "react";
import { renderWithIntl } from "@/lib/render-test";
import { AdminHeader, type PlatformSummaryStats } from "./admin-header";
import { UsersTable, type AdminUserRow } from "./users-table";
import { AssetsTable, type AdminAssetRow, type SellerOption } from "./assets-table";
import { ModerationTable } from "./moderation-table";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Manager Console Components", () => {
  const mockStats: PlatformSummaryStats = {
    totalUsers: 25,
    activeBuyers: 15,
    activeSellers: 8,
    managers: 2,
    suspendedUsers: 1,
    totalAssets: 40,
    publishedAssets: 32,
    draftAssets: 5,
    suspendedAssets: 3,
    totalConversations: 12,
    totalModerationLogs: 4,
  };

  describe("AdminHeader", () => {
    it("renders platform overview statistics correctly", () => {
      const html = renderWithIntl(
        React.createElement(AdminHeader, {
          stats: mockStats,
          activeTab: "users",
        })
      );

      expect(html).toContain("Manager Oversight Console");
      expect(html).toContain("25"); // Total users
      expect(html).toContain("15 Buyers · 8 Sellers · 2 Ops");
      expect(html).toContain("40"); // Total assets
      expect(html).toContain("32 Published · 5 Drafts · 3 Suspended");
      expect(html).toContain("12"); // Inquiries
      expect(html).toContain("4"); // Compliance flags (1 user + 3 assets)
      expect(html).toContain("Participants &amp; KYC");
      expect(html).toContain("Marketplace Assets");
    });
  });

  describe("UsersTable", () => {
    const mockUsers: AdminUserRow[] = [
      {
        id: "usr_1",
        name: "Alice Acquirer",
        email: "alice@acquirer.com",
        role: "BUYER",
        status: "ACTIVE",
        company: "Apex Capital Partners",
        country: "United Kingdom",
        verified: true,
        ticketDisplay: "$1,000,000 – $5,000,000",
        assetsCount: 0,
        conversationsCount: 3,
        createdAt: "2026-09-01T12:00:00.000Z",
      },
      {
        id: "usr_2",
        name: "Bob Seller",
        email: "bob@seller.com",
        role: "SELLER",
        status: "SUSPENDED",
        company: "Fintech Holdings LLC",
        country: "Switzerland",
        verified: true,
        ticketDisplay: null,
        assetsCount: 4,
        conversationsCount: 2,
        createdAt: "2026-08-15T12:00:00.000Z",
      },
    ];

    it("renders user rows with appropriate status and role badges", () => {
      const html = renderWithIntl(
        React.createElement(UsersTable, {
          users: mockUsers,
          totalCount: 2,
        })
      );

      expect(html).toContain("Alice Acquirer");
      expect(html).toContain("alice@acquirer.com");
      expect(html).toContain("BUYER");
      expect(html).toContain("Active");
      expect(html).toContain("Apex Capital Partners");
      expect(html).toContain("$1,000,000 – $5,000,000");

      expect(html).toContain("Bob Seller");
      expect(html).toContain("bob@seller.com");
      expect(html).toContain("SELLER");
      expect(html).toContain("Suspended");
      expect(html).toContain("Fintech Holdings LLC");
      expect(html).toContain("4"); // listings
    });

    it("renders empty state when no users match filters", () => {
      const html = renderWithIntl(
        React.createElement(UsersTable, {
          users: [],
          totalCount: 25,
        })
      );

      expect(html).toContain("No participants found");
      expect(html).toContain("Clear all filters");
    });
  });

  describe("AssetsTable", () => {
    const mockAssets: AdminAssetRow[] = [
      {
        id: "asset_test_1",
        title: "Swiss Private Bank Charter",
        summary: "Full banking license with FINMA clearance",
        country: "Switzerland",
        licenseType: "BANKING",
        businessType: "BANK",
        businessStatus: "OPERATING",
        askingPrice: 15000000,
        priceMode: "FIXED",
        currency: "USD",
        status: "PUBLISHED",
        validated: true,
        views: 89,
        sellerId: "usr_seller_1",
        sellerName: "Geneva Partners",
        sellerCompany: "Geneva Capital SA",
        sellerStatus: "ACTIVE",
        createdAt: "2026-09-02T10:00:00.000Z",
      },
      {
        id: "asset_test_2",
        title: "Lithuanian EMI Institution",
        summary: "SEPA connected electronic money institution",
        country: "Lithuania",
        licenseType: "E_MONEY",
        businessType: "PAYMENT_INSTITUTION",
        businessStatus: "OPERATING",
        askingPrice: null,
        priceMode: "ON_LOI",
        currency: "EUR",
        status: "SUSPENDED",
        validated: false,
        views: 42,
        sellerId: "usr_seller_2",
        sellerName: "Vilnius Ventures",
        sellerCompany: "Baltic Fintech UAB",
        sellerStatus: "SUSPENDED",
        createdAt: "2026-08-20T10:00:00.000Z",
      },
    ];

    const mockSellers: SellerOption[] = [
      { id: "usr_seller_1", name: "Geneva Partners", company: "Geneva Capital SA" },
      { id: "usr_seller_2", name: "Vilnius Ventures", company: "Baltic Fintech UAB" },
    ];

    it("renders assets table with public page links and status flags", () => {
      const html = renderWithIntl(
        React.createElement(AssetsTable, {
          assets: mockAssets,
          totalCount: 2,
          sellers: mockSellers,
        })
      );

      expect(html).toContain("Swiss Private Bank Charter");
      expect(html).toContain("Switzerland");
      expect(html).toContain("USD");
      expect(html).toContain("15,000,000");
      expect(html).toContain("Banking");
      expect(html).toContain("View");
      expect(html).toContain("/assets/asset_test_1");

      expect(html).toContain("Lithuanian EMI Institution");
      expect(html).toContain("Upon LOI");
      expect(html).toContain("Suspended");
      expect(html).toContain("(Seller Suspended)");
      expect(html).toContain("/assets/asset_test_2");
    });

    it("renders empty state when no assets match filters", () => {
      const html = renderWithIntl(
        React.createElement(AssetsTable, {
          assets: [],
          totalCount: 40,
          sellers: mockSellers,
        })
      );

      expect(html).toContain("No assets found");
      expect(html).toContain("Clear all filters");
    });
  });

  describe("ModerationTable", () => {
    const mockLogs = [
      {
        id: "log_test_1",
        actorId: "usr_mgr_1",
        actorName: "Morgan Reed",
        actorEmail: "manager@demo",
        targetType: "USER" as const,
        targetId: "usr_seller_1",
        targetTitle: "Leon Fischer",
        targetSubtitle: "Fischer Fintech Holdings (SELLER)",
        targetHref: "/admin/users?q=seller.europe%40n5deal.demo",
        action: "SUSPEND" as const,
        reason: "Compliance verification audit on licensing passporting",
        createdAt: "2026-09-03T12:30:00.000Z",
      },
      {
        id: "log_test_2",
        actorId: "usr_mgr_1",
        actorName: "Morgan Reed",
        actorEmail: "manager@demo",
        targetType: "ASSET" as const,
        targetId: "asset_1",
        targetTitle: "Lithuania e money opportunity",
        targetSubtitle: "Lithuania • PUBLISHED",
        targetHref: "/assets/asset_1",
        action: "RESTORE" as const,
        reason: "Regulatory status re-verified by Central Bank of Lithuania",
        createdAt: "2026-09-03T12:45:00.000Z",
      },
    ];

    it("renders moderation log table with action badges, targets, and quotes", () => {
      const html = renderWithIntl(
        React.createElement(ModerationTable, {
          logs: mockLogs,
          totalCount: 2,
        })
      );

      expect(html).toContain("Suspend");
      expect(html).toContain("Leon Fischer");
      expect(html).toContain("Compliance verification audit");
      expect(html).toContain("Morgan Reed");

      expect(html).toContain("Reinstate");
      expect(html).toContain("Lithuania e money opportunity");
      expect(html).toContain("Regulatory status re-verified");
    });

    it("renders meaningful empty state when no actions have occurred (N5B-31)", () => {
      const html = renderWithIntl(
        React.createElement(ModerationTable, {
          logs: [],
          totalCount: 0,
        })
      );

      expect(html).toContain("No compliance actions recorded yet");
      expect(html).toContain("Explore Participants Directory");
    });
  });
});

