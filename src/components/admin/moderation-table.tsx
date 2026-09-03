"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  X,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  RotateCcw as RestoreIcon,
  Trash2,
  CheckCircle2,
  FileText,
  User,
  Clock,
  Quote,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NoResultsState } from "@/components/marketplace/no-results-state";
import { EmptyState } from "@/components/marketplace/empty-state";
import { formatDateTime } from "@/lib/formatters";
import type { ModerationAction, ModerationTarget } from "@prisma/client";

export type ModerationLogRow = {
  id: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  targetType: ModerationTarget;
  targetId: string;
  targetTitle: string;
  targetSubtitle?: string;
  targetHref: string;
  action: ModerationAction;
  reason: string;
  createdAt: string;
};

type ModerationTableProps = {
  logs: ModerationLogRow[];
  totalCount: number;
};

const ACTION_FILTERS = [
  { value: "ALL", label: "All Actions" },
  { value: "SUSPEND", label: "Suspensions" },
  { value: "RESTORE", label: "Reinstatements" },
  { value: "REMOVE", label: "Removals" },
  { value: "VALIDATE", label: "Verifications" },
];

const TARGET_FILTERS = [
  { value: "ALL", label: "All Targets" },
  { value: "USER", label: "Participants" },
  { value: "ASSET", label: "Listings" },
];

export function ModerationTable({ logs, totalCount }: ModerationTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentQ = searchParams.get("q") || "";
  const currentAction = searchParams.get("action") || "ALL";
  const currentTarget = searchParams.get("target") || "ALL";

  const hasActiveFilters = Boolean(
    currentQ ||
      (currentAction && currentAction !== "ALL") ||
      (currentTarget && currentTarget !== "ALL")
  );

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`/admin/moderation?${params.toString()}`);
    });
  };

  const handleReset = () => {
    startTransition(() => {
      router.push("/admin/moderation");
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between rounded-2xl border border-hairline bg-surface p-4 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={currentQ}
            onChange={(e) => updateParam("q", e.target.value)}
            placeholder="Search reason or operator..."
            className="pl-9 pr-8 h-9 text-sm rounded-xl border-hairline bg-canvas"
          />
          {currentQ && (
            <button
              onClick={() => updateParam("q", "")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Target Filter */}
          <select
            value={currentTarget}
            onChange={(e) => updateParam("target", e.target.value)}
            className="h-9 rounded-xl border border-hairline bg-canvas px-3 text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-brand"
            aria-label="Filter by target type"
          >
            {TARGET_FILTERS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Action Filter */}
          <select
            value={currentAction}
            onChange={(e) => updateParam("action", e.target.value)}
            className="h-9 rounded-xl border border-hairline bg-canvas px-3 text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-brand"
            aria-label="Filter by action"
          >
            {ACTION_FILTERS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>

          {/* Reset Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-ink gap-1 rounded-xl"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Results Counter */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing <strong className="font-semibold text-ink">{logs.length}</strong> of {totalCount} moderation entries
        </span>
      </div>

      {/* Table Container */}
      {logs.length > 0 ? (
        <div className="rounded-2xl border border-hairline bg-surface shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[860px]">
              <TableHeader>
                <TableRow className="bg-canvas/50 hover:bg-canvas/50 border-hairline">
                  <TableHead className="w-[160px] text-xs font-semibold uppercase text-muted-foreground tracking-wider py-3">
                    Timestamp
                  </TableHead>
                  <TableHead className="w-[130px] text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Action
                  </TableHead>
                  <TableHead className="w-[220px] text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Target Object
                  </TableHead>
                  <TableHead className="min-w-[240px] text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Justification / Reason
                  </TableHead>
                  <TableHead className="w-[150px] text-right text-xs font-semibold uppercase text-muted-foreground tracking-wider pr-4">
                    Compliance Officer
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  return (
                    <TableRow
                      key={log.id}
                      className="border-hairline transition-colors hover:bg-canvas/60"
                    >
                      {/* Timestamp */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                          <span>{formatDateTime(log.createdAt)}</span>
                        </div>
                      </TableCell>

                      {/* Action Badge */}
                      <TableCell>
                        {log.action === "SUSPEND" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                            <ShieldAlert className="h-3 w-3 text-amber-600" />
                            Suspend
                          </span>
                        ) : log.action === "RESTORE" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                            <RestoreIcon className="h-3 w-3 text-emerald-600" />
                            Reinstate
                          </span>
                        ) : log.action === "REMOVE" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800 border border-rose-200">
                            <Trash2 className="h-3 w-3 text-rose-600" />
                            Remove
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800 border border-blue-200">
                            <CheckCircle2 className="h-3 w-3 text-blue-600" />
                            Validate
                          </span>
                        )}
                      </TableCell>

                      {/* Target Object Link - N5B-31 */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-canvas text-muted-foreground text-[10px] font-semibold border border-hairline">
                              {log.targetType === "USER" ? (
                                <User className="h-3 w-3" />
                              ) : (
                                <FileText className="h-3 w-3" />
                              )}
                            </span>
                            <Link
                              href={log.targetHref}
                              className="font-medium text-sm text-ink hover:text-brand hover:underline inline-flex items-center gap-1 truncate max-w-[180px]"
                            >
                              <span className="truncate">{log.targetTitle}</span>
                              <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                            </Link>
                          </div>
                          {log.targetSubtitle && (
                            <div className="text-[11px] text-muted-foreground truncate pl-6.5">
                              {log.targetSubtitle}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Reason */}
                      <TableCell>
                        <div className="flex items-start gap-1.5 rounded-xl bg-canvas/60 p-2 border border-hairline/60">
                          <Quote className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-xs text-ink leading-relaxed font-normal">
                            {log.reason}
                          </p>
                        </div>
                      </TableCell>

                      {/* Actor Officer */}
                      <TableCell className="text-right pr-4">
                        <div className="text-xs space-y-0.5">
                          <div className="font-medium text-ink">{log.actorName}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {log.actorEmail}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : hasActiveFilters ? (
        <NoResultsState
          title="No log entries found"
          description="No moderation entries matched your active search query or filter parameters. Reset filters to view all audit entries."
          query={currentQ}
          resetHref="/admin/moderation"
          resetLabel="Clear all filters"
        />
      ) : (
        /* Acceptance Criterion: Пустое состояние осмысленное */
        <EmptyState
          title="No compliance actions recorded yet"
          description="Every reversible moderation intervention (user suspension, reinstatement, listing removal, or charter validation) will be logged here with mandatory compliance justification."
          action={{
            label: "Explore Participants Directory",
            href: "/admin/users",
          }}
        />
      )}
    </div>
  );
}
