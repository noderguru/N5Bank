import Link from "next/link";
import { Users, FileText, MessageSquare, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type PlatformSummaryStats = {
  totalUsers: number;
  activeBuyers: number;
  activeSellers: number;
  managers: number;
  suspendedUsers: number;
  totalAssets: number;
  publishedAssets: number;
  draftAssets: number;
  suspendedAssets: number;
  totalConversations: number;
  totalModerationLogs: number;
};

type AdminHeaderProps = {
  stats: PlatformSummaryStats;
  activeTab: "users" | "assets" | "moderation";
};

export function AdminHeader({ stats, activeTab }: AdminHeaderProps) {
  const tabs = [
    {
      id: "users",
      label: "Participants & KYC",
      href: "/admin/users",
      count: stats.totalUsers,
    },
    {
      id: "assets",
      label: "Marketplace Assets",
      href: "/admin/assets",
      count: stats.totalAssets,
    },
    {
      id: "moderation",
      label: "Moderation Log",
      href: "/admin/moderation",
      count: stats.totalModerationLogs,
    },
  ] as const;

  const complianceIssuesCount = stats.suspendedUsers + stats.suspendedAssets;

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F3FF] px-2.5 py-0.5 text-xs font-semibold text-brand">
              <CheckCircle2 className="h-3 w-3" />
              Platform Compliance & Governance
            </span>
            <span className="text-xs text-muted-foreground">• Confidential Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Manager Oversight Console
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Direct operational oversight of marketplace participants, regulatory assets, bilateral deal threads, and reversible moderation actions.
          </p>
        </div>
      </div>

      {/* N5B-87: Сводка по площадке (4 Contextual Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Participants */}
        <div className="rounded-2xl border border-hairline bg-white p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Participants
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-ink">
              {stats.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeBuyers} Buyers · {stats.activeSellers} Sellers · {stats.managers} Ops
            </p>
          </div>
        </div>

        {/* Card 2: Assets */}
        <div className="rounded-2xl border border-hairline bg-white p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Market Listings
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FileText className="h-4 w-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-ink">
              {stats.totalAssets}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.publishedAssets} Published · {stats.draftAssets} Drafts · {stats.suspendedAssets} Suspended
            </p>
          </div>
        </div>

        {/* Card 3: Inquiries & Conversations */}
        <div className="rounded-2xl border border-hairline bg-white p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Deal Inquiries
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <MessageSquare className="h-4 w-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-ink">
              {stats.totalConversations}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active bilateral counterparty threads
            </p>
          </div>
        </div>

        {/* Card 4: Compliance & Suspended */}
        <div
          className={cn(
            "rounded-2xl border p-5 space-y-3 shadow-xs transition-colors",
            complianceIssuesCount > 0
              ? "border-amber-200 bg-amber-50/50"
              : "border-hairline bg-white"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Compliance Flags
            </span>
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl",
                complianceIssuesCount > 0
                  ? "bg-amber-100 text-amber-700"
                  : "bg-neutral-100 text-neutral-600"
              )}
            >
              <ShieldAlert className="h-4 w-4" />
            </span>
          </div>
          <div>
            <div
              className={cn(
                "text-2xl font-bold tracking-tight",
                complianceIssuesCount > 0 ? "text-amber-900" : "text-ink"
              )}
            >
              {complianceIssuesCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.suspendedUsers} Suspended Users · {stats.suspendedAssets} Suspended Assets
            </p>
          </div>
        </div>
      </div>

      {/* Manager Tab Navigation */}
      <div className="flex items-center border-b border-hairline gap-2 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "group inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "border-brand text-brand font-semibold"
                  : "border-transparent text-muted-foreground hover:border-neutral-300 hover:text-ink"
              )}
            >
              <span>{tab.label}</span>
              <Badge
                variant={isActive ? "default" : "secondary"}
                className={cn(
                  "text-[11px] h-4 px-1.5 transition-colors",
                  isActive
                    ? "bg-brand text-white"
                    : "bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200"
                )}
              >
                {tab.count}
              </Badge>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
