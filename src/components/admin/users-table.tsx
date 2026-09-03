"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  X,
  RotateCcw,
  ExternalLink,
  Shield,
  ShieldAlert,
  Building2,
  Globe,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NoResultsState } from "@/components/marketplace/no-results-state";
import { ModerationDialog } from "@/components/admin/moderation-dialog";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: "BUYER" | "SELLER" | "MANAGER";
  status: "ACTIVE" | "SUSPENDED" | "REMOVED";
  company: string | null;
  country: string | null;
  verified: boolean;
  ticketDisplay: string | null;
  assetsCount: number;
  conversationsCount: number;
  createdAt: string;
};

type UsersTableProps = {
  users: AdminUserRow[];
  totalCount: number;
  currentUserId?: string;
};

const ROLES = [
  { value: "ALL", label: "All Roles" },
  { value: "BUYER", label: "Buyers" },
  { value: "SELLER", label: "Sellers" },
  { value: "MANAGER", label: "Managers" },
];

const STATUSES = [
  { value: "ALL", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "REMOVED", label: "Removed" },
];

const SORTS = [
  { value: "newest", label: "Registered: Newest" },
  { value: "oldest", label: "Registered: Oldest" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
];

export function UsersTable({ users, totalCount, currentUserId }: UsersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    targetId: string;
    targetTitle: string;
    action: "SUSPEND" | "RESTORE" | "REMOVE";
  }>({
    open: false,
    targetId: "",
    targetTitle: "",
    action: "SUSPEND",
  });

  const currentQ = searchParams.get("q") || "";
  const currentRole = searchParams.get("role") || "ALL";
  const currentStatus = searchParams.get("status") || "ALL";
  const currentSort = searchParams.get("sort") || "newest";

  const hasActiveFilters = Boolean(
    currentQ ||
      (currentRole && currentRole !== "ALL") ||
      (currentStatus && currentStatus !== "ALL") ||
      (currentSort && currentSort !== "newest")
  );

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL" && !(key === "sort" && value === "newest")) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`/admin/users?${params.toString()}`);
    });
  };

  const handleReset = () => {
    startTransition(() => {
      router.push("/admin/users");
    });
  };

  const openModeration = (
    id: string,
    name: string,
    action: "SUSPEND" | "RESTORE" | "REMOVE"
  ) => {
    setDialogState({
      open: true,
      targetId: id,
      targetTitle: name,
      action,
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
            placeholder="Search email, name, or company..."
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
          {/* Role Select */}
          <select
            value={currentRole}
            onChange={(e) => updateParam("role", e.target.value)}
            className="h-9 rounded-xl border border-hairline bg-canvas px-3 text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-brand"
            aria-label="Filter by role"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={currentStatus}
            onChange={(e) => updateParam("status", e.target.value)}
            className="h-9 rounded-xl border border-hairline bg-canvas px-3 text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-brand"
            aria-label="Filter by status"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Sort Select */}
          <select
            value={currentSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="h-9 rounded-xl border border-hairline bg-canvas px-3 text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-brand"
            aria-label="Sort users"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
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

      {/* Results Count & Context */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing <strong className="font-semibold text-ink">{users.length}</strong> of {totalCount} participants
        </span>
      </div>

      {/* Table Container - N5B-39: Responsive, doesn't break at 1024px */}
      {users.length > 0 ? (
        <div className="rounded-2xl border border-hairline bg-surface shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[840px]">
              <TableHeader>
                <TableRow className="bg-canvas/50 hover:bg-canvas/50 border-hairline">
                  <TableHead className="w-[220px] text-xs font-semibold uppercase text-muted-foreground tracking-wider py-3">
                    Participant
                  </TableHead>
                  <TableHead className="w-[100px] text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Role
                  </TableHead>
                  <TableHead className="w-[110px] text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="min-w-[160px] text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Entity / Country
                  </TableHead>
                  <TableHead className="w-[120px] text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Activity
                  </TableHead>
                  <TableHead className="w-[110px] text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Joined
                  </TableHead>
                  <TableHead className="w-[170px] text-right text-xs font-semibold uppercase text-muted-foreground tracking-wider pr-4">
                    Moderation / Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const isSuspended = user.status === "SUSPENDED";
                  const isRemoved = user.status === "REMOVED";
                  const isSelf = currentUserId === user.id;

                  return (
                    <TableRow
                      key={user.id}
                      className={cn(
                        "border-hairline transition-colors hover:bg-canvas/60",
                        isSuspended && "bg-amber-50/30",
                        isRemoved && "bg-rose-50/30 opacity-75"
                      )}
                    >
                      {/* Name & Email */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold",
                              user.role === "MANAGER"
                                ? "bg-purple-100 text-purple-700"
                                : user.role === "SELLER"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-blue-100 text-blue-700"
                            )}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-medium text-ink truncate text-sm">
                              <span>{user.name}</span>
                              {user.verified && (
                                <Shield className="h-3 w-3 text-emerald-600 shrink-0" />
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Role Badge */}
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
                            user.role === "MANAGER"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : user.role === "SELLER"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          )}
                        >
                          {user.role}
                        </span>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>
                        {user.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : isSuspended ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                            <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700">
                            <X className="h-3.5 w-3.5 text-rose-600" />
                            Removed
                          </span>
                        )}
                      </TableCell>

                      {/* Entity & Country */}
                      <TableCell>
                        {user.company ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-xs font-medium text-ink truncate">
                              <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="truncate">{user.company}</span>
                            </div>
                            {user.country && (
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Globe className="h-2.5 w-2.5 shrink-0" />
                                <span>{user.country}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            {user.role === "MANAGER" ? "Platform Operations" : "No entity profile"}
                          </span>
                        )}
                      </TableCell>

                      {/* Activity */}
                      <TableCell>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          {user.role === "SELLER" && (
                            <div>
                              <strong className="font-semibold text-ink">{user.assetsCount}</strong> listings
                            </div>
                          )}
                          {user.role === "BUYER" && user.ticketDisplay && (
                            <div className="truncate max-w-[130px]" title={user.ticketDisplay}>
                              {user.ticketDisplay}
                            </div>
                          )}
                          <div>
                            <strong className="font-semibold text-ink">{user.conversationsCount}</strong> inquiries
                          </div>
                        </div>
                      </TableCell>

                      {/* Joined Date */}
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>

                      {/* N5B-34: Moderation Actions & Dialog Trigger */}
                      <TableCell className="text-right pr-4">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {isSelf ? (
                            <span className="text-[11px] font-medium text-muted-foreground italic px-2">
                              Your Account
                            </span>
                          ) : (
                            <>
                              {/* Primary Quick Action Button */}
                              {user.status === "ACTIVE" ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openModeration(user.id, user.name, "SUSPEND")}
                                  className="h-7 px-2 text-xs font-medium border-amber-200 text-amber-800 hover:bg-amber-50 rounded-lg"
                                >
                                  Suspend
                                </Button>
                              ) : isSuspended ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openModeration(user.id, user.name, "RESTORE")}
                                  className="h-7 px-2 text-xs font-medium border-emerald-200 text-emerald-800 hover:bg-emerald-50 rounded-lg"
                                >
                                  Reinstate
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openModeration(user.id, user.name, "RESTORE")}
                                  className="h-7 px-2 text-xs font-medium border-neutral-200 text-neutral-800 hover:bg-canvas rounded-lg"
                                >
                                  Restore
                                </Button>
                              )}

                              {/* Dropdown for Secondary Actions */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-ink"
                                    aria-label="More options"
                                  >
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  {user.role === "BUYER" && (
                                    <DropdownMenuItem asChild>
                                      <Link
                                        href={`/buyers/${user.id}`}
                                        className="flex items-center gap-2 cursor-pointer"
                                      >
                                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>View Mandate</span>
                                      </Link>
                                    </DropdownMenuItem>
                                  )}
                                  {user.role === "SELLER" && (
                                    <DropdownMenuItem asChild>
                                      <Link
                                        href={`/admin/assets?sellerId=${user.id}`}
                                        className="flex items-center gap-2 cursor-pointer"
                                      >
                                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>View Listings ({user.assetsCount})</span>
                                      </Link>
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuSeparator />

                                  {user.status !== "REMOVED" && (
                                    <DropdownMenuItem
                                      onClick={() => openModeration(user.id, user.name, "REMOVE")}
                                      className="flex items-center gap-2 text-rose-700 cursor-pointer focus:text-rose-700 focus:bg-rose-50"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      <span>Remove Participant</span>
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <NoResultsState
          title="No participants found"
          description="No users matched your active search query or role/status filters. Reset filters to view all platform participants."
          query={currentQ}
          resetHref="/admin/users"
          resetLabel="Clear all filters"
        />
      )}

      {/* Moderation Confirmation Dialog - N5B-88 */}
      <ModerationDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((prev) => ({ ...prev, open }))}
        targetType="USER"
        targetId={dialogState.targetId}
        targetTitle={dialogState.targetTitle}
        action={dialogState.action}
      />
    </div>
  );
}
