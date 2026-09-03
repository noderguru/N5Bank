"use server";

import { parseSearchQuery, type ParsedSearchFilters } from "@/lib/ai/query-parser";

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
