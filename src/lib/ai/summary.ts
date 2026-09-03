import { callOpenRouterStructured, isOpenRouterConfigured } from "./openrouter";

export interface AssetSummaryInput {
  title: string;
  country: string;
  licenseType: string;
  businessType: string;
  description?: string;
  features?: string;
  regulator?: string;
  yearOfIssue?: string | number | null;
}

export interface CompletenessWarning {
  field: "regulator" | "yearOfIssue" | "description" | "features";
  message: string;
  severity: "warning" | "info";
}

function humanizeEnumValue(val: string): string {
  return val
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Heuristic completeness audit for asset listing submissions.
 * Rule-based: Runs client/server-side without external dependencies.
 */
export function auditAssetCompleteness(
  data: Partial<AssetSummaryInput>
): CompletenessWarning[] {
  const warnings: CompletenessWarning[] = [];

  // 1. Missing supervisory authority
  if (!data.regulator || !data.regulator.trim()) {
    warnings.push({
      field: "regulator",
      message:
        "Missing financial supervisory authority. Stating the regulator (e.g. FCA, BoL, BaFin, CySEC) significantly accelerates institutional buyer diligence.",
      severity: "warning",
    });
  }

  // 2. Missing vintage / authorization year
  if (!data.yearOfIssue || String(data.yearOfIssue).trim() === "") {
    warnings.push({
      field: "yearOfIssue",
      message:
        "Missing year of authorization. Established license vintage provides verifiable track record for acquirers.",
      severity: "info",
    });
  }

  // 3. Insufficient description length (< 80 characters)
  const desc = data.description?.trim() || "";
  if (desc.length > 0 && desc.length < 80) {
    warnings.push({
      field: "description",
      message:
        "Description is brief (< 80 chars). Detailing client volume, correspondent banking rails, and compliance setup improves inbound deal quality.",
      severity: "warning",
    });
  }

  // 4. Missing key capabilities or rails
  const feats = data.features?.trim() || "";
  if (!feats) {
    warnings.push({
      field: "features",
      message:
        "No operational features specified. Mention key rails such as SEPA, SWIFT BIC, direct clearing, or card issuance.",
      severity: "info",
    });
  }

  return warnings;
}

/**
 * Deterministic template-based summary generator fallback.
 */
export function generateDeterministicSummary(data: AssetSummaryInput): string {
  const license = humanizeEnumValue(data.licenseType || "Financial");
  const country = data.country?.trim() || "Global Jurisdiction";
  const regulator = data.regulator?.trim();
  const year = data.yearOfIssue ? String(data.yearOfIssue).trim() : null;

  const parts: string[] = [];
  parts.push(
    `Fully authorized ${license} institution operating from ${country}`
  );

  if (regulator) {
    parts.push(`under ${regulator} regulatory supervision`);
  }

  if (year) {
    parts.push(`(charter issued ${year})`);
  }

  const baseSentence = parts.join(" ") + ".";

  if (data.features?.trim()) {
    return `${baseSentence} Key capabilities include ${data.features.trim()}.`;
  }

  return `${baseSentence} Turnkey regulated infrastructure ready for institutional acquisition.`;
}

/**
 * Generates an executive listing summary using OpenRouter when available,
 * falling back to the deterministic template if unavailable or failing.
 */
export async function generateAssetSummary(
  data: AssetSummaryInput
): Promise<{ summary: string; engine: "ai" | "rule" }> {
  if (!isOpenRouterConfigured()) {
    return {
      summary: generateDeterministicSummary(data),
      engine: "rule",
    };
  }

  try {
    const aiResult = await callOpenRouterStructured<{ summary: string }>({
      systemPrompt:
        "You are an executive M&A copywriter for the N5Deal financial marketplace. Draft a concise, high-impact 1-2 sentence executive summary (max 180 characters) highlighting the regulatory license, jurisdiction, and core capabilities of the target asset.",
      prompt: `Draft an executive summary for this listing:\n${JSON.stringify(
        data,
        null,
        2
      )}`,
      schemaDescription: `{ "summary": "string" }`,
      timeoutMs: 6000,
    });

    if (aiResult?.summary && aiResult.summary.trim().length > 10) {
      return {
        summary: aiResult.summary.trim(),
        engine: "ai",
      };
    }
  } catch (err) {
    console.warn("[AssetSummary] AI generation failed, falling back to rule template:", err);
  }

  return {
    summary: generateDeterministicSummary(data),
    engine: "rule",
  };
}
