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
  unreadCount = 0,
  t?: (key: string) => string
): RoleNavConfig {
  const tr = (key: string, fallback: string) => (t ? t(key) : fallback);

  if (!role) {
    return {
      items: [
        { label: tr("nav.assets", "Assets"), href: "/assets" },
        { label: tr("nav.buyerDemand", "Buyer Demand"), href: "/buyers" },
        { label: tr("nav.howItWorks", "How it works"), href: "/#how-it-works" },
      ],
      cta: { label: tr("nav.signIn", "Sign in"), href: "/login", variant: "primary" },
      secondaryCta: { label: tr("nav.listAsset", "List Asset"), href: "/register?role=seller", variant: "outline" },
    };
  }

  switch (role) {
    case "BUYER":
      return {
        items: [
          { label: tr("nav.catalogue", "Catalogue"), href: "/assets" },
          { label: tr("nav.myMatches", "My Matches"), href: "/buyer/matches" },
          { label: tr("nav.savedAssets", "Saved Assets"), href: "/buyer/saved" },
          { label: tr("nav.inbox", "Inbox"), href: "/inbox", badge: unreadCount },
        ],
        cta: { label: tr("nav.postBuyMandate", "+ Post Buy Mandate"), href: "/buyer/mandates/new", variant: "primary" },
      };

    case "SELLER":
      return {
        items: [
          { label: tr("nav.myListings", "My Listings"), href: "/seller/assets" },
          { label: tr("nav.buyerDemand", "Buyer Demand"), href: "/buyers" },
          { label: tr("nav.inquiries", "Inquiries"), href: "/seller/inquiries" },
          { label: tr("nav.inbox", "Inbox"), href: "/inbox", badge: unreadCount },
        ],
        cta: { label: tr("nav.listAsset", "+ List Asset"), href: "/seller/assets/new", variant: "primary" },
      };

    case "MANAGER":
      return {
        items: [
          { label: tr("nav.dashboard", "Dashboard"), href: "/admin" },
          { label: tr("nav.usersKyc", "Users & KYC"), href: "/admin/users" },
          { label: tr("nav.moderation", "Moderation"), href: "/admin/moderation" },
          { label: tr("nav.dealsEscrow", "Deals & Escrow"), href: "/admin/deals" },
          { label: tr("nav.inbox", "Inbox"), href: "/inbox", badge: unreadCount },
        ],
        cta: { label: tr("nav.auditLogs", "Audit Logs"), href: "/admin/audit", variant: "outline" },
      };
  }
}
