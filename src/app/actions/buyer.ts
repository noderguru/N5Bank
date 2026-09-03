"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { buyerProfileSchema } from "@/lib/validation/buyer";

export type BuyerActionResult = {
  success: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

export async function saveBuyerProfileAction(
  _prevState: BuyerActionResult | null,
  formData: FormData
): Promise<BuyerActionResult> {
  const session = await requireRole("BUYER");

  const targetCountriesRaw = formData.getAll("targetCountries").map(String);
  const targetLicenseTypesRaw = formData.getAll("targetLicenseTypes").map(String);
  const targetBusinessTypesRaw = formData.getAll("targetBusinessTypes").map(String);

  const rawData = {
    company: formData.get("company"),
    country: formData.get("country"),
    bio: formData.get("bio") || null,
    thesis: formData.get("thesis") || null,
    ticketMin: formData.get("ticketMin"),
    ticketMax: formData.get("ticketMax"),
    currency: (formData.get("currency") as string) || "USD",
    targetCountries: targetCountriesRaw,
    targetLicenseTypes: targetLicenseTypesRaw,
    targetBusinessTypes: targetBusinessTypesRaw,
    horizon: formData.get("horizon") || "FLEXIBLE",
  };

  const parsed = buyerProfileSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const {
    company,
    country,
    bio,
    thesis,
    ticketMin,
    ticketMax,
    currency,
    targetCountries,
    targetLicenseTypes,
    targetBusinessTypes,
    horizon,
  } = parsed.data;

  await prisma.buyerProfile.upsert({
    where: { userId: session.userId },
    update: {
      company,
      country,
      bio,
      thesis,
      ticketMin:
        ticketMin !== null && ticketMin !== undefined
          ? new Prisma.Decimal(ticketMin)
          : null,
      ticketMax:
        ticketMax !== null && ticketMax !== undefined
          ? new Prisma.Decimal(ticketMax)
          : null,
      currency,
      targetCountries,
      targetLicenseTypes,
      targetBusinessTypes,
      horizon,
    },
    create: {
      userId: session.userId,
      company,
      country,
      bio,
      thesis,
      ticketMin:
        ticketMin !== null && ticketMin !== undefined
          ? new Prisma.Decimal(ticketMin)
          : null,
      ticketMax:
        ticketMax !== null && ticketMax !== undefined
          ? new Prisma.Decimal(ticketMax)
          : null,
      currency,
      targetCountries,
      targetLicenseTypes,
      targetBusinessTypes,
      horizon,
    },
  });

  revalidatePath("/buyer");
  revalidatePath("/buyer/matches");
  revalidatePath(`/buyers/${session.userId}`);
  revalidatePath("/buyers");

  return {
    success: true,
    message: "Investment profile and mandate thesis saved successfully.",
  };
}
