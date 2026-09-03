import { z } from "zod";
import { LicenseType, BusinessType, InvestmentHorizon } from "@prisma/client";

export const buyerProfileSchema = z
  .object({
    company: z
      .string({ required_error: "Company name is required." })
      .trim()
      .min(2, "Company name must be at least 2 characters.")
      .max(100, "Company name cannot exceed 100 characters."),
    country: z
      .string({ required_error: "Jurisdiction / country is required." })
      .trim()
      .min(2, "Country is required.")
      .max(80, "Country cannot exceed 80 characters."),
    bio: z
      .string()
      .max(1000, "Bio cannot exceed 1000 characters.")
      .optional()
      .nullable(),
    thesis: z
      .string()
      .max(2500, "Investment thesis cannot exceed 2500 characters.")
      .optional()
      .nullable(),
    ticketMin: z
      .union([z.string(), z.number()])
      .optional()
      .nullable()
      .transform((val) => {
        if (val === "" || val === null || val === undefined) return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
      }),
    ticketMax: z
      .union([z.string(), z.number()])
      .optional()
      .nullable()
      .transform((val) => {
        if (val === "" || val === null || val === undefined) return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
      }),
    currency: z.string().default("USD"),
    targetCountries: z.array(z.string()).default([]),
    targetLicenseTypes: z
      .array(z.nativeEnum(LicenseType))
      .default([]),
    targetBusinessTypes: z
      .array(z.nativeEnum(BusinessType))
      .default([]),
    horizon: z.nativeEnum(InvestmentHorizon).default(InvestmentHorizon.FLEXIBLE),
  })
  .refine(
    (data) => {
      if (
        data.ticketMin !== null &&
        data.ticketMin !== undefined &&
        data.ticketMax !== null &&
        data.ticketMax !== undefined
      ) {
        return data.ticketMin <= data.ticketMax;
      }
      return true;
    },
    {
      message: "Minimum ticket size cannot exceed maximum ticket size.",
      path: ["ticketMax"],
    }
  );

export type BuyerProfileInput = z.infer<typeof buyerProfileSchema>;

export type ProfileCompletenessResult = {
  score: number;
  missingFields: string[];
  isComplete: boolean;
  qualityLabel: "Low" | "Moderate" | "High" | "Optimal";
};

export function computeProfileCompleteness(
  profile: {
    company?: string | null;
    country?: string | null;
    thesis?: string | null;
    ticketMin?: unknown;
    ticketMax?: unknown;
    targetCountries?: string[] | null;
    targetLicenseTypes?: unknown[] | null;
    targetBusinessTypes?: unknown[] | null;
  } | null
): ProfileCompletenessResult {
  if (!profile) {
    return {
      score: 0,
      missingFields: [
        "Company name",
        "Jurisdiction / country",
        "Investment thesis",
        "Target ticket range",
        "Target countries",
        "Target license types",
      ],
      isComplete: false,
      qualityLabel: "Low",
    };
  }

  const missing: string[] = [];
  let score = 0;

  if (profile.company && profile.company.trim().length >= 2) {
    score += 15;
  } else {
    missing.push("Company name");
  }

  if (profile.country && profile.country.trim().length >= 2) {
    score += 15;
  } else {
    missing.push("Jurisdiction / country");
  }

  if (profile.thesis && profile.thesis.trim().length >= 20) {
    score += 25;
  } else {
    missing.push("Investment thesis (min 20 chars)");
  }

  if (profile.ticketMin !== null && profile.ticketMin !== undefined || profile.ticketMax !== null && profile.ticketMax !== undefined) {
    score += 15;
  } else {
    missing.push("Target ticket range");
  }

  if (profile.targetCountries && profile.targetCountries.length > 0) {
    score += 10;
  } else {
    missing.push("Target countries");
  }

  if (profile.targetLicenseTypes && profile.targetLicenseTypes.length > 0) {
    score += 15;
  } else {
    missing.push("Target license types");
  }

  if (profile.targetBusinessTypes && profile.targetBusinessTypes.length > 0) {
    score += 5;
  }

  let qualityLabel: ProfileCompletenessResult["qualityLabel"] = "Low";
  if (score >= 80) qualityLabel = "Optimal";
  else if (score >= 60) qualityLabel = "High";
  else if (score >= 40) qualityLabel = "Moderate";

  return {
    score,
    missingFields: missing,
    isComplete: score >= 50,
    qualityLabel,
  };
}

