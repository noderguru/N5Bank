import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { assertOwnership, requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { AssetForm } from "@/components/marketplace/asset-form";
import { AlertCircle } from "lucide-react";
import { isOpenRouterConfigured } from "@/lib/ai/openrouter";

export const metadata = {
  title: "Edit Listing | N5Deal Marketplace",
  description: "Update details of an existing financial asset listing.",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditAssetPage({ params }: Props) {
  const t = await getTranslations("seller");
  const { id } = await params;
  const session = await requireRole("SELLER");

  const asset = await prisma.asset.findUnique({
    where: { id },
  });

  if (!asset) {
    notFound();
  }

  assertOwnership(session, asset.sellerId);

  const isSuspended = asset.status === "SUSPENDED" || asset.status === "REMOVED";

  return (
    <AppShell
      user={{
        id: session.userId,
        email: session.userId,
        role: session.role,
      }}
    >
      <div className="mx-auto max-w-3xl py-8 space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#383BFE]">
            Seller Workspace
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Edit Asset Listing
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            Update pricing terms, licensing specifics, operational metrics or marketing description.
          </p>
        </div>

        {isSuspended ? (
          <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2.5 text-amber-800 font-semibold">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{t("underComplianceAction")}</span>
            </div>
            <p className="text-sm text-amber-700 leading-relaxed">
              This listing has been suspended or removed by platform compliance. Changes cannot be published while under moderation. Please review the moderation log or contact platform support.
            </p>
          </div>
        ) : (
          <AssetForm
            isEdit
            canUseAi={isOpenRouterConfigured()}
            initialData={{
              id: asset.id,
              title: asset.title,
              summary: asset.summary,
              description: asset.description,
              country: asset.country,
              licenseType: asset.licenseType,
              businessType: asset.businessType,
              businessStatus: asset.businessStatus,
              priceMode: asset.priceMode,
              askingPrice: asset.askingPrice ? Number(asset.askingPrice) : null,
              currency: asset.currency,
              yearOfIssue: asset.yearOfIssue,
              employees: asset.employees,
              regulator: asset.regulator,
              features: asset.features,
              status: asset.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
            }}
          />
        )}
      </div>
    </AppShell>
  );
}
