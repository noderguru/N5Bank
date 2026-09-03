import Link from "next/link";
import type { AssetStatus, BusinessStatus, BusinessType, LicenseType, PriceMode } from "@prisma/client";
import { CheckCircle2, Globe2, MessageSquare, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatEnum, formatLicenseType, formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/utils";

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
};

export type AssetCardProps = {
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

  const displayPrice = formatPrice(askingPrice, priceMode, currency);
  const visibleFeatures = features.slice(0, maxFeatures);
  const overflowCount = features.length - maxFeatures;

  return (
    <article
      data-testid="asset-card"
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-5 transition-all hover:border-brand/60 hover:shadow-xs",
        className
      )}
    >
      <div className="space-y-4">
        {/* Top Header: Badge, Country, Price */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-tint px-2.5 py-0.5 text-xs font-semibold text-brand">
              <Globe2 className="size-3.5 shrink-0" />
              <span className="truncate max-w-[120px]">{country}</span>
            </span>

            {validated && (
              <span
                data-testid="validated-badge"
                className="inline-flex items-center gap-1 rounded-full bg-success-tint px-2 py-0.5 text-[11px] font-semibold text-success"
              >
                <CheckCircle2 className="size-3 shrink-0" />
                <span>Validated</span>
              </span>
            )}
          </div>

          <div className="sm:text-right shrink-0">
            <div className="text-sm font-bold text-ink tracking-tight">{displayPrice}</div>
            {priceMode !== "FIXED" && (
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                {priceMode === "ON_LOI" ? "Letter of Intent" : "Confidential"}
              </div>
            )}
          </div>
        </div>

        {/* Title & Summary */}
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-ink leading-snug tracking-tight line-clamp-2 group-hover:text-brand transition-colors">
            <Link href={`/assets/${id}`} prefetch={false} className="focus:outline-none">
              {title}
            </Link>
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {summary}
          </p>
        </div>

        {/* Spec Grid: Signature 4-cell layout */}
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-hairline bg-canvas/40 p-2.5 sm:grid-cols-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Jurisdiction
            </span>
            <div className="text-xs font-medium text-ink truncate" title={country}>
              {country}
            </div>
            {regulator && (
              <div className="text-[10px] text-muted-foreground truncate" title={regulator}>
                {regulator}
              </div>
            )}
          </div>

          <div className="space-y-0.5 border-l border-hairline/60 pl-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Licence
            </span>
            <div className="text-xs font-medium text-ink truncate">
              {formatLicenseType(licenseType)}
            </div>
          </div>

          <div className="space-y-0.5 border-l border-hairline/60 pl-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Structure
            </span>
            <div className="text-xs font-medium text-ink truncate">
              {formatEnum(businessType)}
            </div>
          </div>

          <div className="space-y-0.5 border-l border-hairline/60 pl-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </span>
            <div className="text-xs font-medium text-ink truncate">
              {formatEnum(businessStatus)}
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
                className="rounded-full border-hairline bg-surface text-[11px] font-normal text-muted-foreground px-2 py-0.5"
              >
                {feat}
              </Badge>
            ))}
            {overflowCount > 0 && (
              <Badge
                variant="outline"
                className="rounded-full border-hairline bg-canvas text-[11px] font-medium text-muted-foreground px-2 py-0.5"
              >
                +{overflowCount} more
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Two-tier CTA Bottom Row */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-hairline pt-3">
        <Button
          asChild
          variant="outline"
          className="h-8 gap-1 rounded-xl border-hairline text-xs font-medium hover:border-brand hover:text-brand"
        >
          <Link href={`/assets/${id}`} prefetch={false}>
            <span>View specs</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </Button>

        {onContact ? (
          <Button
            type="button"
            onClick={() => onContact(id)}
            className="h-8 gap-1.5 rounded-xl bg-brand text-xs font-medium text-surface hover:bg-brand/90 shadow-xs"
          >
            <MessageSquare className="size-3.5" />
            <span>Contact seller</span>
          </Button>
        ) : (
          <Button
            asChild
            className="h-8 gap-1.5 rounded-xl bg-brand text-xs font-medium text-surface hover:bg-brand/90 shadow-xs"
          >
            <Link href={`/assets/${id}?contact=true`} prefetch={false}>
              <MessageSquare className="size-3.5" />
              <span>Contact seller</span>
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}
