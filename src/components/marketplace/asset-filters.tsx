"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, X, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useEnumLabel } from "@/lib/i18n-format";
import { NaturalSearch } from "@/components/marketplace/natural-search";

// Values only — every label comes from the enums dictionary at render time.
const BUSINESS_TYPES = [
  "BANK",
  "FINTECH",
  "PAYMENT_INSTITUTION",
  "CRYPTO_BUSINESS",
  "BROKERAGE",
  "INSURANCE_COMPANY",
  "OTHER",
];

const LICENSE_TYPES = [
  "BANKING",
  "E_MONEY",
  "PAYMENT",
  "CRYPTO",
  "BROKERAGE",
  "INSURANCE",
  "OTHER",
];

const BUSINESS_STATUSES = ["OPERATING", "PRE_LAUNCH", "DORMANT", "DISTRESSED"];

const PRICE_RANGES = [
  { value: "under_1m", key: "priceUnder1m" },
  { value: "1m_5m", key: "price1m5m" },
  { value: "5m_20m", key: "price5m20m" },
  { value: "over_20m", key: "priceOver20m" },
] as const;

const SORT_OPTIONS = [
  { value: "newest", key: "sortNewest" },
  { value: "price_asc", key: "sortPriceAsc" },
  { value: "price_desc", key: "sortPriceDesc" },
  { value: "popular", key: "sortPopular" },
] as const;

export type AssetFiltersProps = {
  totalCount: number;
  chipCounts: Record<string, number>;
  availableCountries: string[];
};

export function AssetFilters({
  totalCount,
  chipCounts,
  availableCountries,
}: AssetFiltersProps) {
  const t = useTranslations("marketplace");
  const tCommon = useTranslations("common");
  const enumLabel = useEnumLabel();
  const tFilters = useTranslations("filters");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentQ = searchParams.get("q") || "";
  const currentBusinessType = searchParams.get("businessType") || "";
  const currentLicenseType = searchParams.get("licenseType") || "";
  const currentCountry = searchParams.get("country") || "";
  const currentBusinessStatus = searchParams.get("businessStatus") || "";
  const currentPrice = searchParams.get("price") || "";
  const currentSort = searchParams.get("sort") || "newest";

  const hasActiveFilters = Boolean(
    currentQ ||
      currentBusinessType ||
      currentLicenseType ||
      currentCountry ||
      currentBusinessStatus ||
      currentPrice ||
      (currentSort && currentSort !== "newest")
  );

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`/assets?${params.toString()}`);
    });
  };

  const handleReset = () => {
    startTransition(() => {
      router.push("/assets");
    });
  };

  const toggleBusinessTypeChip = (type: string) => {
    if (currentBusinessType === type) {
      updateParam("businessType", "");
    } else {
      updateParam("businessType", type);
    }
  };

  return (
    <div className="space-y-4">
      {/* N5B-37 / N5B-99: Natural Language Search with AI and deterministic parsing */}
      <NaturalSearch />

      {/* Search and Secondary Filter Row */}
      <div className="rounded-none border border-hairline bg-surface p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={currentQ}
              onChange={(e) => updateParam("q", e.target.value)}
              placeholder={tCommon("searchPlaceholder")}
              className="pl-9 h-10 rounded-none border-hairline bg-canvas/30 text-sm focus-visible:ring-brand"
            />
            {currentQ && (
              <button
                type="button"
                onClick={() => updateParam("q", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Quick Selects */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Country Select */}
            <select
              value={currentCountry}
              onChange={(e) => updateParam("country", e.target.value)}
              className="h-10 rounded-none border border-hairline bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-canvas/50 focus:outline-none focus:ring-1 focus:ring-brand"
              aria-label={tFilters("allCountries")}
            >
              <option value="">{tFilters("allCountries")}</option>
              {availableCountries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* License Type Select */}
            <select
              value={currentLicenseType}
              onChange={(e) => updateParam("licenseType", e.target.value)}
              className="h-10 rounded-none border border-hairline bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-canvas/50 focus:outline-none focus:ring-1 focus:ring-brand"
              aria-label={tFilters("allLicenceTypes")}
            >
              <option value="">{tFilters("allLicenceTypes")}</option>
              {LICENSE_TYPES.map((value) => (
                <option key={value} value={value}>
                  {enumLabel("licenseType", value)}
                </option>
              ))}
            </select>

            {/* Business Status Select */}
            <select
              value={currentBusinessStatus}
              onChange={(e) => updateParam("businessStatus", e.target.value)}
              className="h-10 rounded-none border border-hairline bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-canvas/50 focus:outline-none focus:ring-1 focus:ring-brand"
              aria-label={tFilters("allStatuses")}
            >
              <option value="">{tFilters("allStatuses")}</option>
              {BUSINESS_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {enumLabel("businessStatus", value)}
                </option>
              ))}
            </select>

            {/* Price Range Select */}
            <select
              value={currentPrice}
              onChange={(e) => updateParam("price", e.target.value)}
              className="h-10 rounded-none border border-hairline bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-canvas/50 focus:outline-none focus:ring-1 focus:ring-brand"
              aria-label={tFilters("allPrices")}
            >
              <option value="">{tFilters("allPrices")}</option>
              {PRICE_RANGES.map((range) => (
                <option key={range.value} value={range.value}>
                  {tFilters(range.key)}
                </option>
              ))}
            </select>

            {/* Sort Select */}
            <select
              value={currentSort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="h-10 rounded-none border border-hairline bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-canvas/50 focus:outline-none focus:ring-1 focus:ring-brand"
              aria-label={t("sortNewest")}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.key)}
                </option>
              ))}
            </select>

            {/* Reset Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-10 gap-1 rounded-none text-xs text-muted-foreground hover:text-ink px-2.5"
                title="Reset all filters"
              >
                <RotateCcw className="size-3.5" />
                <span className="hidden sm:inline">{tCommon("reset")}</span>
              </Button>
            )}
          </div>
        </div>

        {/* N5B-83: Active Filter Chips with individual dismissals */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-hairline/60">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">
              Active:
            </span>
            {currentCountry && (
              <span
                data-testid="chip-country"
                className="inline-flex items-center gap-1 rounded-none bg-brand/10 border border-brand/20 px-2.5 py-0.5 text-xs font-medium text-brand"
              >
                <span>Country: {currentCountry}</span>
                <button
                  type="button"
                  onClick={() => updateParam("country", "")}
                  className="hover:text-ink focus:outline-none ml-0.5"
                  aria-label={`Remove ${currentCountry} filter`}
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {currentLicenseType && (
              <span
                data-testid="chip-license"
                className="inline-flex items-center gap-1 rounded-none bg-brand/10 border border-brand/20 px-2.5 py-0.5 text-xs font-medium text-brand"
              >
                <span>License: {enumLabel("licenseType", currentLicenseType)}</span>
                <button
                  type="button"
                  onClick={() => updateParam("licenseType", "")}
                  className="hover:text-ink focus:outline-none ml-0.5"
                  aria-label="Remove license filter"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {currentBusinessType && (
              <span
                data-testid="chip-business"
                className="inline-flex items-center gap-1 rounded-none bg-brand/10 border border-brand/20 px-2.5 py-0.5 text-xs font-medium text-brand"
              >
                <span>Model: {enumLabel("businessType", currentBusinessType)}</span>
                <button
                  type="button"
                  onClick={() => updateParam("businessType", "")}
                  className="hover:text-ink focus:outline-none ml-0.5"
                  aria-label="Remove business model filter"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {currentBusinessStatus && (
              <span
                data-testid="chip-status"
                className="inline-flex items-center gap-1 rounded-none bg-brand/10 border border-brand/20 px-2.5 py-0.5 text-xs font-medium text-brand"
              >
                <span>Status: {enumLabel("businessStatus", currentBusinessStatus)}</span>
                <button
                  type="button"
                  onClick={() => updateParam("businessStatus", "")}
                  className="hover:text-ink focus:outline-none ml-0.5"
                  aria-label="Remove status filter"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {currentPrice && (
              <span
                data-testid="chip-price"
                className="inline-flex items-center gap-1 rounded-none bg-brand/10 border border-brand/20 px-2.5 py-0.5 text-xs font-medium text-brand"
              >
                <span>
                  {t("askingPrice")}:{" "}
                  {(() => {
                    const range = PRICE_RANGES.find((r) => r.value === currentPrice);
                    return range ? tFilters(range.key) : currentPrice;
                  })()}
                </span>
                <button
                  type="button"
                  onClick={() => updateParam("price", "")}
                  className="hover:text-ink focus:outline-none ml-0.5"
                  aria-label="Remove price filter"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {currentQ && (
              <span
                data-testid="chip-q"
                className="inline-flex items-center gap-1 rounded-none bg-brand/10 border border-brand/20 px-2.5 py-0.5 text-xs font-medium text-brand"
              >
                <span>Keyword: &quot;{currentQ}&quot;</span>
                <button
                  type="button"
                  onClick={() => updateParam("q", "")}
                  className="hover:text-ink focus:outline-none ml-0.5"
                  aria-label="Remove keyword search"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-ink underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* N5B-69: Category Chips with server-counted tallies */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-hairline/60">
          <button
            type="button"
            onClick={() => updateParam("businessType", "")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-none px-3 py-1 text-xs font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-95 border",
              !currentBusinessType
                ? "bg-brand text-white border-brand shadow-2xs font-semibold"
                : "bg-surface text-muted-foreground border-hairline hover:border-brand/40 hover:text-ink"
            )}
          >
            <span>All</span>
            <span
              className={cn(
                "rounded-none px-1.5 py-0.2 text-[10px]",
                !currentBusinessType ? "bg-white/20 text-white" : "bg-canvas text-muted-foreground"
              )}
            >
              {totalCount}
            </span>
          </button>

          {BUSINESS_TYPES.map((bt) => {
            const count = chipCounts[bt] || 0;
            const isSelected = currentBusinessType === bt;
            return (
              <button
                key={bt}
                type="button"
                onClick={() => toggleBusinessTypeChip(bt)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-none px-3 py-1 text-xs font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-95 border",
                  isSelected
                    ? "bg-brand text-white border-brand shadow-2xs font-semibold"
                    : "bg-surface text-muted-foreground border-hairline hover:border-brand/40 hover:text-ink"
                )}
              >
                <span>{enumLabel("businessType", bt)}</span>
                <span
                  className={cn(
                    "rounded-none px-1.5 py-0.2 text-[10px]",
                    isSelected ? "bg-white/20 text-white" : "bg-canvas text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
