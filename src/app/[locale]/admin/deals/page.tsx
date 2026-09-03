import { requireRole } from "@/lib/auth/guard";
import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/marketplace/empty-state";

export const metadata = {
  title: "Deals & Escrow | Manager Console | N5Deal",
  description: "Institutional escrow settlement and bilateral M&A closing oversight.",
};

export default async function AdminDealsPage() {
  const tAdmin = await getTranslations("adminFilters");
  const session = await requireRole("MANAGER");

  return (
    <AppShell
      user={{
        id: session.userId,
        email: session.userId,
        role: session.role,
      }}
    >
      <div className="max-w-5xl mx-auto py-8 space-y-6">
        <div className="border-b border-hairline pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Deals & Escrow Settlement
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Institutional closing management and transactional escrow monitoring.
          </p>
        </div>

        <EmptyState
          title={tAdmin("escrowTitle")}
          description={tAdmin("escrowDesc")}
          action={{
            label: tAdmin("viewActiveInquiries"),
            href: "/inbox",
          }}
        />
      </div>
    </AppShell>
  );
}
