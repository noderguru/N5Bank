"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FilterX, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const COMMON_COUNTRIES = [
  "United Kingdom",
  "Germany",
  "Lithuania",
  "Switzerland",
  "Poland",
  "Cyprus",
  "Spain",
  "Singapore",
  "United Arab Emirates",
  "Malta",
  "Estonia",
];

const LICENSE_TYPES = [
  { value: "BANKING", label: "Banking" },
  { value: "E_MONEY", label: "E-Money / EMI" },
  { value: "PAYMENT", label: "Payment (PI)" },
  { value: "CRYPTO", label: "Crypto / VASP" },
  { value: "BROKERAGE", label: "Brokerage" },
  { value: "INSURANCE", label: "Insurance" },
];

const TICKET_RANGES = [
  { value: "under_1m", label: "Under $1M" },
  { value: "1m_5m", label: "$1M – $5M" },
  { value: "5m_20m", label: "$5M – $20M" },
  { value: "over_20m", label: "$20M+" },
];

export function BuyerFilters() {
  const t = useTranslations("marketplace");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentQ = searchParams.get("q") || "";
  const currentCountry = searchParams.get("country") || "";
  const currentLicense = searchParams.get("licenseType") || "";
  const currentTicket = searchParams.get("ticket") || "";

  const hasActiveFilters = Boolean(
    currentQ || currentCountry || currentLicense || currentTicket
  );

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`/buyers?${params.toString()}`);
    });
  };

  const handleReset = () => {
    startTransition(() => {
      router.push("/buyers");
    });
  };

  return (
    <div className="rounded-2xl border border-hairline bg-surface p-4 shadow-2xs space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={currentQ}
            onChange={(e) => updateParam("q", e.target.value)}
            placeholder={`${tCommon("search")}...`}
            className="pl-9 h-10 rounded-xl border-hairline bg-canvas/30 text-sm focus-visible:ring-brand"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Country Dropdown */}
          <select
            value={currentCountry}
            onChange={(e) => updateParam("country", e.target.value)}
            className="h-10 rounded-xl border border-hairline bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-canvas/50 focus:outline-none focus:ring-1 focus:ring-brand"
            aria-label="Filter by country"
          >
            <option value="">{tCommon("all")} {tCommon("country")}</option>
            {COMMON_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* License Type Dropdown */}
          <select
            value={currentLicense}
            onChange={(e) => updateParam("licenseType", e.target.value)}
            className="h-10 rounded-xl border border-hairline bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-canvas/50 focus:outline-none focus:ring-1 focus:ring-brand"
            aria-label="Filter by target licence"
          >
            <option value="">{tCommon("all")} {t("licenseType")}</option>
            {LICENSE_TYPES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>

          {/* Ticket Range Dropdown */}
          <select
            value={currentTicket}
            onChange={(e) => updateParam("ticket", e.target.value)}
            className="h-10 rounded-xl border border-hairline bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-canvas/50 focus:outline-none focus:ring-1 focus:ring-brand"
            aria-label="Filter by ticket size"
          >
            <option value="">{tCommon("all")} {t("ticketRange")}</option>
            {TICKET_RANGES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-10 px-3 rounded-xl text-xs font-medium text-muted-foreground hover:text-ink hover:bg-canvas"
            >
              <FilterX className="mr-1.5 size-3.5" />
              <span>{tCommon("reset")}</span>
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
          <SlidersHorizontal className="size-3 text-brand" />
          <span>Active filter query applied</span>
        </div>
      )}
    </div>
  );
}
