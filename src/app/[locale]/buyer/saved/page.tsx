import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowLeft, Bookmark } from "lucide-react";
import { readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { AssetCard, type AssetCardData } from "@/components/marketplace/asset-card";
import { EmptyState } from "@/components/marketplace/empty-state";

export const metadata = {
  title: "Saved Assets | N5Deal Marketplace",
  description: "Monitor saved acquisition targets, financial licenses, and watchlist opportunities.",
};

export default async function SavedAssetsPage() {
  const t = await getTranslations("buyerWorkspace");
  const session = await readSession();

  if (!session) {
    redirect("/login?next=/buyer/saved");
  }

  const rawFavorites = await prisma.favorite.findMany({
    where: {
      userId: session.userId,
      asset: {
        status: "PUBLISHED",
        seller: {
          status: "ACTIVE",
        },
      },
    },
    include: {
      asset: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const assets: AssetCardData[] = rawFavorites.map(({ asset }) => ({
    id: asset.id,
    title: asset.title,
    summary: asset.summary,
    country: asset.country,
    licenseType: asset.licenseType,
    businessType: asset.businessType,
    businessStatus: asset.businessStatus,
    askingPrice: asset.askingPrice ? Number(asset.askingPrice) : null,
    priceMode: asset.priceMode,
    currency: asset.currency,
    features: asset.features,
    status: asset.status,
    validated: asset.validated,
    views: asset.views,
    regulator: asset.regulator,
    isFavorite: true,
  }));

  return (
    <AppShell
      user={{
        id: session.userId,
        email: session.userId,
        role: session.role,
      }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/assets"
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-brand transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                <span>{t("allAssets")}</span>
              </Link>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl flex items-center gap-2.5">
              <Bookmark className="size-6 text-brand fill-brand" />
              <span>{t("savedAssets")}</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              Curated watchlist of institutions, payment charters, and crypto licenses saved for your acquisition pipeline.
            </p>
          </div>

          <div className="text-xs font-medium text-muted-foreground">
            {assets.length} {assets.length === 1 ? "saved opportunity" : "saved opportunities"}
          </div>
        </div>

        {/* Content */}
        {assets.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={t("noSavedTitle")}
            description={t("noSavedDesc")}
            action={{
              label: "Explore Catalogue",
              href: "/assets",
            }}
          />
        )}
      </div>
    </AppShell>
  );
}
