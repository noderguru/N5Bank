import { requireRole } from "@/lib/auth/guard";
import { AppShell } from "@/components/layout/app-shell";
import { redirect } from "@/i18n/routing";

export const metadata = {
  title: "Audit Logs | Manager Console | N5Deal",
  description: "Platform audit logs and administrative trace oversight.",
};

export default async function AdminAuditPage() {
  const session = await requireRole("MANAGER");
  redirect({ href: "/admin/moderation", locale: "en" });

  return (
    <AppShell
      user={{
        id: session.userId,
        email: session.userId,
        role: session.role,
      }}
    >
      <div className="py-8">Redirecting to moderation...</div>
    </AppShell>
  );
}
