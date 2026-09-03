"use client";

import { useEffect } from "react";
import { recordAssetViewAction } from "@/app/actions/assets";

export function ViewTracker({ assetId }: { assetId: string }) {
  useEffect(() => {
    try {
      const key = `n5deal_viewed_${assetId}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        recordAssetViewAction(assetId);
      }
    } catch {
      // Graceful fallback if storage is restricted
    }
  }, [assetId]);

  return null;
}
