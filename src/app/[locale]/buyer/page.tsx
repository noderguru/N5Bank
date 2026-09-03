import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowRight, Bookmark, MessageSquare, Search } from "lucide-react";
import { readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { BuyerProfileForm } from "@/components/marketplace/buyer-profile-form";

export const metadata = {
  title: "Buyer Mandate & Profile | N5Deal Marketplace",
  description: "Manage institutional investment thesis, acquisition criteria, and target check sizes.",
};

export default async function BuyerDashboardPage() {
  const t = await getTranslations("buyerWorkspace");
  const session = await readSession();

  if (!session) {
    redirect("/login?next=/buyer");
  }

  if (session.role !== "BUYER" && session.role !== "MANAGER") {
    redirect("/forbidden");
  }

  const [profile, savedCount, unreadCount, publishedAssetsCount] = await Promise.all([
    prisma.buyerProfile.findUnique({
      where: { userId: session.userId },
    }),
    prisma.favorite.count({
      where: {
        userId: session.userId,
        asset: {
          status: "PUBLISHED",
          seller: { status: "ACTIVE" },
        },
      },
    }),
    prisma.message.count({
      where: {
        conversation: { buyerId: session.userId },
        senderId: { not: session.userId },
        readAt: null,
      },
    }),
    prisma.asset.count({
      where: { status: "PUBLISHED", seller: { status: "ACTIVE" } },
    }),
  ]);

  const initialProfile = profile
    ? {
        company: profile.company,
        country: profile.country,
        bio: profile.bio,
        thesis: profile.thesis,
        ticketMin: profile.ticketMin ? Number(profile.ticketMin) : null,
        ticketMax: profile.ticketMax ? Number(profile.ticketMax) : null,
        currency: profile.currency,
        targetCountries: profile.targetCountries,
        targetLicenseTypes: profile.targetLicenseTypes,
        targetBusinessTypes: profile.targetBusinessTypes,
        horizon: profile.horizon,
      }
    : null;

  return (
    <AppShell
      user={{
        id: session.userId,
        email: session.userId,
        role: session.role,
      }}
    >
      <div className="space-y-8 max-w-4xl mx-auto pb-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Buyer Mandate &amp; Profile
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Maintain your acquisition criteria, target geographies, and investment thesis.
            Your mandate drives automated matching against vetted financial charters.
          </p>
        </div>

        {/* Quick Nav Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/assets"
            className="group flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-4 transition-all hover:border-brand/60 hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <Search className="size-4 text-brand" />
              <ArrowRight className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-brand transition-all" />
            </div>
            <div className="mt-3">
              <div className="text-sm font-semibold text-ink">{t("catalogue")}</div>
              <div className="text-xs text-muted-foreground">
                {publishedAssetsCount} active opportunities
              </div>
            </div>
          </Link>

          <Link
            href="/buyer/saved"
            className="group flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-4 transition-all hover:border-brand/60 hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <Bookmark className="size-4 text-brand" />
              <ArrowRight className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-brand transition-all" />
            </div>
            <div className="mt-3">
              <div className="text-sm font-semibold text-ink">{t("watchlist")}</div>
              <div className="text-xs text-muted-foreground">
                {savedCount} saved {savedCount === 1 ? "asset" : "assets"}
              </div>
            </div>
          </Link>

          <Link
            href="/inbox"
            className="group flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-4 transition-all hover:border-brand/60 hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <MessageSquare className="size-4 text-brand" />
              <ArrowRight className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-brand transition-all" />
            </div>
            <div className="mt-3">
              <div className="text-sm font-semibold text-ink">{t("inbox")}</div>
              <div className="text-xs text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : "Deal messages"}
              </div>
            </div>
          </Link>
        </div>

        {/* Profile Editor Form */}
        <BuyerProfileForm initialProfile={initialProfile} />
      </div>
    </AppShell>
  );
}
