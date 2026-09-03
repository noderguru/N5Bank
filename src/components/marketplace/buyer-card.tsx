"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import type { BusinessType, InvestmentHorizon, LicenseType } from "@prisma/client";
import { Building2, Globe2, Send, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTicketRange } from "@/lib/formatters";
import { useEnumLabel, useFormatLabels } from "@/lib/i18n-format";
import { cn } from "@/lib/utils";

export type BuyerCardData = {
  id: string;
  name?: string | null;
  company: string;
  country: string;
  thesis?: string | null;
  ticketMin?: number | string | null;
  ticketMax?: number | string | null;
  currency?: string;
  targetCountries?: string[];
  targetLicenseTypes?: LicenseType[];
  targetBusinessTypes?: BusinessType[];
  horizon?: InvestmentHorizon | null;
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
  const t = useTranslations("marketplace");
  const enumLabel = useEnumLabel();
  const { locale, ticket } = useFormatLabels();
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

  const ticketDisplay = formatTicketRange(ticketMin, ticketMax, currency, locale, ticket);

  return (
    <article
      data-testid="buyer-card"
      className={cn(
        "group relative flex flex-col justify-between bg-surface p-6 transition-colors duration-200 ease-out hover:bg-tint-subtle",
        className
      )}
    >
      <div className="space-y-4">
        {/* Header: Company & Ticket Range */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Building2 className="size-4 shrink-0 text-ink" />
              <h3 className="text-base font-semibold text-ink leading-tight tracking-tight truncate" title={company}>
                <Link href={`/buyers/${id}`} className="hover:underline">
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
              className="rounded-none border-hairline bg-transparent px-2 py-0.5 eyebrow text-ink"
            >
              {ticketDisplay}
            </Badge>
          </div>
        </div>

        {/* Mandate Thesis */}
        <div className="space-y-1 border-y border-hairline py-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("investmentThesis")}
          </span>
          <p className="text-xs text-ink/90 leading-relaxed line-clamp-2">
            {thesis || "Actively seeking strategic financial licenses and established fintech infrastructure."}
          </p>
        </div>

        {/* Target Criteria: Countries & Licences */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("targetJurisdictions")}
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
                <span className="text-[11px] italic text-muted-foreground">{t("globalAny")}</span>
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
              {t("licenseType")}
            </span>
            <div className="flex flex-wrap gap-1">
              {targetLicenseTypes.length > 0 ? (
                targetLicenseTypes.slice(0, 2).map((licence, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-md bg-canvas px-1.5 py-0.5 text-[11px] font-medium text-ink"
                  >
                    <Tag className="size-2.5 text-muted-foreground" />
                    <span>{enumLabel("licenseType", licence)}</span>
                  </span>
                ))
              ) : (
                <span className="text-[11px] italic text-muted-foreground">{enumLabel("horizon", "FLEXIBLE")}</span>
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
            <span>{t("targetTimeframe")}</span>
            <span className="font-semibold text-ink">{enumLabel("horizon", horizon)}</span>
          </div>
        )}
      </div>

      {/* Action CTA Bottom Row */}
      <div className="mt-5 flex items-center justify-end gap-2 border-t border-hairline pt-3">
        {onSendMemo ? (
          <Button
            type="button"
            onClick={() => onSendMemo(id)}
            className="h-9 gap-1.5 rounded-none border border-ink bg-ink caps text-canvas transition-colors hover:bg-transparent hover:text-ink"
          >
            <Send className="size-3.5" />
            <span>{t("sendDealMemo")}</span>
          </Button>
        ) : (
          <Button
            asChild
            className="h-9 gap-1.5 rounded-none border border-ink bg-ink caps text-canvas transition-colors hover:bg-transparent hover:text-ink"
          >
            <Link href={`/inbox?recipient=${id}`}>
              <Send className="size-3.5" />
              <span>{t("sendDealMemo")}</span>
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}
