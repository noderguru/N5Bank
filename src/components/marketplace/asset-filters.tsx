"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BUSINESS_TYPES = [
  { value: "BANK", label: "Bank" },
  { value: "FINTECH", label: "Fintech" },
  { value: "PAYMENT_INSTITUTION", label: "Payment" },
  { value: "CRYPTO_BUSINESS", label: "Crypto" },
  { value: "BROKERAGE", label: "Brokerage" },
  { value: "INSURANCE_COMPANY", label: "Insurance" },
  { value: "OTHER", label: "Other" },
];

const LICENSE_TYPES = [
  { value: "BANKING", label: "Banking License" },
  { value: "E_MONEY", label: "E-Money / EMI" },
  { value: "PAYMENT", label: "Payment (PI)" },
  { value: "CRYPTO", label: "Crypto / VASP" },
  { value: "BROKERAGE", label: "Brokerage" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "OTHER", label: "Other" },
];

const BUSINESS_STATUSES = [
  { value: "OPERATING", label: "Operating" },
  { value: "PRE_LAUNCH", label: "Pre-Launch" },
  { value: "DORMANT", label: "Dormant" },
  { value: "DISTRESSED", label: "Distressed" },
];

const PRICE_RANGES = [
  { value: "under_1m", label: "Under $1M" },
  { value: "1m_5m", label: "$1M – $5M" },
  { value: "5m_20m", label: "$5M – $20M" },
  { value: "over_20m", label: "$20M+" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

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
      {/* Search and Secondary Filter Row */}
      <div className="rounded-2xl border border-hairline bg-surface p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={currentQ}
              onChange={(e) => updateParam("q", e.target.value)}
              placeholder="Search assets by title, description, or jurisdiction..."
              className="pl-9 h-10 rounded-xl border-hairline bg-canvas/30 text-sm focus-visible:ring-brand"
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
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            {/* Country Select */}
            <select
              value={currentCountry}
              onChange={(e) => updateParam("country", e.target.value)}
              className="h-10 rounded-xl border border-hairline bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-canvas/50 focus:outline-none focus:ring-1 focus:ring-brand"
              aria-label="Filter by country"
            >
              <option value="">All Countries</option>
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
              className="h-10 rounded-xl border border-hairline bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-canvas/50 focus:outline-none focus:ring-1 focus:ring-brand"
              aria-label="Filter by license type"
            >
              <option value="">All Licenses</option>
              {LICENSE_TYPES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>

            {/* Business Status Select */}
            <select
              value={currentBusinessStatus}
              onChange={(e) => updateParam("businessStatus", e.target.value)}
              className="h-10 rounded-xl border border-hairline bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-canvas/50 focus:outline-none focus:ring-1 focus:ring-brand"
              aria-label="Filter by operational status"
            >
              <option value="">All Statuses</option>
              {BUSINESS_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Price Range Select */}
            <select
              value={currentPrice}
              onChange={(e) => updateParam("price", e.target.value)}
              className="h-10 rounded-xl border border-hairline bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-canvas/50 focus:outline-none focus:ring-1 focus:ring-brand"
              aria-label="Filter by asking price"
            >
              <option value="">Any Price</option>
              {PRICE_RANGES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            {/* Sort Select */}
            <select
              value={currentSort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="h-10 rounded-xl border border-hairline bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-canvas/50 focus:outline-none focus:ring-1 focus:ring-brand"
              aria-label="Sort listings"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Reset Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-10 gap-1 rounded-xl text-xs text-muted-foreground hover:text-ink px-2.5"
                title="Reset all filters"
              >
                <RotateCcw className="size-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}
          </div>
        </div>

        {/* N5B-69: Category Chips with server-counted tallies */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-hairline/60">
          <button
            type="button"
            onClick={() => updateParam("businessType", "")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors border",
              !currentBusinessType
                ? "bg-brand text-white border-brand shadow-2xs font-semibold"
                : "bg-surface text-muted-foreground border-hairline hover:border-brand/40 hover:text-ink"
            )}
          >
            <span>All</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px]",
                !currentBusinessType ? "bg-white/20 text-white" : "bg-canvas text-muted-foreground"
              )}
            >
              {totalCount}
            </span>
          </button>

          {BUSINESS_TYPES.map((bt) => {
            const count = chipCounts[bt.value] || 0;
            const isSelected = currentBusinessType === bt.value;
            return (
              <button
                key={bt.value}
                type="button"
                onClick={() => toggleBusinessTypeChip(bt.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors border",
                  isSelected
                    ? "bg-brand text-white border-brand shadow-2xs font-semibold"
                    : "bg-surface text-muted-foreground border-hairline hover:border-brand/40 hover:text-ink"
                )}
              >
                <span>{bt.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px]",
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
