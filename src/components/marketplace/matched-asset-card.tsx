import { Link } from "@/i18n/routing";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Globe2,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/marketplace/favorite-button";
import { getLocale, getTranslations } from "next-intl/server";
import { formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { MatchedAssetItem } from "@/lib/ai/matching";

export interface MatchedAssetCardProps {
  item: MatchedAssetItem;
  isFavorite?: boolean;
}

export async function MatchedAssetCard({ item, isFavorite }: MatchedAssetCardProps) {
  const locale = await getLocale();
  const tEnums = await getTranslations("enums");
  const tCommon = await getTranslations("common");
  const tMatching = await getTranslations("matching");
  const tMarketplace = await getTranslations("marketplace");
  const price = {
    onRequest: tCommon("priceOnRequest"),
    uponLoi: tCommon("uponLoi"),
    underNda: tCommon("underNda"),
  };
  const enumLabel = (group: string, value: string) => tEnums(`${group}.${value}`);
  const { asset, matchScore, matchReasons, aiExplanation, engine, breakdown } = item;
  const displayPrice = formatPrice(
    asset.askingPrice ? Number(asset.askingPrice) : null,
    asset.priceMode,
    asset.currency,
    locale,
    price
  );

  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
    if (score >= 60) return "bg-brand/10 text-brand border-brand/20";
    return "bg-amber-500/10 text-amber-700 border-amber-500/20";
  };

  return (
    <article
      data-testid="matched-asset-card"
      className="group relative flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-5 transition-[transform,box-shadow,border-color] duration-200 ease-out sm:hover:-translate-y-0.5 sm:hover:shadow-md sm:hover:border-brand/60 animate-in fade-in-50 duration-200"
    >
      <div className="space-y-4">
        {/* Match Header Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-hairline pb-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-tight",
                getScoreBadgeClass(matchScore)
              )}
            >
              {matchScore}% Match
            </span>

            {engine === "ai" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold text-purple-700 border border-purple-500/20">
                <Sparkles className="size-3" />
                <span>{tMatching("aiCurated")}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-500/20">
                <ShieldCheck className="size-3" />
                <span>{tMatching("algorithmicMatch")}</span>
              </span>
            )}
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-ink tracking-tight">{displayPrice}</div>
            {asset.priceMode !== "FIXED" && (
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                {asset.priceMode === "ON_LOI" ? "Subject to LOI" : "Confidential"}
              </div>
            )}
          </div>
        </div>

        {/* Title and Country */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe2 className="size-3.5 text-brand shrink-0" />
            <span className="font-medium text-ink">{asset.country}</span>
            <span>·</span>
            <span>{enumLabel("licenseType", asset.licenseType)}</span>
          </div>

          <h3 className="text-base font-semibold text-ink leading-snug tracking-tight group-hover:text-brand transition-colors">
            <Link href={`/assets/${asset.id}`} prefetch={false} className="focus:outline-none">
              {asset.title}
            </Link>
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {asset.summary}
          </p>
        </div>

        {/* AI / Algorithmic Match Explanation Callout */}
        <div className="rounded-xl border border-hairline bg-canvas/60 p-3 space-y-2">
          {aiExplanation ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-700">
                <Sparkles className="size-3.5 shrink-0" />
                <span>{tMatching("thesisAlignment")}</span>
              </div>
              <p className="text-xs text-ink/90 italic leading-relaxed">
                &ldquo;{aiExplanation}&rdquo;
              </p>
            </div>
          ) : (
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Match Criteria Breakdown
            </div>
          )}

          {/* Key match points */}
          {matchReasons.length > 0 && (
            <ul className="space-y-1 text-xs text-ink/80 pt-1">
              {matchReasons.slice(0, 3).map((reason, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Dimension scores pill strip */}
          <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-hairline/60 text-[10px] text-muted-foreground">
            <span className="rounded bg-surface px-1.5 py-0.5 border border-hairline">
              Charter: {breakdown.licenseScore}/35
            </span>
            <span className="rounded bg-surface px-1.5 py-0.5 border border-hairline">
              Country: {breakdown.jurisdictionScore}/30
            </span>
            <span className="rounded bg-surface px-1.5 py-0.5 border border-hairline">
              Model: {breakdown.businessTypeScore}/20
            </span>
            <span className="rounded bg-surface px-1.5 py-0.5 border border-hairline">
              Capital: {breakdown.ticketScore}/15
            </span>
          </div>
        </div>

        {/* Mini Spec strip */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground bg-surface rounded-lg p-2 border border-hairline">
          <div>
            <span className="font-semibold text-ink">{tMatching("modelLabel")} </span>
            {enumLabel("businessType", asset.businessType)}
          </div>
          <div>
            <span className="font-semibold text-ink">{tMatching("statusLabel")} </span>
            {enumLabel("businessStatus", asset.businessStatus)}
          </div>
        </div>
      </div>

      {/* Footer CTAs */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-hairline pt-3">
        <div className="flex items-center gap-1.5">
          <Button
            asChild
            variant="outline"
            className="h-8 gap-1 rounded-xl border-hairline text-xs font-medium hover:border-brand hover:text-brand"
          >
            <Link href={`/assets/${asset.id}`} prefetch={false}>
              <span>{tMatching("viewSpecs")}</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>

          <FavoriteButton
            assetId={asset.id}
            initialFavorite={isFavorite}
            size="icon"
            variant="ghost"
            showLabel={false}
            className="size-8 rounded-xl"
          />
        </div>

        <Button
          asChild
          className="h-8 gap-1.5 rounded-xl bg-brand text-xs font-medium text-surface hover:bg-brand/90 shadow-xs"
        >
          <Link href={`/assets/${asset.id}?contact=true`} prefetch={false}>
            <MessageSquare className="size-3.5" />
            <span>{tMarketplace("contactSeller")}</span>
          </Link>
        </Button>
      </div>
    </article>
  );
}
