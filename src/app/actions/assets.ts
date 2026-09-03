"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { assertOwnership, requireRole, requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { assetFormSchema } from "@/lib/validation/asset";

export type AssetActionResult = {
  success: boolean;
  assetId?: string;
  errors?: Record<string, string[]>;
  message?: string;
};

function parseFormDataToAssetPayload(formData: FormData) {
  return {
    title: formData.get("title"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    country: formData.get("country"),
    licenseType: formData.get("licenseType"),
    businessType: formData.get("businessType"),
    businessStatus: formData.get("businessStatus"),
    priceMode: formData.get("priceMode"),
    askingPrice: formData.get("askingPrice"),
    currency: (formData.get("currency") as string) || "USD",
    yearOfIssue: formData.get("yearOfIssue"),
    employees: formData.get("employees"),
    regulator: formData.get("regulator"),
    features: formData.get("features"),
    status: (formData.get("status") as string) || "DRAFT",
  };
}

export async function createAssetAction(
  _prevState: AssetActionResult | null,
  formData: FormData
): Promise<AssetActionResult> {
  const session = await requireRole("SELLER");

  const rawData = parseFormDataToAssetPayload(formData);
  const parsed = assetFormSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const {
    title,
    summary,
    description,
    country,
    licenseType,
    businessType,
    businessStatus,
    priceMode,
    askingPrice,
    currency,
    yearOfIssue,
    employees,
    regulator,
    features,
    status,
  } = parsed.data;

  const asset = await prisma.asset.create({
    data: {
      sellerId: session.userId,
      title,
      summary,
      description,
      country,
      licenseType,
      businessType,
      businessStatus,
      priceMode,
      askingPrice:
        askingPrice !== null && askingPrice !== undefined
          ? new Prisma.Decimal(askingPrice)
          : null,
      currency,
      yearOfIssue,
      employees,
      regulator,
      features,
      status,
    },
  });

  revalidatePath("/seller/assets");
  revalidatePath("/assets");

  return {
    success: true,
    assetId: asset.id,
    message: status === "PUBLISHED" ? "Listing published" : "Draft saved",
  };
}

export async function updateAssetAction(
  assetId: string,
  _prevState: AssetActionResult | null,
  formData: FormData
): Promise<AssetActionResult> {
  const session = await requireRole("SELLER");

  const existing = await prisma.asset.findUnique({
    where: { id: assetId },
  });

  if (!existing) {
    return {
      success: false,
      errors: { _form: ["Asset not found."] },
    };
  }

  assertOwnership(session, existing.sellerId);

  if (existing.status === "SUSPENDED" || existing.status === "REMOVED") {
    return {
      success: false,
      errors: {
        _form: [
          "This listing has been suspended or removed by platform compliance and cannot be modified.",
        ],
      },
    };
  }

  const rawData = parseFormDataToAssetPayload(formData);
  const parsed = assetFormSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const {
    title,
    summary,
    description,
    country,
    licenseType,
    businessType,
    businessStatus,
    priceMode,
    askingPrice,
    currency,
    yearOfIssue,
    employees,
    regulator,
    features,
    status,
  } = parsed.data;

  const updated = await prisma.asset.update({
    where: { id: assetId },
    data: {
      title,
      summary,
      description,
      country,
      licenseType,
      businessType,
      businessStatus,
      priceMode,
      askingPrice:
        askingPrice !== null && askingPrice !== undefined
          ? new Prisma.Decimal(askingPrice)
          : null,
      currency,
      yearOfIssue,
      employees,
      regulator,
      features,
      status,
    },
  });

  revalidatePath("/seller/assets");
  revalidatePath(`/seller/assets/${assetId}`);
  revalidatePath(`/assets/${assetId}`);
  revalidatePath("/assets");

  return {
    success: true,
    assetId: updated.id,
    message: "Listing updated successfully",
  };
}

export async function toggleAssetStatusAction(
  assetId: string
): Promise<AssetActionResult> {
  const session = await requireRole("SELLER");

  const existing = await prisma.asset.findUnique({
    where: { id: assetId },
  });

  if (!existing) {
    return {
      success: false,
      errors: { _form: ["Asset not found."] },
    };
  }

  assertOwnership(session, existing.sellerId);

  if (existing.status === "SUSPENDED" || existing.status === "REMOVED") {
    return {
      success: false,
      errors: {
        _form: [
          "This listing is currently suspended or removed by moderation.",
        ],
      },
    };
  }

  const nextStatus = existing.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

  await prisma.asset.update({
    where: { id: assetId },
    data: { status: nextStatus },
  });

  revalidatePath("/seller/assets");
  revalidatePath("/assets");

  return {
    success: true,
    assetId,
    message:
      nextStatus === "PUBLISHED"
        ? "Listing is now published"
        : "Listing moved to drafts",
  };
}

export async function removeAssetAction(
  assetId: string
): Promise<AssetActionResult> {
  const session = await requireRole("SELLER");

  const existing = await prisma.asset.findUnique({
    where: { id: assetId },
  });

  if (!existing) {
    return {
      success: false,
      errors: { _form: ["Asset not found."] },
    };
  }

  assertOwnership(session, existing.sellerId);

  await prisma.asset.update({
    where: { id: assetId },
    data: { status: "REMOVED" },
  });

  revalidatePath("/seller/assets");
  revalidatePath("/assets");

  return {
    success: true,
    assetId,
    message: "Listing removed",
  };
}

export type FavoriteActionResult = {
  success: boolean;
  isFavorite?: boolean;
  error?: string;
};

export async function toggleFavoriteAction(
  assetId: string
): Promise<FavoriteActionResult> {
  const session = await requireUser();

  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { id: true, status: true, seller: { select: { status: true } } },
  });

  if (!asset || asset.status !== "PUBLISHED" || asset.seller.status !== "ACTIVE") {
    return { success: false, error: "Asset not available." };
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_assetId: {
        userId: session.userId,
        assetId,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: {
        userId_assetId: {
          userId: session.userId,
          assetId,
        },
      },
    });

    revalidatePath("/assets");
    revalidatePath(`/assets/${assetId}`);
    revalidatePath("/buyer/saved");

    return { success: true, isFavorite: false };
  }

  await prisma.favorite.create({
    data: {
      userId: session.userId,
      assetId,
    },
  });

  revalidatePath("/assets");
  revalidatePath(`/assets/${assetId}`);
  revalidatePath("/buyer/saved");

  return { success: true, isFavorite: true };
}

export async function recordAssetViewAction(assetId: string): Promise<void> {
  try {
    await prisma.asset.update({
      where: { id: assetId },
      data: { views: { increment: 1 } },
    });
  } catch {
    // Non-blocking
  }
}

