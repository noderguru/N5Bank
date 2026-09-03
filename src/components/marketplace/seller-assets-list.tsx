"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/marketplace/empty-state";
import { formatPrice } from "@/lib/formatters";
import { useEnumLabel, useFormatLabels } from "@/lib/i18n-format";
import { removeAssetAction, toggleAssetStatusAction } from "@/app/actions/assets";

export type SellerAssetItem = {
  id: string;
  title: string;
  summary: string;
  country: string;
  licenseType: string;
  businessType: string;
  businessStatus: string;
  askingPrice: number | string | null;
  priceMode: "FIXED" | "ON_LOI" | "NDA";
  currency: string;
  status: "DRAFT" | "PUBLISHED" | "SUSPENDED" | "REMOVED";
  views: number;
  createdAt: string | Date;
  moderationReason?: string | null;
};

type SellerAssetsListProps = {
  assets: SellerAssetItem[];
};

export function SellerAssetsList({ assets }: SellerAssetsListProps) {
  const t = useTranslations("seller");
  const enumLabel = useEnumLabel();
  const { locale, price } = useFormatLabels();
  const router = useRouter();
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (assets.length === 0) {
    return (
      <EmptyState
        title={t("noListingsTitle")}
        description={t("noListingsDesc")}
        action={{
          label: "+ Publish First Asset",
          href: "/seller/assets/new",
        }}
      />
    );
  }

  const handleToggleStatus = (assetId: string) => {
    setActiveActionId(`toggle_${assetId}`);
    startTransition(async () => {
      try {
        const result = await toggleAssetStatusAction(assetId);
        if (!result.success) {
          toast.error(result.errors?._form?.[0] || result.message || "Failed to update status");
          return;
        }
        toast.success(result.message || "Listing status updated");
        router.refresh();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error updating status");
      } finally {
        setActiveActionId(null);
      }
    });
  };

  const handleDelete = (assetId: string) => {
    if (!confirm("Are you sure you want to remove this listing? It will no longer be visible.")) {
      return;
    }
    setActiveActionId(`delete_${assetId}`);
    startTransition(async () => {
      try {
        const result = await removeAssetAction(assetId);
        if (!result.success) {
          toast.error(result.errors?._form?.[0] || result.message || "Failed to delete listing");
          return;
        }
        toast.success("Listing removed");
        router.refresh();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error deleting listing");
      } finally {
        setActiveActionId(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      {assets.map((asset) => {
        const isTogglePending = isPending && activeActionId === `toggle_${asset.id}`;
        const isDeletePending = isPending && activeActionId === `delete_${asset.id}`;
        const isSuspended = asset.status === "SUSPENDED";
        const isPublished = asset.status === "PUBLISHED";
        const isDraft = asset.status === "DRAFT";

        return (
          <div
            key={asset.id}
            className={`rounded-[24px] border p-5 sm:p-6 transition-all ${
              isSuspended
                ? "border-amber-500/30 bg-amber-500/10"
                : "border-hairline bg-surface hover:border-brand/40"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Badge */}
                  {isPublished && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" />
                      Published
                    </span>
                  )}
                  {isDraft && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600 border border-neutral-200">
                      <Clock className="h-3 w-3" />
                      Draft
                    </span>
                  )}
                  {isSuspended && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-300">
                      <AlertTriangle className="h-3 w-3" />
                      Suspended by Moderation
                    </span>
                  )}

                  <Badge variant="outline" className="text-xs font-medium border-[#D9D9D9]">
                    {enumLabel("licenseType", asset.licenseType)}
                  </Badge>

                  <span className="text-xs text-neutral-400 font-medium">
                    {asset.country}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs text-neutral-500 ml-auto md:ml-2">
                    <Eye className="h-3.5 w-3.5 text-neutral-400" />
                    <span>{asset.views} views</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                  {asset.title}
                </h3>

                <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed">
                  {asset.summary}
                </p>

                {/* Moderation reason box if suspended */}
                {isSuspended && asset.moderationReason && (
                  <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-100/70 p-3 text-xs text-amber-900">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
                    <div>
                      <strong className="font-semibold">{t("moderationReason")} </strong>
                      <span>{asset.moderationReason}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Price and Actions */}
              <div className="flex flex-col md:items-end justify-between gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-[#D9D9D9]">
                <div className="text-left md:text-right">
                  <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider block">
                    Valuation
                  </span>
                  <span className="text-lg font-bold text-neutral-900 tracking-tight">
                    {formatPrice(asset.askingPrice, asset.priceMode, asset.currency, locale, price)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!isSuspended && (
                    <>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 rounded-xl border-[#D9D9D9] hover:bg-neutral-50 text-xs font-medium"
                      >
                        <Link href={`/seller/assets/${asset.id}/edit`}>
                          <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Link>
                      </Button>

                      <Button
                        type="button"
                        variant={isPublished ? "outline" : "default"}
                        size="sm"
                        disabled={isTogglePending || isDeletePending}
                        onClick={() => handleToggleStatus(asset.id)}
                        className={`h-9 px-3 rounded-xl text-xs font-medium ${
                          isPublished
                            ? "border-[#D9D9D9] hover:bg-neutral-50"
                            : "bg-[#383BFE] text-white hover:bg-[#2d30e0]"
                        }`}
                      >
                        {isTogglePending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                        {isPublished ? "Move to Draft" : "Publish"}
                      </Button>

                      {isPublished && (
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-9 px-2.5 rounded-xl text-xs text-[#383BFE] hover:text-[#2d30e0]"
                        >
                          <Link href={`/assets/${asset.id}`}>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      )}
                    </>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isDeletePending || isTogglePending}
                    onClick={() => handleDelete(asset.id)}
                    className="h-9 px-2.5 rounded-xl text-xs text-neutral-400 hover:text-rose-600 hover:bg-rose-50"
                    title={t("removeListing")}
                  >
                    {isDeletePending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
