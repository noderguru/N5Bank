import { requireRole } from "@/lib/auth/guard";
import { AppShell } from "@/components/layout/app-shell";
import { AssetForm } from "@/components/marketplace/asset-form";
import { isOpenRouterConfigured } from "@/lib/ai/openrouter";

export const metadata = {
  title: "Publish Listing | N5Deal Marketplace",
  description: "Create and publish a financial asset or M&A opportunity.",
};

export default async function NewAssetPage() {
  const session = await requireRole("SELLER");
  const canUseAi = isOpenRouterConfigured();

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
            Publish New Financial Asset
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            List a regulated license, fintech company, or banking entity. You can save your progress as a draft or submit for immediate publication.
          </p>
        </div>

        <AssetForm canUseAi={canUseAi} />
      </div>
    </AppShell>
  );
}
