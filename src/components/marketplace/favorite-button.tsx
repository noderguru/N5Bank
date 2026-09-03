"use client";

import { useState, useTransition } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleFavoriteAction } from "@/app/actions/assets";
import { cn } from "@/lib/utils";

export type FavoriteButtonProps = {
  assetId: string;
  initialFavorite?: boolean;
  variant?: "outline" | "default" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
  className?: string;
};

export function FavoriteButton({
  assetId,
  initialFavorite = false,
  variant = "outline",
  size = "default",
  showLabel = true,
  className,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextState = !isFavorite;
    // Optimistic update
    setIsFavorite(nextState);

    startTransition(async () => {
      try {
        const res = await toggleFavoriteAction(assetId);
        if (!res.success) {
          // Rollback on error
          setIsFavorite(!nextState);
          toast.error(res.error || "Failed to update saved status");
          return;
        }
        setIsFavorite(Boolean(res.isFavorite));
        toast.success(
          res.isFavorite
            ? "Asset saved to your favorites"
            : "Asset removed from saved list"
        );
      } catch (err: unknown) {
        setIsFavorite(!nextState);
        const msg = err instanceof Error ? err.message : "Error saving asset";
        toast.error(msg);
      }
    });
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isPending}
      data-testid="favorite-button"
      data-active={isFavorite}
      className={cn(
        "rounded-xl transition-all font-medium",
        isFavorite
          ? "border-brand bg-brand/10 text-brand hover:bg-brand/15"
          : "border-hairline text-ink hover:border-brand/40 hover:text-brand",
        className
      )}
      aria-label={isFavorite ? "Remove from saved assets" : "Save asset to favorites"}
    >
      {isPending ? (
        <Loader2 className={cn("size-4 animate-spin", showLabel && "mr-1.5")} />
      ) : (
        <Bookmark
          className={cn(
            "size-4 transition-colors",
            isFavorite ? "fill-brand text-brand" : "text-muted-foreground",
            showLabel && "mr-1.5"
          )}
        />
      )}
      {showLabel && (
        <span>{isFavorite ? "Saved to Favorites" : "Save to Favorites"}</span>
      )}
    </Button>
  );
}
