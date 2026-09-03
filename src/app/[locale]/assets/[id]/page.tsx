import { Link } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { ViewTracker } from "@/components/marketplace/view-tracker";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Globe2,
  ShieldCheck,
  Users,
  Eye,
} from "lucide-react";
import { readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/marketplace/sparkline";
import { FavoriteButton } from "@/components/marketplace/favorite-button";
import { ContactSellerButton } from "@/components/marketplace/contact-seller-button";
import { getTranslations } from "next-intl/server";
import { formatPrice, formatDate } from "@/lib/formatters";

type Props = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const asset = await prisma.asset.findUnique({
    where: { id },
    select: { title: true, summary: true },
  });

  if (!asset) {
    return { title: "Asset Not Found | N5Deal Marketplace" };
  }

  return {
    title: `${asset.title} | N5Deal Marketplace`,
    description: asset.summary,
  };
}

export default async function AssetDetailPage({ params }: Props) {
  const { id, locale } = await params;
  const session = await readSession();

  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      seller: {
        include: {
          sellerProfile: true,
        },
      },
    },
  });

  // Criterion: "Невалидный id даёт 404, а не краш", plus suspended sellers are hidden
  if (
    !asset ||
    asset.status !== "PUBLISHED" ||
    asset.seller.status !== "ACTIVE"
  ) {
    notFound();
  }

  const displayViews = asset.views;

  let isFavorite = false;
  if (session) {
    const fav = await prisma.favorite.findUnique({
      where: {
        userId_assetId: {
          userId: session.userId,
          assetId: asset.id,
        },
      },
    });
    isFavorite = Boolean(fav);
  }

  const t = await getTranslations("assetDetail");
  const tMarketplace = await getTranslations("marketplace");
  const tCommon = await getTranslations("common");
  const tEnums = await getTranslations("enums");
  const enumLabel = (group: string, value: string) => tEnums(`${group}.${value}`);
  const priceLabels = {
    onRequest: tCommon("priceOnRequest"),
    uponLoi: tCommon("uponLoi"),
    underNda: tCommon("underNda"),
  };

  const formattedPrice = formatPrice(
    asset.askingPrice ? Number(asset.askingPrice) : null,
    asset.priceMode,
    asset.currency,
    locale,
    priceLabels
  );

  const sellerCompany =
    asset.seller.sellerProfile?.company || asset.seller.name || t("verifiedInstitution");
  const sellerCountry = asset.seller.sellerProfile?.country || asset.country;
  const isVerifiedSeller = asset.seller.sellerProfile?.verified ?? true;


  return (
    <AppShell
      user={
        session
          ? { id: session.userId, email: session.userId, role: session.role }
          : null
      }
    >
      <ViewTracker assetId={asset.id} />
      <div className="space-y-8 max-w-5xl mx-auto pb-12">
        {/* Back Link and Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/assets"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-brand transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>{t("backToCatalogue")}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="size-3.5" />
              <span>{t("views", { count: displayViews })}</span>
            </span>

            {asset.validated && (
              <span
                data-testid="validated-badge"
                className="inline-flex items-center gap-1 rounded-full bg-success-tint px-2.5 py-0.5 text-xs font-semibold text-success"
              >
                <CheckCircle2 className="size-3.5 shrink-0" />
                <span>{t("regulatoryValidated")}</span>
              </span>
            )}
          </div>
        </div>

        {/* Title and Pricing Header */}
        <div className="rounded-[5px] border border-hairline bg-surface p-6 sm:p-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-tint px-3 py-1 text-xs font-semibold text-brand">
                  <Globe2 className="size-3.5" />
                  <span>{asset.country}</span>
                </span>
                <Badge variant="outline" className="rounded-full border-hairline px-3 py-0.5 text-xs font-medium">
                  {enumLabel("licenseType", asset.licenseType)}
                </Badge>
                <Badge variant="outline" className="rounded-full border-hairline px-3 py-0.5 text-xs font-medium">
                  {enumLabel("businessType", asset.businessType)}
                </Badge>
              </div>

              <h1 className="font-mondwest text-3xl sm:text-5xl tracking-tight text-ink leading-tight">
                {asset.title}
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {asset.summary}
              </p>
            </div>

            {/* Price Box */}
            <div className="rounded-[5px] border border-hairline bg-canvas/40 p-5 sm:min-w-[240px] shrink-0 text-left md:text-right space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {tMarketplace("askingPrice")}
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                {formattedPrice}
              </div>
              {asset.priceMode !== "FIXED" && (
                <p className="text-xs text-brand font-medium">
                  {asset.priceMode === "ON_LOI"
                    ? t("availableUponLoi")
                    : t("protectedUnderNda")}
                </p>
              )}
            </div>
          </div>

          {/* Action Row: Contact Seller and Favorite CTA */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline/70 pt-5">
            <div className="flex flex-wrap items-center gap-3">
              <ContactSellerButton
                sellerId={asset.sellerId}
                assetId={asset.id}
                isSuspended={false}
                sellerName={sellerCompany}
              />
              <FavoriteButton
                assetId={asset.id}
                initialFavorite={isFavorite}
              />
            </div>

            <div className="text-xs text-muted-foreground">
              {t("listedOn", { date: formatDate(asset.createdAt, locale) })}
            </div>
          </div>
        </div>

        {/* 4-Cell Signature Spec Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-[5px] border border-hairline bg-surface p-5 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Globe2 className="size-3.5 text-brand" />
              <span>{t("jurisdiction")}</span>
            </div>
            <div className="text-sm font-semibold text-ink">{asset.country}</div>
            {asset.regulator && (
              <div className="text-xs text-muted-foreground truncate" title={asset.regulator}>
                {asset.regulator}
              </div>
            )}
          </div>

          <div className="rounded-[5px] border border-hairline bg-surface p-5 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="size-3.5 text-brand" />
              <span>{tMarketplace("licenseType")}</span>
            </div>
            <div className="text-sm font-semibold text-ink">
              {enumLabel("licenseType", asset.licenseType)}
            </div>
            <div className="text-xs text-muted-foreground">
              {enumLabel("businessStatus", asset.businessStatus)}
            </div>
          </div>

          <div className="rounded-[5px] border border-hairline bg-surface p-5 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Calendar className="size-3.5 text-brand" />
              <span>{t("yearEstablished")}</span>
            </div>
            <div className="text-sm font-semibold text-ink">
              {asset.yearOfIssue ? asset.yearOfIssue : tCommon("notAvailable")}
            </div>
            <div className="text-xs text-muted-foreground">{t("operatingHistory")}</div>
          </div>

          <div className="rounded-[5px] border border-hairline bg-surface p-5 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Users className="size-3.5 text-brand" />
              <span>{t("headcount")}</span>
            </div>
            <div className="text-sm font-semibold text-ink">
              {asset.employees !== null ? t("employees", { count: asset.employees }) : t("undisclosed")}
            </div>
            <div className="text-xs text-muted-foreground">{t("staffPersonnel")}</div>
          </div>
        </div>

        {/* Two-Column Body: Description & Details vs Sidebar Sparkline & Seller */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="rounded-3xl border border-hairline bg-surface p-6 sm:p-7 shadow-2xs space-y-4">
              <h2 className="text-base font-semibold text-ink tracking-tight">
                {t("overviewTitle")}
              </h2>
              <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-line text-sm">
                {asset.description}
              </div>
            </div>

            {/* Features Tags */}
            {asset.features.length > 0 && (
              <div className="rounded-3xl border border-hairline bg-surface p-6 sm:p-7 shadow-2xs space-y-3">
                <h2 className="text-base font-semibold text-ink tracking-tight">
                  {t("includedTitle")}
                </h2>
                <div className="flex flex-wrap gap-2 pt-1">
                  {asset.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-canvas/70 px-3.5 py-1 text-xs font-medium text-ink shadow-2xs"
                    >
                      <CheckCircle2 className="size-3 text-brand" />
                      <span>{feature}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Market Trend Sparkline */}
            <Sparkline
              label={t("valuationIndex", { type: enumLabel("licenseType", asset.licenseType) })}
              changePercent="+18.4% YoY"
            />

            {/* Seller / Mandate Representative Block */}
            <div className="rounded-2xl border border-hairline bg-surface p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("listingCounterparty")}
                </span>
                {isVerifiedSeller && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-tint px-2 py-0.5 text-[11px] font-semibold text-success">
                    <ShieldCheck className="size-3" />
                    <span>{t("verifiedSeller")}</span>
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-brand" />
                  <span className="text-sm font-semibold text-ink">
                    {sellerCompany}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("sellerJurisdiction", { country: sellerCountry })}
                </div>
              </div>

              {asset.seller.sellerProfile?.bio && (
                <p className="text-xs text-muted-foreground leading-relaxed border-t border-hairline/60 pt-3">
                  {asset.seller.sellerProfile.bio}
                </p>
              )}

              <div className="border-t border-hairline/60 pt-3">
                <ContactSellerButton
                  sellerId={asset.sellerId}
                  assetId={asset.id}
                  isSuspended={false}
                  sellerName={sellerCompany}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
