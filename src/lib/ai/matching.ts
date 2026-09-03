import { scoreAssetMatch, type MatchScoreResult } from "./scorer";
import { callOpenRouterStructured, isOpenRouterConfigured } from "./openrouter";
import type { Asset, BuyerProfile } from "@prisma/client";

export interface MatchedAssetItem {
  asset: Asset;
  matchScore: number;
  matchReasons: string[];
  breakdown: MatchScoreResult["breakdown"];
  aiExplanation?: string;
  engine: "ai" | "rule";
}

export interface BuyerMatchesResult {
  matches: MatchedAssetItem[];
  engine: "ai" | "rule";
  totalEvaluated: number;
}

interface AIMatchesResponse {
  matches: Array<{
    assetId: string;
    aiExplanation: string;
  }>;
}

/**
 * Matches published marketplace assets against a buyer's profile.
 * High-resilience design:
 * - Deterministic scoring is always computed first as the ground truth.
 * - If OpenRouter is available, enriches top assets with qualitative thesis alignment.
 * - Seamlessly falls back to pure deterministic explanations if AI fails or key is missing.
 */
export async function getMatchesForBuyer(
  buyer: BuyerProfile,
  assets: Asset[]
): Promise<BuyerMatchesResult> {
  if (assets.length === 0) {
    return {
      matches: [],
      engine: isOpenRouterConfigured() ? "ai" : "rule",
      totalEvaluated: 0,
    };
  }

  // 1. Compute deterministic score for every candidate asset
  const scoredItems: MatchedAssetItem[] = assets
    .map((asset) => {
      const scoring = scoreAssetMatch(
        {
          targetCountries: buyer.targetCountries,
          targetLicenseTypes: buyer.targetLicenseTypes,
          targetBusinessTypes: buyer.targetBusinessTypes,
          ticketMin: buyer.ticketMin ? Number(buyer.ticketMin) : null,
          ticketMax: buyer.ticketMax ? Number(buyer.ticketMax) : null,
          currency: buyer.currency,
          thesis: buyer.thesis,
        },
        {
          country: asset.country,
          licenseType: asset.licenseType,
          businessType: asset.businessType,
          askingPrice: asset.askingPrice ? Number(asset.askingPrice) : null,
          priceMode: asset.priceMode,
          currency: asset.currency,
          title: asset.title,
          summary: asset.summary,
        }
      );

      return {
        asset,
        matchScore: scoring.score,
        matchReasons: scoring.reasons,
        breakdown: scoring.breakdown,
        engine: "rule" as const,
      };
    })
    // Exclude assets with zero alignment and sort descending by score
    .filter((item) => item.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  let engine: "ai" | "rule" = "rule";

  // 2. If OpenRouter is configured, enrich the top 6 matches with thesis alignment explanations
  if (isOpenRouterConfigured() && scoredItems.length > 0) {
    const topCandidates = scoredItems.slice(0, 6);

    const promptPayload = {
      buyer: {
        company: buyer.company,
        country: buyer.country,
        investmentThesis: buyer.thesis || "General financial M&A expansion",
        targetCountries: buyer.targetCountries,
        targetLicenses: buyer.targetLicenseTypes,
        budget: `${buyer.currency} ${buyer.ticketMin || 0} - ${buyer.ticketMax || "unlimited"}`,
      },
      candidateAssets: topCandidates.map((c) => ({
        id: c.asset.id,
        title: c.asset.title,
        country: c.asset.country,
        licenseType: c.asset.licenseType,
        businessType: c.asset.businessType,
        askingPrice: c.asset.askingPrice ? Number(c.asset.askingPrice) : null,
        priceMode: c.asset.priceMode,
        summary: c.asset.summary,
      })),
    };

    const aiResult = await callOpenRouterStructured<AIMatchesResponse>({
      systemPrompt:
        "You are a senior M&A analyst for N5Deal. Write a crisp, 1-2 sentence institutional rationale explaining why each asset matches the buyer's mandate and investment thesis.",
      prompt: `Analyze the buyer's mandate and candidate assets:\n${JSON.stringify(
        promptPayload,
        null,
        2
      )}`,
      schemaDescription: `{ "matches": [{ "assetId": "string", "aiExplanation": "string" }] }`,
      validate: (parsed: unknown) => {
        const p = parsed as AIMatchesResponse | null;
        if (p && Array.isArray(p.matches)) {
          return p;
        }
        return null;
      },
      timeoutMs: 7000,
    });

    if (aiResult?.matches && aiResult.matches.length > 0) {
      const explanationMap = new Map<string, string>();
      for (const m of aiResult.matches) {
        if (m.assetId && m.aiExplanation) {
          explanationMap.set(m.assetId, m.aiExplanation);
        }
      }

      for (const item of topCandidates) {
        const explanation = explanationMap.get(item.asset.id);
        if (explanation) {
          item.aiExplanation = explanation;
          item.engine = "ai";
        }
      }
      engine = "ai";
    }
  }

  return {
    matches: scoredItems,
    engine,
    totalEvaluated: assets.length,
  };
}
