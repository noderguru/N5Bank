import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { AssetCard, type AssetCardData } from "@/components/marketplace/asset-card";
import { EmptyState } from "@/components/marketplace/empty-state";
import { computeProfileCompleteness } from "@/lib/validation/buyer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Matched Assets | N5Deal Marketplace",
  description: "Algorithmic and AI-curated matching between your investment mandate and available banking opportunities.",
};

export default async function MatchesPage() {
  const session = await readSession();

  if (!session) {
    redirect("/login?next=/buyer/matches");
  }

  const profile = await prisma.buyerProfile.findUnique({
    where: { userId: session.userId },
  });

  const completeness = computeProfileCompleteness(profile);

  // Criterion: "Незаполненный профиль не ломает /matches, а объясняет что заполнить"
  if (!completeness.isComplete || !profile) {
    return (
      <AppShell
        user={{
          id: session.userId,
          email: session.userId,
          role: session.role,
        }}
      >
        <div className="max-w-2xl mx-auto py-12 space-y-6 text-center">
          <div className="flex size-14 mx-auto items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <Sparkles className="size-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Complete Your Mandate to Unlock Matches
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our matching engine pairs your investment thesis, target ticket range, and licensed charter requirements with vetted sellers.
            </p>
          </div>

          <div className="rounded-2xl border border-hairline bg-surface p-5 text-left space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-ink">Profile Readiness</span>
              <span className="font-semibold text-brand">{completeness.score}%</span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-canvas">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${completeness.score}%` }}
              />
            </div>

            <div className="space-y-1 pt-2">
              <span className="text-xs font-medium text-muted-foreground">
                Required for high-confidence matching:
              </span>
              <ul className="space-y-1 text-xs text-ink">
                {completeness.missingFields.map((field) => (
                  <li key={field} className="flex items-center gap-1.5">
                    <AlertCircle className="size-3.5 text-amber-500 shrink-0" />
                    <span>{field}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-2">
            <Button
              asChild
              className="h-11 px-6 rounded-xl bg-brand hover:bg-brand/90 text-white font-medium shadow-xs"
            >
              <Link href="/buyer">
                <span>Complete Mandate Profile</span>
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  // Fetch matched published assets
  const orConditions = [];

  if (profile.targetCountries.length > 0) {
    orConditions.push({ country: { in: profile.targetCountries } });
  }

  if (profile.targetLicenseTypes.length > 0) {
    orConditions.push({ licenseType: { in: profile.targetLicenseTypes } });
  }

  if (profile.targetBusinessTypes.length > 0) {
    orConditions.push({ businessType: { in: profile.targetBusinessTypes } });
  }

  const matchedAssets = await prisma.asset.findMany({
    where: {
      status: "PUBLISHED",
      seller: { status: "ACTIVE" },
      ...(orConditions.length > 0 ? { OR: orConditions } : {}),
    },
    orderBy: { views: "desc" },
    take: 12,
  });

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.userId },
    select: { assetId: true },
  });
  const favSet = new Set(favorites.map((f) => f.assetId));

  const assets: AssetCardData[] = matchedAssets.map((asset) => ({
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
    isFavorite: favSet.has(asset.id),
  }));

  return (
    <AppShell
      user={{
        id: session.userId,
        email: session.userId,
        role: session.role,
      }}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl flex items-center gap-2">
              <Sparkles className="size-6 text-brand" />
              <span>Target Asset Matches</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
              Regulated opportunities matched against your mandate criteria ({profile.company} · {profile.currency} {profile.ticketMin ? `$${profile.ticketMin.toString()}` : "Any"} – {profile.ticketMax ? `$${profile.ticketMax.toString()}` : "Any"}).
            </p>
          </div>

          <Button asChild variant="outline" className="rounded-xl border-hairline text-xs font-medium">
            <Link href="/buyer">Edit Mandate</Link>
          </Button>
        </div>

        {assets.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No matches found for current criteria"
            description="Try broadening your target countries, license charters, or budget envelope in your buyer profile."
            action={{
              label: "Update Mandate Criteria",
              href: "/buyer",
            }}
          />
        )}
      </div>
    </AppShell>
  );
}
