import { Prisma, AssetStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { getPlatformSummaryStats } from "@/lib/db/admin";
import { AppShell } from "@/components/layout/app-shell";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  AssetsTable,
  type AdminAssetRow,
  type SellerOption,
} from "@/components/admin/assets-table";

export const metadata = {
  title: "Assets Directory | Manager Console | N5Deal",
  description: "Operational management of marketplace asset listings, seller verification, and compliance statuses.",
};

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    sellerId?: string;
    sort?: string;
  }>;
};

export default async function AdminAssetsPage({ searchParams }: Props) {
  // N5B-39: Доступ строго для роли MANAGER, проверка на сервере
  const session = await requireRole("MANAGER");

  const { q, status, sellerId, sort } = await searchParams;

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

  if (status && Object.values(AssetStatus).includes(status as AssetStatus)) {
    andConditions.push({ status: status as AssetStatus });
  }

  if (sellerId && sellerId !== "ALL" && sellerId.trim()) {
    andConditions.push({ sellerId: sellerId.trim() });
  }

  const where: Prisma.AssetWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  let orderBy: Prisma.AssetOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "oldest") {
    orderBy = { createdAt: "asc" };
  } else if (sort === "price_desc") {
    orderBy = { askingPrice: "desc" };
  } else if (sort === "price_asc") {
    orderBy = { askingPrice: "asc" };
  } else if (sort === "views") {
    orderBy = { views: "desc" };
  }

  const [stats, rawAssets, totalAssetsCount, sellersData] = await Promise.all([
    getPlatformSummaryStats(),
    prisma.asset.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            status: true,
            sellerProfile: {
              select: {
                company: true,
              },
            },
          },
        },
      },
      orderBy,
    }),
    prisma.asset.count(),
    prisma.user.findMany({
      where: { role: "SELLER" },
      select: {
        id: true,
        name: true,
        sellerProfile: {
          select: {
            company: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const sellers: SellerOption[] = sellersData.map((s) => ({
    id: s.id,
    name: s.name,
    company: s.sellerProfile?.company || null,
  }));

  const assets: AdminAssetRow[] = rawAssets.map((a) => ({
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
    validated: a.validated,
    views: a.views,
    sellerId: a.sellerId,
    sellerName: a.seller.name,
    sellerCompany: a.seller.sellerProfile?.company || null,
    sellerStatus: a.seller.status,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <AppShell
      user={{
        id: session.userId,
        email: session.userId,
        role: session.role,
      }}
    >
      <div className="max-w-7xl mx-auto py-8 space-y-6">
        <AdminHeader stats={stats} activeTab="assets" />
        <AssetsTable assets={assets} totalCount={totalAssetsCount} sellers={sellers} />
      </div>
    </AppShell>
  );
}
