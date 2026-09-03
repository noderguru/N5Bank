/**
 * Deterministic Buyer ↔ Asset Matching Scorer
 *
 * Product Rationale:
 * In regulated financial and M&A marketplaces, charter/license type is the primary
 * regulatory filter, followed by geographic jurisdiction, business model, and capital envelope.
 *
 * Scoring weights (Total: 100):
 * - LICENSE_TYPE: 35 pts (Regulatory capability / charter compatibility)
 * - JURISDICTION: 30 pts (Geographic regulatory perimeter)
 * - BUSINESS_TYPE: 20 pts (Operational and business model alignment)
 * - TICKET_ENVELOPE: 15 pts (Financial feasibility and budget fit)
 */

export const MATCH_WEIGHTS = {
  /** Regulatory charter compatibility (e.g. Banking, E-Money, Payment, Brokerage) */
  LICENSE_TYPE: 35,
  /** Country / jurisdiction match */
  JURISDICTION: 30,
  /** Business model alignment (e.g. Bank, Fintech, Crypto Business) */
  BUSINESS_TYPE: 20,
  /** Price fit within the buyer's minimum/maximum investment envelope */
  TICKET_ENVELOPE: 15,
} as const;

export interface BuyerMandateCriteria {
  targetCountries: string[];
  targetLicenseTypes: string[];
  targetBusinessTypes: string[];
  ticketMin?: number | null;
  ticketMax?: number | null;
  currency?: string;
  thesis?: string | null;
}

export interface AssetMatchingAttributes {
  country: string;
  licenseType: string;
  businessType: string;
  askingPrice?: number | null;
  priceMode?: string;
  currency?: string;
  title?: string;
  summary?: string;
}

export interface MatchScoreBreakdown {
  licenseScore: number;
  jurisdictionScore: number;
  businessTypeScore: number;
  ticketScore: number;
}

export interface MatchScoreResult {
  score: number; // 0 to 100
  reasons: string[];
  breakdown: MatchScoreBreakdown;
}

function formatCurrencyAmount(amount: number, currency: string = "USD"): string {
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${currency} ${formatted}`;
}

function humanizeEnumValue(val: string): string {
  return val
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Computes deterministic match score (0..100) and human-readable explanation reasons.
 * Pure function: No side effects, no network, no database calls.
 */
export function scoreAssetMatch(
  buyer: BuyerMandateCriteria,
  asset: AssetMatchingAttributes
): MatchScoreResult {
  const reasons: string[] = [];
  let licenseScore = 0;
  let jurisdictionScore = 0;
  let businessTypeScore = 0;
  let ticketScore = 0;

  // 1. License Type Match (35 pts)
  const normalizedTargetLicenses = (buyer.targetLicenseTypes || []).map((l) =>
    l.toUpperCase()
  );
  const assetLicense = (asset.licenseType || "").toUpperCase();

  if (normalizedTargetLicenses.length > 0) {
    if (normalizedTargetLicenses.includes(assetLicense)) {
      licenseScore = MATCH_WEIGHTS.LICENSE_TYPE;
      reasons.push(
        `Matches required license charter (${humanizeEnumValue(asset.licenseType)})`
      );
    }
  } else {
    // If buyer has not restricted licenses, grant neutral baseline (50% of weight)
    licenseScore = Math.round(MATCH_WEIGHTS.LICENSE_TYPE / 2);
  }

  // 2. Jurisdiction / Country Match (30 pts)
  const normalizedTargetCountries = (buyer.targetCountries || []).map((c) =>
    c.trim().toLowerCase()
  );
  const assetCountry = (asset.country || "").trim().toLowerCase();

  if (normalizedTargetCountries.length > 0) {
    if (normalizedTargetCountries.includes(assetCountry)) {
      jurisdictionScore = MATCH_WEIGHTS.JURISDICTION;
      reasons.push(`Located in target jurisdiction (${asset.country.trim()})`);
    }
  } else {
    // If buyer has not restricted countries, grant neutral baseline
    jurisdictionScore = Math.round(MATCH_WEIGHTS.JURISDICTION / 2);
  }

  // 3. Business Type Match (20 pts)
  const normalizedTargetBusinessTypes = (buyer.targetBusinessTypes || []).map((b) =>
    b.toUpperCase()
  );
  const assetBusinessType = (asset.businessType || "").toUpperCase();

  if (normalizedTargetBusinessTypes.length > 0) {
    if (normalizedTargetBusinessTypes.includes(assetBusinessType)) {
      businessTypeScore = MATCH_WEIGHTS.BUSINESS_TYPE;
      reasons.push(
        `Fits target business model (${humanizeEnumValue(asset.businessType)})`
      );
    }
  } else {
    // If buyer has not restricted business types, grant neutral baseline
    businessTypeScore = Math.round(MATCH_WEIGHTS.BUSINESS_TYPE / 2);
  }

  // 4. Ticket Range Match (15 pts)
  const minBudget = buyer.ticketMin != null ? Number(buyer.ticketMin) : null;
  const maxBudget = buyer.ticketMax != null ? Number(buyer.ticketMax) : null;
  const askingPrice = asset.askingPrice != null ? Number(asset.askingPrice) : null;
  const priceMode = (asset.priceMode || "FIXED").toUpperCase();
  const currency = asset.currency || buyer.currency || "USD";

  if (priceMode === "ON_LOI" || priceMode === "NDA") {
    // Negotiable institutional terms
    ticketScore = 12;
    reasons.push(
      priceMode === "NDA"
        ? "Confidential pricing subject to NDA review"
        : "Flexible deal pricing subject to Letter of Intent (LOI)"
    );
  } else if (askingPrice != null && askingPrice > 0) {
    if (minBudget != null && maxBudget != null) {
      if (askingPrice >= minBudget && askingPrice <= maxBudget) {
        ticketScore = MATCH_WEIGHTS.TICKET_ENVELOPE;
        reasons.push(
          `Asking price (${formatCurrencyAmount(askingPrice, currency)}) fits your budget (${formatCurrencyAmount(minBudget, currency)} – ${formatCurrencyAmount(maxBudget, currency)})`
        );
      } else if (askingPrice < minBudget) {
        // Below minimum budget (attractive valuation or lower tier)
        const diffRatio = (minBudget - askingPrice) / minBudget;
        if (diffRatio <= 0.3) {
          ticketScore = 10;
          reasons.push(
            `Valuation (${formatCurrencyAmount(askingPrice, currency)}) is near minimum ticket threshold`
          );
        } else {
          ticketScore = 6;
        }
      } else {
        // Above maximum budget
        const overRatio = (askingPrice - maxBudget) / maxBudget;
        if (overRatio <= 0.2) {
          // Within 20% premium
          ticketScore = 8;
          reasons.push(
            `Valuation (${formatCurrencyAmount(askingPrice, currency)}) is within 20% negotiable range of budget ceiling`
          );
        } else {
          ticketScore = 0;
        }
      }
    } else if (maxBudget != null) {
      if (askingPrice <= maxBudget) {
        ticketScore = MATCH_WEIGHTS.TICKET_ENVELOPE;
        reasons.push(
          `Asking price (${formatCurrencyAmount(askingPrice, currency)}) is under budget ceiling (${formatCurrencyAmount(maxBudget, currency)})`
        );
      } else if (askingPrice <= maxBudget * 1.2) {
        ticketScore = 8;
        reasons.push(
          `Valuation is within 20% range of target maximum budget`
        );
      } else {
        ticketScore = 0;
      }
    } else if (minBudget != null) {
      if (askingPrice >= minBudget) {
        ticketScore = MATCH_WEIGHTS.TICKET_ENVELOPE;
        reasons.push(
          `Asking price satisfies minimum investment threshold`
        );
      } else {
        ticketScore = 5;
      }
    } else {
      // Unconstrained budget
      ticketScore = MATCH_WEIGHTS.TICKET_ENVELOPE;
      reasons.push(
        `Listing price disclosed (${formatCurrencyAmount(askingPrice, currency)})`
      );
    }
  } else {
    // Unpriced or open pricing
    ticketScore = 10;
    reasons.push("Flexible transaction pricing structure");
  }

  const totalScore = Math.min(
    100,
    Math.max(0, licenseScore + jurisdictionScore + businessTypeScore + ticketScore)
  );

  return {
    score: totalScore,
    reasons,
    breakdown: {
      licenseScore,
      jurisdictionScore,
      businessTypeScore,
      ticketScore,
    },
  };
}
