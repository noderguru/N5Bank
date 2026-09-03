import { Prisma, ModerationAction, ModerationTarget } from "@prisma/client";
import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { getPlatformSummaryStats } from "@/lib/db/admin";
import { AppShell } from "@/components/layout/app-shell";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  ModerationTable,
  type ModerationLogRow,
} from "@/components/admin/moderation-table";

export const metadata = {
  title: "Moderation Audit Log | Manager Console | N5Deal",
  description: "Comprehensive audit trail of compliance, suspension, and reinstatement actions across platform entities.",
};

type Props = {
  searchParams: Promise<{
    q?: string;
    action?: string;
    target?: string;
  }>;
};

export default async function AdminModerationPage({ searchParams }: Props) {
  // N5B-39 / N5B-31: Access strictly for MANAGER
  const session = await requireRole("MANAGER");

  const { q, action, target } = await searchParams;

  const andConditions: Prisma.ModerationLogWhereInput[] = [];

  if (q && q.trim()) {
    const term = q.trim();
    andConditions.push({
      OR: [
        { reason: { contains: term, mode: "insensitive" } },
        { actor: { name: { contains: term, mode: "insensitive" } } },
        { actor: { email: { contains: term, mode: "insensitive" } } },
      ],
    });
  }

  if (
    action &&
    Object.values(ModerationAction).includes(action as ModerationAction)
  ) {
    andConditions.push({ action: action as ModerationAction });
  }

  if (
    target &&
    Object.values(ModerationTarget).includes(target as ModerationTarget)
  ) {
    andConditions.push({ targetType: target as ModerationTarget });
  }

  const where: Prisma.ModerationLogWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [stats, rawLogs, totalCount] = await Promise.all([
    getPlatformSummaryStats(),
    prisma.moderationLog.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.moderationLog.count(),
  ]);

  // Extract target IDs to hydrate object names and links
  const userIds = [
    ...new Set(
      rawLogs
        .filter((l) => l.targetType === "USER")
        .map((l) => l.targetId)
    ),
  ];

  const assetIds = [
    ...new Set(
      rawLogs
        .filter((l) => l.targetType === "ASSET")
        .map((l) => l.targetId)
    ),
  ];

  const [users, assets] = await Promise.all([
    userIds.length > 0
      ? prisma.user.findMany({
          where: { id: { in: userIds } },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            sellerProfile: { select: { company: true } },
            buyerProfile: { select: { company: true } },
          },
        })
      : [],
    assetIds.length > 0
      ? prisma.asset.findMany({
          where: { id: { in: assetIds } },
          select: {
            id: true,
            title: true,
            country: true,
            status: true,
          },
        })
      : [],
  ]);

  const userMap = new Map(users.map((u) => [u.id, u]));
  const assetMap = new Map(assets.map((a) => [a.id, a]));

  const logs: ModerationLogRow[] = rawLogs.map((log) => {
    let targetTitle = "Unknown Entity";
    let targetSubtitle: string | undefined;
    let targetHref = "#";

    if (log.targetType === "USER") {
      const u = userMap.get(log.targetId);
      if (u) {
        targetTitle = u.name;
        const company = u.sellerProfile?.company || u.buyerProfile?.company;
        targetSubtitle = company ? `${company} (${u.role})` : u.role;
        targetHref =
          u.role === "BUYER" ? `/buyers/${u.id}` : `/admin/users?q=${encodeURIComponent(u.email)}`;
      } else {
        targetTitle = `User: ${log.targetId.slice(0, 10)}...`;
        targetHref = `/admin/users`;
      }
    } else if (log.targetType === "ASSET") {
      const a = assetMap.get(log.targetId);
      if (a) {
        targetTitle = a.title;
        targetSubtitle = `${a.country} • ${a.status}`;
        targetHref = `/assets/${a.id}`;
      } else {
        targetTitle = `Asset: ${log.targetId.slice(0, 10)}...`;
        targetHref = `/admin/assets`;
      }
    }

    return {
      id: log.id,
      actorId: log.actorId,
      actorName: log.actor.name,
      actorEmail: log.actor.email,
      targetType: log.targetType,
      targetId: log.targetId,
      targetTitle,
      targetSubtitle,
      targetHref,
      action: log.action,
      reason: log.reason,
      createdAt: log.createdAt.toISOString(),
    };
  });

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
        <ModerationTable logs={logs} totalCount={totalCount} />
      </div>
    </AppShell>
  );
}
