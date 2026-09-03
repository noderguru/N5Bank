"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  X,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Building2,
  Globe,
  MoreHorizontal,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NoResultsState } from "@/components/marketplace/no-results-state";
import { ModerationDialog } from "@/components/admin/moderation-dialog";
import { formatPrice, formatDate } from "@/lib/formatters";
import { useEnumLabel, useFormatLabels } from "@/lib/i18n-format";
import { cn } from "@/lib/utils";
import type { PriceMode, AssetStatus, LicenseType, BusinessType } from "@prisma/client";

export type AdminAssetRow = {
  id: string;
  title: string;
  summary: string;
  country: string;
  licenseType: LicenseType;
  businessType: BusinessType;
  businessStatus: string;
  askingPrice: number | null;
  priceMode: PriceMode;
  currency: string;
  status: AssetStatus;
  validated: boolean;
  views: number;
  sellerId: string;
  sellerName: string;
  sellerCompany: string | null;
  sellerStatus: "ACTIVE" | "SUSPENDED" | "REMOVED";
  createdAt: string;
};

export type SellerOption = {
  id: string;
  name: string;
  company: string | null;
};

type AssetsTableProps = {
  assets: AdminAssetRow[];
  totalCount: number;
  sellers: SellerOption[];
};

const STATUSES = [
  { value: "ALL", label: "All Statuses" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "REMOVED", label: "Removed" },
];

const SORTS = [
  { value: "newest", label: "Listed: Newest" },
  { value: "oldest", label: "Listed: Oldest" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "views", label: "Most Viewed" },
];

export function AssetsTable({ assets, totalCount, sellers }: AssetsTableProps) {
  const enumLabel = useEnumLabel();
  const { locale, price } = useFormatLabels();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    targetId: string;
    targetTitle: string;
    action: "SUSPEND" | "RESTORE" | "REMOVE" | "VALIDATE";
  }>({
    open: false,
    targetId: "",
    targetTitle: "",
    action: "SUSPEND",
  });

  const currentQ = searchParams.get("q") || "";
  const currentStatus = searchParams.get("status") || "ALL";
  const currentSellerId = searchParams.get("sellerId") || "ALL";
  const currentSort = searchParams.get("sort") || "newest";

  const hasActiveFilters = Boolean(
    currentQ ||
      (currentStatus && currentStatus !== "ALL") ||
      (currentSellerId && currentSellerId !== "ALL") ||
      (currentSort && currentSort !== "newest")
  );

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL" && !(key === "sort" && value === "newest")) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`/admin/assets?${params.toString()}`);
    });
  };

  const handleReset = () => {
    startTransition(() => {
      router.push("/admin/assets");
    });
  };

  const openModeration = (
    id: string,
    title: string,
    action: "SUSPEND" | "RESTORE" | "REMOVE" | "VALIDATE"
  ) => {
    setDialogState({
      open: true,
      targetId: id,
      targetTitle: title,
      action,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between rounded-2xl border border-hairline bg-surface p-4 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={currentQ}
            onChange={(e) => updateParam("q", e.target.value)}
            placeholder="Search title, summary, country..."
            className="pl-9 pr-8 h-9 text-sm rounded-xl border-hairline bg-canvas"
          />
          {currentQ && (
            <button
              onClick={() => updateParam("q", "")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Select */}
          <select
            value={currentStatus}
            onChange={(e) => updateParam("status", e.target.value)}
            className="h-9 rounded-xl border border-hairline bg-canvas px-3 text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-brand"
            aria-label="Filter by status"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Seller Select - N5B-78: Filter by seller */}
          <select
            value={currentSellerId}
            onChange={(e) => updateParam("sellerId", e.target.value)}
            className="h-9 max-w-[200px] rounded-xl border border-hairline bg-canvas px-3 text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-brand truncate"
            aria-label="Filter by seller"
          >
            <option value="ALL">All Sellers</option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.company ? `${s.company} (${s.name})` : s.name}
              </option>
            ))}
          </select>

          {/* Sort Select */}
          <select
            value={currentSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="h-9 rounded-xl border border-hairline bg-canvas px-3 text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-brand"
            aria-label="Sort listings"
          >
            {SORTS.map((s) => (
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
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-ink gap-1 rounded-xl"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing <strong className="font-semibold text-ink">{assets.length}</strong> of {totalCount} listings
        </span>
      </div>

      {/* Table Container - N5B-39: Responsive, doesn't break at 1024px */}
      {assets.length > 0 ? (
        <div className="rounded-2xl border border-hairline bg-surface shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[880px]">
              <TableHeader>
                <TableRow className="bg-canvas/50 hover:bg-canvas/50 border-hairline">
                  <TableHead className="w-[260px] text-xs font-semibold uppercase text-muted-foreground tracking-wider py-3">
                    Asset Title & Details
                  </TableHead>
                  <TableHead className="min-w-[160px] text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Seller
                  </TableHead>
                  <TableHead className="w-[110px] text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="w-[130px] text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Asking Price
                  </TableHead>
                  <TableHead className="min-w-[150px] text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Charter & Type
                  </TableHead>
                  <TableHead className="w-[80px] text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Views
                  </TableHead>
                  <TableHead className="w-[100px] text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Listed
                  </TableHead>
                  <TableHead className="w-[160px] text-right text-xs font-semibold uppercase text-muted-foreground tracking-wider pr-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => {
                  const isSuspended = asset.status === "SUSPENDED";
                  const isRemoved = asset.status === "REMOVED";
                  const isSellerSuspended =
                    asset.sellerStatus === "SUSPENDED" || asset.sellerStatus === "REMOVED";

                  return (
                    <TableRow
                      key={asset.id}
                      className={cn(
                        "border-hairline transition-colors hover:bg-canvas/60",
                        isSuspended && "bg-amber-50/30",
                        isRemoved && "bg-rose-50/30 opacity-75"
                      )}
                    >
                      {/* Asset Title */}
                      <TableCell className="py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-medium text-ink text-sm">
                            <span className="line-clamp-1">{asset.title}</span>
                            {asset.validated && (
                              <ShieldCheck className="h-3.5 w-3.5 text-brand shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {asset.country}
                            </span>
                            <span>•</span>
                            <span className="truncate max-w-[200px]">{asset.summary}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Seller */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-xs font-medium text-ink truncate">
                            <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="truncate">
                              {asset.sellerCompany || asset.sellerName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <span>{asset.sellerName}</span>
                            {isSellerSuspended && (
                              <span className="inline-flex items-center gap-0.5 text-amber-700 font-semibold">
                                <ShieldAlert className="h-2.5 w-2.5" />
                                (Seller Suspended)
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {asset.status === "PUBLISHED" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Published
                          </span>
                        ) : asset.status === "DRAFT" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                            Draft
                          </span>
                        ) : isSuspended ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                            <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700">
                            <X className="h-3.5 w-3.5 text-rose-600" />
                            Removed
                          </span>
                        )}
                      </TableCell>

                      {/* Asking Price */}
                      <TableCell className="text-xs font-semibold text-ink">
                        {formatPrice(asset.askingPrice, asset.priceMode, asset.currency, locale, price)}
                      </TableCell>

                      {/* Charter & Type */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <span className="inline-block rounded-md bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-800">
                            {enumLabel("licenseType", asset.licenseType)}
                          </span>
                          <div className="text-[11px] text-muted-foreground">
                            {enumLabel("businessType", asset.businessType)}
                          </div>
                        </div>
                      </TableCell>

                      {/* Views */}
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          <span>{asset.views}</span>
                        </div>
                      </TableCell>

                      {/* Listed Date */}
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(asset.createdAt, locale)}
                      </TableCell>

                      {/* Actions Column: View Link + Moderation Controls */}
                      <TableCell className="text-right pr-4">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <Link
                            href={`/assets/${asset.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-hairline px-2 py-1 text-xs font-medium text-brand hover:bg-canvas transition-colors"
                          >
                            <span>View</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>

                          {/* Quick Moderation Button */}
                          {asset.status === "SUSPENDED" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                openModeration(asset.id, asset.title, "RESTORE")
                              }
                              className="h-7 px-2 text-xs font-medium border-emerald-200 text-emerald-800 hover:bg-emerald-50 rounded-lg"
                            >
                              Reinstate
                            </Button>
                          ) : asset.status !== "REMOVED" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                openModeration(asset.id, asset.title, "SUSPEND")
                              }
                              className="h-7 px-2 text-xs font-medium border-amber-200 text-amber-800 hover:bg-amber-50 rounded-lg"
                            >
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                openModeration(asset.id, asset.title, "RESTORE")
                              }
                              className="h-7 px-2 text-xs font-medium border-neutral-200 text-neutral-800 hover:bg-canvas rounded-lg"
                            >
                              Restore
                            </Button>
                          )}

                          {/* More Options Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-ink"
                                aria-label="More options"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              {!asset.validated && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    openModeration(asset.id, asset.title, "VALIDATE")
                                  }
                                  className="flex items-center gap-2 cursor-pointer text-emerald-700"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Verify Charter</span>
                                </DropdownMenuItem>
                              )}

                              {asset.status !== "REMOVED" && (
                                <>
                                  {!asset.validated && <DropdownMenuSeparator />}
                                  <DropdownMenuItem
                                    onClick={() =>
                                      openModeration(asset.id, asset.title, "REMOVE")
                                    }
                                    className="flex items-center gap-2 text-rose-700 cursor-pointer focus:text-rose-700 focus:bg-rose-50"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Remove Listing</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <NoResultsState
          title="No assets found"
          description="No listings matched your active search query, seller filter, or status filter. Reset parameters to view all marketplace listings."
          query={currentQ}
          resetHref="/admin/assets"
          resetLabel="Clear all filters"
        />
      )}

      {/* Moderation Confirmation Dialog - N5B-88 */}
      <ModerationDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((prev) => ({ ...prev, open }))}
        targetType="ASSET"
        targetId={dialogState.targetId}
        targetTitle={dialogState.targetTitle}
        action={dialogState.action}
      />
    </div>
  );
}
