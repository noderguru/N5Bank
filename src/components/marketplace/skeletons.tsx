import { Skeleton } from "../ui/skeleton";

export function AssetCardSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-5 space-y-4 shadow-xs">
      {/* Header tags & Price */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-24 rounded-lg" />
      </div>

      {/* Title and summary */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-4/5 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
      </div>

      {/* Spec Grid */}
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-hairline bg-canvas/50 p-2.5 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-12 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
        ))}
      </div>

      {/* Features chips */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>

      {/* Action CTA */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-hairline">
        <Skeleton className="h-4 w-20 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function BuyerCardSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-5 space-y-4 shadow-xs">
      {/* Header: Name, Company, Country */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>

      {/* Thesis */}
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-14 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
      </div>

      {/* Target parameters */}
      <div className="space-y-2 rounded-xl border border-hairline bg-canvas/50 p-3">
        <div className="space-y-1">
          <Skeleton className="h-3 w-24 rounded" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-18 rounded-full" />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-end pt-2 border-t border-hairline">
        <Skeleton className="h-8 w-28 rounded-xl" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({
  count = 6,
  type = "asset",
}: {
  count?: number;
  type?: "asset" | "buyer";
}) {
  const Component = type === "asset" ? AssetCardSkeleton : BuyerCardSkeleton;

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}
