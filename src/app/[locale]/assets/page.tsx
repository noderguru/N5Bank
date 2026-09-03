import { Prisma, LicenseType, BusinessType, BusinessStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { AssetCard, type AssetCardData } from "@/components/marketplace/asset-card";
import { AssetFilters } from "@/components/marketplace/asset-filters";
import { NoResultsState } from "@/components/marketplace/no-results-state";
import { EmptyState } from "@/components/marketplace/empty-state";

export const metadata = {
  title: "Financial Assets Catalogue | N5Deal Marketplace",
  description:
    "Browse verified banks, EMI institutions, crypto asset service providers, and brokerage licenses available for acquisition.",
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    country?: string;
    licenseType?: string;
    businessType?: string;
    businessStatus?: string;
    price?: string;
    sort?: string;
  }>;
};

export default async function AssetsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const tMarketplace = await getTranslations({ locale, namespace: "marketplace" });
  const {
    q,
    country,
    licenseType,
    businessType,
    businessStatus,
    price,
    sort,
  } = await searchParams;

  const session = await readSession();

  // Baseline constraint: only published assets from active, non-suspended sellers
  const baseWhere: Prisma.AssetWhereInput = {
    status: "PUBLISHED",
    seller: {
      status: "ACTIVE",
    },
  };

  const andConditions: Prisma.AssetWhereInput[] = [];

  if (q && q.trim()) {
    const term = q.trim();
    andConditions.push({
      OR: [
        { title: { contains: term, mode: "insensitive" } },
        { summary: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { country: { contains: term, mode: "insensitive" } },
        { regulator: { contains: term, mode: "insensitive" } },
      ],
    });
  }

  if (country && country.trim()) {
    andConditions.push({
      country: { equals: country.trim(), mode: "insensitive" },
    });
  }

  if (
    licenseType &&
    Object.values(LicenseType).includes(licenseType as LicenseType)
  ) {
    andConditions.push({
      licenseType: licenseType as LicenseType,
    });
  }

  if (
    businessType &&
    Object.values(BusinessType).includes(businessType as BusinessType)
  ) {
    andConditions.push({
      businessType: businessType as BusinessType,
    });
  }

  if (
    businessStatus &&
    Object.values(BusinessStatus).includes(businessStatus as BusinessStatus)
  ) {
    andConditions.push({
      businessStatus: businessStatus as BusinessStatus,
    });
  }

  if (price) {
    if (price === "under_1m") {
      andConditions.push({
        askingPrice: { lte: 1000000 },
      });
    } else if (price === "1m_5m") {
      andConditions.push({
        askingPrice: { gte: 1000000, lte: 5000000 },
      });
    } else if (price === "5m_20m") {
      andConditions.push({
        askingPrice: { gte: 5000000, lte: 20000000 },
      });
    } else if (price === "over_20m") {
      andConditions.push({
        askingPrice: { gte: 20000000 },
      });
    }
  }

  const where: Prisma.AssetWhereInput = {
    ...baseWhere,
    ...(andConditions.length > 0 ? { AND: andConditions } : {}),
  };

  // N5B-74: Sorting order through Prisma
  let orderBy: Prisma.AssetOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price_asc") {
    orderBy = { askingPrice: "asc" };
  } else if (sort === "price_desc") {
    orderBy = { askingPrice: "desc" };
  } else if (sort === "popular") {
    orderBy = { views: "desc" };
  }

  // N5B-69: GroupBy query to count assets by businessType in a single SQL operation
  const [rawAssets, groupCounts, totalPublished, countries] = await Promise.all([
    prisma.asset.findMany({
      where,
      orderBy,
      select: {
        id: true,
        title: true,
        summary: true,
        country: true,
        licenseType: true,
        businessType: true,
        businessStatus: true,
        askingPrice: true,
        priceMode: true,
        currency: true,
        features: true,
        status: true,
        validated: true,
        views: true,
        regulator: true,
      },
    }),
    prisma.asset.groupBy({
      by: ["businessType"],
      where: baseWhere,
      _count: true,
    }),
    prisma.asset.count({
      where: baseWhere,
    }),
    prisma.asset.findMany({
      where: baseWhere,
      select: { country: true },
      distinct: ["country"],
      orderBy: { country: "asc" },
    }),
  ]);

  const chipCounts: Record<string, number> = {};
  for (const item of groupCounts) {
    chipCounts[item.businessType] = item._count;
  }

  const availableCountries = countries.map((c) => c.country);

  const userFavorites = session
    ? await prisma.favorite.findMany({
        where: { userId: session.userId },
        select: { assetId: true },
      })
    : [];
  const favoriteSet = new Set(userFavorites.map((f) => f.assetId));

  const assets: AssetCardData[] = rawAssets.map((a) => ({
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
    features: a.features,
    status: a.status,
    validated: a.validated,
    views: a.views,
    regulator: a.regulator,
    isFavorite: favoriteSet.has(a.id),
  }));

  const hasActiveFilters = Boolean(
    q || country || licenseType || businessType || businessStatus || price || (sort && sort !== "newest")
  );

  return (
    <AppShell
      user={
        session
          ? { id: session.userId, email: session.userId, role: session.role }
          : null
      }
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h1 className="display-lg text-ink">
              {tMarketplace("catalogueTitle")}
            </h1>
            <span className="tnum eyebrow text-muted-foreground">{assets.length}</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {tMarketplace("catalogueSubtitle")}
          </p>
        </div>

        {/* Filter Toolbar */}
        <AssetFilters
          totalCount={totalPublished}
          chipCounts={chipCounts}
          availableCountries={availableCountries}
        />

        {/* Asset Cards or Empty State */}
        {assets.length > 0 ? (
          <div className="grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        ) : hasActiveFilters ? (
          /* N5B-73: Empty state with active filter explanation and 1-click reset */
          <NoResultsState
            title="No matching assets found"
            description="No published opportunities match your criteria. Try loosening your price threshold, license filters, or reset all parameters."
            query={q}
            resetHref="/assets"
            resetLabel="Clear all filters"
          />
        ) : (
          <EmptyState
            title="No assets available yet"
            description="New regulated asset offerings are added as institutional sellers complete compliance checks. Check back shortly or post a mandate."
            action={{
              label: "Explore Buyer Demand",
              href: "/buyers",
            }}
          />
        )}
      </div>
    </AppShell>
  );
}
