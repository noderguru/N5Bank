import { Prisma, LicenseType } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { BuyerCard, type BuyerCardData } from "@/components/marketplace/buyer-card";
import { BuyerFilters } from "@/components/marketplace/buyer-filters";
import { NoResultsState } from "@/components/marketplace/no-results-state";
import { EmptyState } from "@/components/marketplace/empty-state";

export const metadata = {
  title: "Institutional Buyers | N5Deal Marketplace",
  description: "Browse verified institutional buyers, family offices, and fintech funds looking to acquire financial assets.",
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    country?: string;
    licenseType?: string;
    ticket?: string;
  }>;
};

export default async function BuyersPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketplace" });
  const { q, country, licenseType, ticket } = await searchParams;
  const session = await readSession();

  // Acceptance criterion: "Саспенднутые байеры в каталоге не показываются"
  const where: Prisma.BuyerProfileWhereInput = {
    user: {
      status: "ACTIVE",
    },
  };

  const andConditions: Prisma.BuyerProfileWhereInput[] = [];

  if (q && q.trim()) {
    const term = q.trim();
    andConditions.push({
      OR: [
        { company: { contains: term, mode: "insensitive" } },
        { thesis: { contains: term, mode: "insensitive" } },
        { bio: { contains: term, mode: "insensitive" } },
        { country: { contains: term, mode: "insensitive" } },
        { user: { name: { contains: term, mode: "insensitive" } } },
      ],
    });
  }

  if (country && country.trim()) {
    const c = country.trim();
    andConditions.push({
      OR: [
        { country: { equals: c, mode: "insensitive" } },
        { targetCountries: { has: c } },
      ],
    });
  }

  if (
    licenseType &&
    Object.values(LicenseType).includes(licenseType as LicenseType)
  ) {
    andConditions.push({
      targetLicenseTypes: { has: licenseType as LicenseType },
    });
  }

  if (ticket) {
    if (ticket === "under_1m") {
      andConditions.push({
        ticketMax: { lte: 1000000 },
      });
    } else if (ticket === "1m_5m") {
      andConditions.push({
        OR: [
          { ticketMin: { lte: 5000000 }, ticketMax: { gte: 1000000 } },
        ],
      });
    } else if (ticket === "5m_20m") {
      andConditions.push({
        OR: [
          { ticketMin: { lte: 20000000 }, ticketMax: { gte: 5000000 } },
        ],
      });
    } else if (ticket === "over_20m") {
      andConditions.push({
        ticketMax: { gte: 20000000 },
      });
    }
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  const rawBuyers = await prisma.buyerProfile.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const buyers: BuyerCardData[] = rawBuyers.map((b) => ({
    id: b.userId,
    name: b.user.name,
    company: b.company,
    country: b.country,
    thesis: b.thesis,
    ticketMin: b.ticketMin ? Number(b.ticketMin) : null,
    ticketMax: b.ticketMax ? Number(b.ticketMax) : null,
    currency: b.currency,
    targetCountries: b.targetCountries,
    targetLicenseTypes: b.targetLicenseTypes,
    targetBusinessTypes: b.targetBusinessTypes,
    horizon: b.horizon,
    verified: true,
  }));

  const hasFilterActive = Boolean(q || country || licenseType || ticket);

  return (
    <AppShell
      user={
        session
          ? { id: session.userId, email: session.userId, role: session.role }
          : null
      }
    >
      <div className="py-8 space-y-6 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="border-b border-hairline pb-6 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand">
            {t("buyerDemandTitle")}
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="display-lg text-ink">
                {t("buyerDemandTitle")} ({buyers.length})
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t("buyerDemandSubtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <BuyerFilters />

        {/* Buyers Grid or Empty States */}
        {buyers.length > 0 ? (
          <div className="grid grid-cols-1 gap-px border border-hairline bg-hairline md:grid-cols-2">
            {buyers.map((buyer) => (
              <BuyerCard key={buyer.id} buyer={buyer} />
            ))}
          </div>
        ) : hasFilterActive ? (
          <NoResultsState
            query={
              [q, country, licenseType, ticket].filter(Boolean).join(", ")
            }
            resetLabel="Clear all filters"
          />
        ) : (
          <EmptyState
            title="No active institutional buyers"
            description="Verified buyer mandates will appear here once profiles are registered."
          />
        )}
      </div>
    </AppShell>
  );
}
