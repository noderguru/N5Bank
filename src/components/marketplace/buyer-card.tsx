import Link from "next/link";
import type { BusinessType, InvestmentHorizon, LicenseType } from "@prisma/client";
import { Building2, Globe2, Send, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatEnum, formatLicenseType, formatTicketRange } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export type BuyerCardData = {
  id: string;
  name: string;
  company: string;
  country: string;
  thesis?: string | null;
  ticketMin?: number | string | null;
  ticketMax?: number | string | null;
  currency?: string;
  targetCountries?: string[];
  targetLicenseTypes?: LicenseType[];
  targetBusinessTypes?: BusinessType[];
  horizon?: InvestmentHorizon;
  verified?: boolean;
};

export type BuyerCardProps = {
  buyer: BuyerCardData;
  className?: string;
  onSendMemo?: (buyerId: string) => void;
};

export function BuyerCard({
  buyer,
  className,
  onSendMemo,
}: BuyerCardProps) {
  const {
    id,
    name,
    company,
    country,
    thesis,
    ticketMin,
    ticketMax,
    currency = "USD",
    targetCountries = [],
    targetLicenseTypes = [],
    horizon,
  } = buyer;

  const ticketDisplay = formatTicketRange(ticketMin, ticketMax, currency);

  return (
    <article
      data-testid="buyer-card"
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-5 transition-all hover:border-brand/60 hover:shadow-xs",
        className
      )}
    >
      <div className="space-y-4">
        {/* Header: Company & Ticket Range */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Building2 className="size-4 text-brand shrink-0" />
              <h3 className="text-base font-semibold text-ink leading-tight tracking-tight truncate" title={company}>
                <Link href={`/buyers/${id}`} className="hover:text-brand hover:underline">
                  {company}
                </Link>
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-ink/80 truncate max-w-[120px]">{name}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 shrink-0">
                <Globe2 className="size-3 shrink-0" />
                <span>{country}</span>
              </span>
            </div>
          </div>

          <div className="sm:text-right shrink-0">
            <Badge
              variant="outline"
              className="rounded-full border-brand/20 bg-tint px-2.5 py-1 text-xs font-semibold text-brand"
            >
              {ticketDisplay}
            </Badge>
          </div>
        </div>

        {/* Investment Thesis */}
        <div className="space-y-1 rounded-xl border border-hairline/60 bg-canvas/30 p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Acquisition Thesis
          </span>
          <p className="text-xs text-ink/90 leading-relaxed line-clamp-2">
            {thesis || "Actively seeking strategic financial licenses and established fintech infrastructure."}
          </p>
        </div>

        {/* Target Criteria: Countries & Licences */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Target Markets
            </span>
            <div className="flex flex-wrap gap-1">
              {targetCountries.length > 0 ? (
                targetCountries.slice(0, 3).map((targetCountry, idx) => (
                  <span
                    key={idx}
                    className="inline-block rounded-md bg-canvas px-1.5 py-0.5 text-[11px] font-medium text-ink"
                  >
                    {targetCountry}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-muted-foreground italic">Global / Any</span>
              )}
              {targetCountries.length > 3 && (
                <span className="text-[10px] font-medium text-muted-foreground self-center">
                  +{targetCountries.length - 3}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Target Licences
            </span>
            <div className="flex flex-wrap gap-1">
              {targetLicenseTypes.length > 0 ? (
                targetLicenseTypes.slice(0, 2).map((licence, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-md bg-canvas px-1.5 py-0.5 text-[11px] font-medium text-ink"
                  >
                    <Tag className="size-2.5 text-muted-foreground" />
                    <span>{formatLicenseType(licence)}</span>
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-muted-foreground italic">Flexible</span>
              )}
              {targetLicenseTypes.length > 2 && (
                <span className="text-[10px] font-medium text-muted-foreground self-center">
                  +{targetLicenseTypes.length - 2}
                </span>
              )}
            </div>
          </div>
        </div>

        {horizon && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>Target timeframe:</span>
            <span className="font-semibold text-ink">{formatEnum(horizon)}</span>
          </div>
        )}
      </div>

      {/* Action CTA Bottom Row */}
      <div className="mt-5 flex items-center justify-end gap-2 border-t border-hairline pt-3">
        {onSendMemo ? (
          <Button
            type="button"
            onClick={() => onSendMemo(id)}
            className="h-8 gap-1.5 rounded-xl bg-brand text-xs font-medium text-surface hover:bg-brand/90 shadow-xs"
          >
            <Send className="size-3.5" />
            <span>Send deal memo</span>
          </Button>
        ) : (
          <Button
            asChild
            className="h-8 gap-1.5 rounded-xl bg-brand text-xs font-medium text-surface hover:bg-brand/90 shadow-xs"
          >
            <Link href={`/inbox?recipient=${id}`}>
              <Send className="size-3.5" />
              <span>Send deal memo</span>
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}
