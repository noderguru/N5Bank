import type { UserRole } from "@prisma/client";

export type NavItem = {
  label: string;
  href: string;
  badge?: number;
};

export type NavCta = {
  label: string;
  href: string;
  variant?: "primary" | "outline";
};

export type RoleNavConfig = {
  items: NavItem[];
  cta: NavCta;
  secondaryCta?: NavCta;
};

export function getRoleNavConfig(
  role: UserRole | null | undefined,
  unreadCount = 0
): RoleNavConfig {
  if (!role) {
    return {
      items: [
        { label: "Assets", href: "/assets" },
        { label: "Buyer Demand", href: "/buyers" },
        { label: "How it works", href: "/#how-it-works" },
      ],
      cta: { label: "Sign in", href: "/login", variant: "primary" },
      secondaryCta: { label: "List Asset", href: "/register?role=seller", variant: "outline" },
    };
  }

  switch (role) {
    case "BUYER":
      return {
        items: [
          { label: "Catalogue", href: "/assets" },
          { label: "My Matches", href: "/buyer/matches" },
          { label: "Saved Assets", href: "/buyer/saved" },
          { label: "Inbox", href: "/inbox", badge: unreadCount },
        ],
        cta: { label: "+ Post Buy Mandate", href: "/buyer/mandates/new", variant: "primary" },
      };

    case "SELLER":
      return {
        items: [
          { label: "My Listings", href: "/seller/assets" },
          { label: "Buyer Demand", href: "/buyers" },
          { label: "Inquiries", href: "/seller/inquiries" },
          { label: "Inbox", href: "/inbox", badge: unreadCount },
        ],
        cta: { label: "+ List Asset", href: "/seller/assets/new", variant: "primary" },
      };

    case "MANAGER":
      return {
        items: [
          { label: "Dashboard", href: "/admin" },
          { label: "Users & KYC", href: "/admin/users" },
          { label: "Moderation", href: "/admin/moderation" },
          { label: "Deals & Escrow", href: "/admin/deals" },
          { label: "Inbox", href: "/inbox", badge: unreadCount },
        ],
        cta: { label: "Audit Logs", href: "/admin/audit", variant: "outline" },
      };
  }
}
