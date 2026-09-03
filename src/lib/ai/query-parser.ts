import { callOpenRouterStructured, isOpenRouterConfigured } from "./openrouter";

export type LicenseTypeFilter =
  | "BANKING"
  | "E_MONEY"
  | "PAYMENT"
  | "CRYPTO"
  | "BROKERAGE"
  | "INSURANCE"
  | "OTHER";

export type BusinessTypeFilter =
  | "BANK"
  | "FINTECH"
  | "PAYMENT_INSTITUTION"
  | "CRYPTO_BUSINESS"
  | "BROKERAGE"
  | "INSURANCE_COMPANY"
  | "OTHER";

export type BusinessStatusFilter =
  | "OPERATING"
  | "PRE_LAUNCH"
  | "DORMANT"
  | "DISTRESSED";

export type PriceFilter = "under_1m" | "1m_5m" | "5m_20m" | "over_20m";

export interface ParsedSearchFilters {
  q?: string;
  country?: string;
  licenseType?: LicenseTypeFilter;
  businessType?: BusinessTypeFilter;
  businessStatus?: BusinessStatusFilter;
  price?: PriceFilter;
  confidence: "high" | "medium" | "low" | "none";
  explanation: string;
  engine: "ai" | "rule";
}

const COUNTRY_DICTIONARY: Record<string, string> = {
  brazil: "Brazil",
  brasil: "Brazil",
  uk: "United Kingdom",
  "united kingdom": "United Kingdom",
  britain: "United Kingdom",
  england: "United Kingdom",
  lithuania: "Lithuania",
  lietuva: "Lithuania",
  germany: "Germany",
  deutschland: "Germany",
  cyprus: "Cyprus",
  switzerland: "Switzerland",
  swiss: "Switzerland",
  singapore: "Singapore",
  uae: "United Arab Emirates",
  emirates: "United Arab Emirates",
  dubai: "United Arab Emirates",
  spain: "Spain",
  espana: "Spain",
  usa: "United States",
  "united states": "United States",
  america: "United States",
  estonia: "Estonia",
  malta: "Malta",
};

const LICENSE_PATTERNS: Array<{ regex: RegExp; value: LicenseTypeFilter }> = [
  { regex: /\b(e[- ]?money|emi|electronic money)\b/i, value: "E_MONEY" },
  { regex: /\b(bank(?:ing)?|credit institution)\b/i, value: "BANKING" },
  { regex: /\b(payment(?: institution)?|pi|psp|remittance)\b/i, value: "PAYMENT" },
  { regex: /\b(crypto|vasp|casp|digital asset|bitcoin|web3)\b/i, value: "CRYPTO" },
  { regex: /\b(broker(?:age)?|investment firm|cif|dealer)\b/i, value: "BROKERAGE" },
  { regex: /\b(insurance|underwriting|reinsurance)\b/i, value: "INSURANCE" },
];

const BUSINESS_TYPE_PATTERNS: Array<{ regex: RegExp; value: BusinessTypeFilter }> = [
  { regex: /\b(payment institution|payment company)\b/i, value: "PAYMENT_INSTITUTION" },
  { regex: /\b(crypto business|crypto company|crypto exchange)\b/i, value: "CRYPTO_BUSINESS" },
  { regex: /\b(fintech)\b/i, value: "FINTECH" },
  { regex: /\b(brokerage firm|brokerage)\b/i, value: "BROKERAGE" },
  { regex: /\b(insurance company)\b/i, value: "INSURANCE_COMPANY" },
  { regex: /\b(bank)\b/i, value: "BANK" },
];

const STATUS_PATTERNS: Array<{ regex: RegExp; value: BusinessStatusFilter }> = [
  { regex: /\b(operating|operational|active)\b/i, value: "OPERATING" },
  { regex: /\b(pre[- ]?launch|ready to launch)\b/i, value: "PRE_LAUNCH" },
  { regex: /\b(dormant|clean shell|inactive)\b/i, value: "DORMANT" },
  { regex: /\b(distressed|turnaround)\b/i, value: "DISTRESSED" },
];

const PRICE_PATTERNS: Array<{ regex: RegExp; value: PriceFilter }> = [
  { regex: /\b(under|sub|below|<)\s*(?:[\$€£]?)\s*1\s*m(?:illion)?\b/i, value: "under_1m" },
  { regex: /\b(?:between\s*)?(?:[\$€£]?)\s*1\s*m\s*(?:to|-|and)\s*(?:[\$€£]?)\s*5\s*m\b/i, value: "1m_5m" },
  { regex: /\b(under|sub|below|<)\s*(?:[\$€£]?)\s*5\s*m(?:illion)?\b/i, value: "1m_5m" },
  { regex: /\b(?:between\s*)?(?:[\$€£]?)\s*5\s*m\s*(?:to|-|and)\s*(?:[\$€£]?)\s*20\s*m\b/i, value: "5m_20m" },
  { regex: /\b(under|sub|below|<)\s*(?:[\$€£]?)\s*20\s*m(?:illion)?\b/i, value: "5m_20m" },
  { regex: /\b(over|above|>)\s*(?:[\$€£]?)\s*20\s*m(?:illion)?\b/i, value: "over_20m" },
];

function isLikelyGibberish(text: string): boolean {
  const normalized = text.toLowerCase();
  const keyboardMashes = ["asdf", "hjkl", "qwer", "zxcv", "tyui", "12345"];
  if (keyboardMashes.some((m) => normalized.includes(m))) {
    return true;
  }
  const words = normalized.split(/\s+/).filter(Boolean);
  for (const w of words) {
    if (w.length >= 4 && !/[aeiouy]/i.test(w)) {
      return true;
    }
  }
  return false;
}

/**
 * Deterministic rule-based query parser (Fallback without LLM).
 * Extracts known countries, licence types, price ranges, and business models from keywords.
 */
export function parseSearchQueryDeterministic(query: string): ParsedSearchFilters {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      confidence: "none",
      explanation: "Empty search query",
      engine: "rule",
    };
  }

  if (isLikelyGibberish(trimmed)) {
    return {
      confidence: "none",
      explanation: "Could not interpret search terms into catalog filters.",
      engine: "rule",
    };
  }

  let recognizedCountry: string | undefined;
  for (const [key, name] of Object.entries(COUNTRY_DICTIONARY)) {
    const regex = new RegExp(`\\b${key}\\b`, "i");
    if (regex.test(trimmed)) {
      recognizedCountry = name;
      break;
    }
  }

  let recognizedLicense: LicenseTypeFilter | undefined;
  for (const pattern of LICENSE_PATTERNS) {
    if (pattern.regex.test(trimmed)) {
      recognizedLicense = pattern.value;
      break;
    }
  }

  let recognizedBusinessType: BusinessTypeFilter | undefined;
  for (const pattern of BUSINESS_TYPE_PATTERNS) {
    if (pattern.regex.test(trimmed)) {
      recognizedBusinessType = pattern.value;
      break;
    }
  }

  let recognizedStatus: BusinessStatusFilter | undefined;
  for (const pattern of STATUS_PATTERNS) {
    if (pattern.regex.test(trimmed)) {
      recognizedStatus = pattern.value;
      break;
    }
  }

  let recognizedPrice: PriceFilter | undefined;
  for (const pattern of PRICE_PATTERNS) {
    if (pattern.regex.test(trimmed)) {
      recognizedPrice = pattern.value;
      break;
    }
  }

  const matchCount = [
    recognizedCountry,
    recognizedLicense,
    recognizedBusinessType,
    recognizedStatus,
    recognizedPrice,
  ].filter(Boolean).length;

  if (matchCount === 0) {
    // Check if query is plausible text keywords vs complete nonsense (e.g. repeated gibberish or symbols)
    const isGibberish =
      /^[a-z]{1,4}$/i.test(trimmed) ||
      /^[^a-zA-Z0-9\s]+$/.test(trimmed) ||
      !/[a-zA-Z]{3,}/.test(trimmed);

    if (isGibberish) {
      return {
        confidence: "none",
        explanation: "Could not interpret search terms into catalog filters.",
        engine: "rule",
      };
    }

    // Treat as free-text search query
    return {
      q: trimmed,
      confidence: "medium",
      explanation: `Keyword search for "${trimmed}".`,
      engine: "rule",
    };
  }

  const matchedTokens: string[] = [];
  if (recognizedLicense) matchedTokens.push(`charter ${recognizedLicense}`);
  if (recognizedCountry) matchedTokens.push(`in ${recognizedCountry}`);
  if (recognizedPrice) matchedTokens.push(`price bracket ${recognizedPrice}`);
  if (recognizedBusinessType) matchedTokens.push(`model ${recognizedBusinessType}`);

  return {
    country: recognizedCountry,
    licenseType: recognizedLicense,
    businessType: recognizedBusinessType,
    businessStatus: recognizedStatus,
    price: recognizedPrice,
    confidence: matchCount >= 2 ? "high" : "medium",
    explanation: `Extracted filters: ${matchedTokens.join(", ")}.`,
    engine: "rule",
  };
}

/**
 * Parses natural language queries into structured catalogue filters.
 * Uses OpenRouter structured output when available, and seamlessly degrades
 * to the deterministic rule-based parser on any failure or when no key is set.
 */
export async function parseSearchQuery(query: string): Promise<ParsedSearchFilters> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      confidence: "none",
      explanation: "Empty search query",
      engine: "rule",
    };
  }

  // If OpenRouter is not configured, use deterministic rule parser directly
  if (!isOpenRouterConfigured()) {
    return parseSearchQueryDeterministic(trimmed);
  }

  try {
    const aiResult = await callOpenRouterStructured<{
      country?: string;
      licenseType?: LicenseTypeFilter;
      businessType?: BusinessTypeFilter;
      businessStatus?: BusinessStatusFilter;
      price?: PriceFilter;
      q?: string;
      confidence: "high" | "medium" | "low" | "none";
      explanation: string;
    }>({
      systemPrompt:
        "You are an NLP parser for the N5Deal financial M&A marketplace. Convert the user's natural language search query into structured catalogue filters.\n" +
        "Valid licenseType: BANKING, E_MONEY, PAYMENT, CRYPTO, BROKERAGE, INSURANCE, OTHER.\n" +
        "Valid businessType: BANK, FINTECH, PAYMENT_INSTITUTION, CRYPTO_BUSINESS, BROKERAGE, INSURANCE_COMPANY, OTHER.\n" +
        "Valid businessStatus: OPERATING, PRE_LAUNCH, DORMANT, DISTRESSED.\n" +
        "Valid price: under_1m, 1m_5m, 5m_20m, over_20m.\n" +
        "Country should be canonical English name (e.g. Brazil, United Kingdom, Lithuania, Germany).\n" +
        "If the input is nonsensical, gibberish, or completely unrelated to companies/licences, set confidence to 'none' and omit all filter fields.",
      prompt: `Parse this natural language search query: "${trimmed}"`,
      schemaDescription: `{ "country": "string?", "licenseType": "string?", "businessType": "string?", "businessStatus": "string?", "price": "string?", "q": "string?", "confidence": "high|medium|low|none", "explanation": "string" }`,
      timeoutMs: 5000,
    });

    if (aiResult && aiResult.confidence) {
      if (aiResult.confidence === "none") {
        return {
          confidence: "none",
          explanation: aiResult.explanation || "Could not interpret search terms into catalog filters.",
          engine: "ai",
        };
      }

      return {
        country: aiResult.country || undefined,
        licenseType: aiResult.licenseType || undefined,
        businessType: aiResult.businessType || undefined,
        businessStatus: aiResult.businessStatus || undefined,
        price: aiResult.price || undefined,
        q: aiResult.q || undefined,
        confidence: aiResult.confidence,
        explanation: aiResult.explanation || "Successfully parsed search filters with AI.",
        engine: "ai",
      };
    }
  } catch (err) {
    console.warn("[QueryParser] OpenRouter call failed, degrading to rule parser:", err);
  }

  // Graceful degradation to deterministic parser
  return parseSearchQueryDeterministic(trimmed);
}
