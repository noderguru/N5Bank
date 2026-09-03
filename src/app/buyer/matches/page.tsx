import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Sparkles, AlertCircle, ShieldCheck, Sliders } from "lucide-react";
import { readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/marketplace/empty-state";
import { MatchedAssetCard } from "@/components/marketplace/matched-asset-card";
import { computeProfileCompleteness } from "@/lib/validation/buyer";
import { getMatchesForBuyer } from "@/lib/ai/matching";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Target Asset Matches | N5Deal Marketplace",
  description: "AI and deterministic institutional matching between buyer investment mandates and available banking assets.",
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

  // Incomplete profile condition: Guide buyer to complete criteria
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
              Our institutional matching engine pairs your investment thesis, target ticket range, and licensed charter requirements with vetted sellers.
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

  // Fetch all active candidate assets for holistic evaluation
  const candidateAssets = await prisma.asset.findMany({
    where: {
      status: "PUBLISHED",
      seller: { status: "ACTIVE" },
    },
    take: 50,
  });

  const matchingResult = await getMatchesForBuyer(profile, candidateAssets);

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.userId },
    select: { assetId: true },
  });
  const favSet = new Set(favorites.map((f) => f.assetId));

  return (
    <AppShell
      user={{
        id: session.userId,
        email: session.userId,
        role: session.role,
      }}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Page Heading and Mode Banner */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl flex items-center gap-2">
                <Sparkles className="size-6 text-brand" />
                <span>Target Asset Matches</span>
              </h1>

              {matchingResult.engine === "ai" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-500/20">
                  <Sparkles className="size-3" />
                  <span>AI Matching Active</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-500/20">
                  <ShieldCheck className="size-3" />
                  <span>Deterministic Rule Scorer</span>
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Regulated opportunities matched against mandate criteria for{" "}
              <strong className="text-ink font-semibold">{profile.company}</strong> (
              {profile.currency} {profile.ticketMin ? `$${profile.ticketMin.toString()}` : "Any"} –{" "}
              {profile.ticketMax ? `$${profile.ticketMax.toString()}` : "Any"}).
            </p>

            {matchingResult.engine === "ai" ? (
              <p className="text-xs text-purple-700/90 flex items-center gap-1.5">
                <Sparkles className="size-3 shrink-0" />
                <span>
                  Matches are evaluated by OpenRouter AI against your investment thesis and weighted by regulatory compatibility.
                </span>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Sliders className="size-3 shrink-0" />
                <span>
                  Matches are ranked deterministically by regulatory charter (35%), jurisdiction (30%), business model (20%), and ticket envelope (15%).
                </span>
              </p>
            )}
          </div>

          <Button asChild variant="outline" className="rounded-xl border-hairline text-xs font-medium shrink-0">
            <Link href="/buyer">Edit Mandate</Link>
          </Button>
        </div>

        {/* Results count & Matched Cards */}
        {matchingResult.matches.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>
                Found <strong className="text-ink font-semibold">{matchingResult.matches.length}</strong> compatible{" "}
                {matchingResult.matches.length === 1 ? "opportunity" : "opportunities"}
              </span>
              <span>Sorted by highest compatibility score</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matchingResult.matches.map((item) => (
                <MatchedAssetCard
                  key={item.asset.id}
                  item={item}
                  isFavorite={favSet.has(item.asset.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No matches found for current mandate criteria"
            description="Try expanding your target jurisdictions, permitted charter licenses, or budget parameters in your investment profile."
            action={{
              label: "Update Mandate Profile",
              href: "/buyer",
            }}
          />
        )}
      </div>
    </AppShell>
  );
}
