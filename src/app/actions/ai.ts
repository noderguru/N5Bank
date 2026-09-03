"use server";

import { parseSearchQuery, type ParsedSearchFilters } from "@/lib/ai/query-parser";
import {
  generateAssetSummary,
  type AssetSummaryInput,
} from "@/lib/ai/summary";
import { isOpenRouterConfigured } from "@/lib/ai/openrouter";

export async function parseSearchQueryAction(
  query: string
): Promise<ParsedSearchFilters> {
  if (!query || typeof query !== "string") {
    return {
      confidence: "none",
      explanation: "Empty search query",
      engine: "rule",
    };
  }

  return parseSearchQuery(query);
}

export async function generateAssetSummaryAction(
  data: AssetSummaryInput
): Promise<{ summary: string; engine: "ai" | "rule" }> {
  return generateAssetSummary(data);
}

export async function isOpenRouterConfiguredAction(): Promise<boolean> {
  return isOpenRouterConfigured();
}
