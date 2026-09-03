import { requireRole } from "@/lib/auth/guard";
import { getPlatformSummaryStats } from "@/lib/db/admin";
import { AppShell } from "@/components/layout/app-shell";
import { AdminHeader } from "@/components/admin/admin-header";
import { EmptyState } from "@/components/marketplace/empty-state";

export const metadata = {
  title: "Moderation Log | Manager Console | N5Deal",
  description: "Audit trail of compliance and moderation actions across platform participants and assets.",
};

export default async function AdminModerationPage() {
  const session = await requireRole("MANAGER");
  const stats = await getPlatformSummaryStats();

  return (
    <AppShell
      user={{
        id: session.userId,
        email: session.userId,
        role: session.role,
      }}
    >
      <div className="max-w-7xl mx-auto py-8 space-y-6">
        <AdminHeader stats={stats} activeTab="moderation" />

        <EmptyState
          title="Moderation audit log"
          description="Complete audit log of reversible moderation actions (suspend, reinstate, remove) with mandatory operator justification."
        />
      </div>
    </AppShell>
  );
}
