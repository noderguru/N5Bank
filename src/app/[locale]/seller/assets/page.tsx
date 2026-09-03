import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { SellerAssetsList, type SellerAssetItem } from "@/components/marketplace/seller-assets-list";

export const metadata = {
  title: "My Listings | N5Deal Marketplace",
  description: "Manage your financial asset listings, drafts, and publication statuses.",
};

export default async function SellerAssetsPage() {
  const session = await requireRole("SELLER");

  const rawAssets = await prisma.asset.findMany({
    where: {
      sellerId: session.userId,
      status: { not: "REMOVED" },
    },
    orderBy: { createdAt: "desc" },
  });

  const suspendedIds = rawAssets
    .filter((a) => a.status === "SUSPENDED")
    .map((a) => a.id);

  const moderationLogs =
    suspendedIds.length > 0
      ? await prisma.moderationLog.findMany({
          where: {
            targetType: "ASSET",
            targetId: { in: suspendedIds },
            action: "SUSPEND",
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

  const logMap = new Map<string, string>();
  for (const log of moderationLogs) {
    if (!logMap.has(log.targetId)) {
      logMap.set(log.targetId, log.reason);
    }
  }

  const assets: SellerAssetItem[] = rawAssets.map((a) => ({
    id: a.id,
    title: a.title,
    summary: a.summary,
    country: a.country,
    licenseType: a.licenseType,
    businessType: a.businessType,
    businessStatus: a.businessStatus,
    askingPrice: a.askingPrice ? Number(a.askingPrice) : null,
    priceMode: a.priceMode,
    currency: a.currency,
    status: a.status,
    views: a.views,
    createdAt: a.createdAt,
    moderationReason: logMap.get(a.id) ?? null,
  }));

  return (
    <AppShell
      user={{
        id: session.userId,
        email: session.userId,
        role: session.role,
      }}
    >
      <div className="py-8 space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D9D9] pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#383BFE]">
              Seller Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mt-1">
              My Financial Listings
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Manage your portfolio of banking institutions, licenses, and fintech entities.
            </p>
          </div>

          <Button
            asChild
            className="h-11 rounded-full bg-[#383BFE] hover:bg-[#2d30e0] text-white px-5 font-semibold text-sm shadow-xs"
          >
            <Link href="/seller/assets/new">
              <Plus className="mr-1.5 h-4 w-4" />
              List New Asset
            </Link>
          </Button>
        </div>

        <SellerAssetsList assets={assets} />
      </div>
    </AppShell>
  );
}
