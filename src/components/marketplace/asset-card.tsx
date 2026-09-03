"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import type { AssetStatus, BusinessStatus, BusinessType, LicenseType, PriceMode } from "@prisma/client";
import { CheckCircle2, Globe2, MessageSquare, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/marketplace/favorite-button";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/formatters";
import { useEnumLabel, useFormatLabels } from "@/lib/i18n-format";

export type AssetCardData = {
  id: string;
  title: string;
  summary: string;
  country: string;
  licenseType: LicenseType;
  businessType: BusinessType;
  businessStatus: BusinessStatus;
  askingPrice?: number | string | null;
  priceMode?: PriceMode;
  currency?: string;
  features?: string[];
  status?: AssetStatus;
  validated?: boolean;
  views?: number;
  regulator?: string | null;
  isFavorite?: boolean;
};

type AssetCardProps = {
  asset: AssetCardData;
  className?: string;
  onContact?: (assetId: string) => void;
  maxFeatures?: number;
};

export function AssetCard({
  asset,
  className,
  onContact,
  maxFeatures = 2,
}: AssetCardProps) {
  const t = useTranslations("marketplace");
  const enumLabel = useEnumLabel();
  const { locale, price } = useFormatLabels();
  const tCommon = useTranslations("common");
  const {
    id,
    title,
    summary,
    country,
    licenseType,
    businessType,
    businessStatus,
    askingPrice,
    priceMode = "FIXED",
    currency = "USD",
    features = [],
    validated = false,
    regulator,
  } = asset;

  const displayPrice = formatPrice(askingPrice, priceMode, currency, locale, price);
  const visibleFeatures = features.slice(0, maxFeatures);
  const overflowCount = features.length - maxFeatures;

  return (
    <article
      data-testid="asset-card"
      className={cn(
        "group relative flex flex-col justify-between bg-surface p-6 rounded-[5px] border border-hairline transition-all duration-200 ease-out hover:border-[#2bee4b]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]",
        className
      )}
    >
      <div className="space-y-4">
        {/* Top Header: Badge, Country, Price */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 border border-hairline px-2 py-0.5 eyebrow text-ink">
              <Globe2 className="size-3.5 shrink-0" />
              <span className="max-w-[160px] truncate">{country}</span>
            </span>

            {validated && (
              <span
                data-testid="validated-badge"
                className="inline-flex items-center gap-1 border border-success/40 bg-success-tint px-2 py-0.5 eyebrow text-success"
              >
                <CheckCircle2 className="size-3 shrink-0" />
                <span>{tCommon("validated")}</span>
              </span>
            )}
          </div>

          <div className="sm:text-right shrink-0">
            <div className="tnum font-lausanne text-base font-bold text-ink tracking-[0.01em] text-ink">{displayPrice}</div>
            {priceMode !== "FIXED" && (
              <div className="eyebrow text-muted-foreground">
                {priceMode === "ON_LOI" ? tCommon("uponLoi") : tCommon("underNda")}
              </div>
            )}
          </div>
        </div>

        {/* Title & Summary */}
        <div className="space-y-1.5">
          <h3 className="font-lausanne text-base font-semibold leading-snug text-ink line-clamp-2">
            <Link href={`/assets/${id}`} prefetch={false} className="focus:outline-none">
              {title}
            </Link>
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {summary}
          </p>
        </div>

        {/* Spec Grid: Signature 4-cell layout */}
        {/* Two columns, not four: at three cards per row a quarter-width cell cannot hold the ru/uk labels without truncating them. */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-hairline py-3">
          <div className="space-y-0.5">
            <span className="eyebrow text-muted-foreground">
              {tCommon("country")}
            </span>
            <div className="text-xs font-medium break-words text-ink" title={country}>
              {country}
            </div>
            {regulator && (
              <div className="text-[10px] break-words text-muted-foreground" title={regulator}>
                {regulator}
              </div>
            )}
          </div>

          <div className="space-y-0.5">
            <span className="eyebrow text-muted-foreground">
              {t("licenseType")}
            </span>
            <div className="text-xs font-medium break-words text-ink">
              {enumLabel("licenseType", licenseType)}
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="eyebrow text-muted-foreground">
              {t("businessType")}
            </span>
            <div className="text-xs font-medium break-words text-ink">
              {enumLabel("businessType", businessType)}
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="eyebrow text-muted-foreground">
              {tCommon("status")}
            </span>
            <div className="text-xs font-medium break-words text-ink">
              {enumLabel("businessStatus", businessStatus)}
            </div>
          </div>
        </div>

        {/* Features Chips */}
        {features.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {visibleFeatures.map((feat, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="rounded-[4px] border-hairline bg-transparent px-2 py-0.5 eyebrow font-normal text-muted-foreground"
              >
                {feat}
              </Badge>
            ))}
            {overflowCount > 0 && (
              <Badge
                variant="outline"
                className="rounded-[4px] border-hairline bg-transparent px-2 py-0.5 eyebrow text-muted-foreground"
              >
                {tCommon("andMore", { count: overflowCount })}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Two-tier CTA Bottom Row */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5">
          <Button
            asChild
            variant="outline"
            className="h-9 gap-1.5 rounded-[4px] border-hairline caps hover:border-ink hover:bg-transparent hover:text-ink"
          >
            <Link href={`/assets/${id}`} prefetch={false}>
              <span>{tCommon("details")}</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>

          <FavoriteButton
            assetId={id}
            initialFavorite={asset.isFavorite}
            size="icon"
            variant="ghost"
            showLabel={false}
            className="size-9 rounded-none"
          />
        </div>

        {onContact ? (
          <Button
            type="button"
            onClick={() => onContact(id)}
            className="h-9 min-w-0 flex-1 gap-1.5 rounded-[5px] border border-ink bg-ink caps text-canvas transition-colors hover:bg-transparent hover:text-ink sm:flex-none"
          >
            <MessageSquare className="size-3.5" />
            <span className="truncate">{t("contactSeller")}</span>
          </Button>
        ) : (
          <Button
            asChild
            className="h-9 min-w-0 flex-1 gap-1.5 rounded-[5px] border border-ink bg-ink caps text-canvas transition-colors hover:bg-transparent hover:text-ink sm:flex-none"
          >
            <Link href={`/assets/${id}?contact=true`} prefetch={false}>
              <MessageSquare className="size-3.5" />
              <span className="truncate">{t("contactSeller")}</span>
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}
