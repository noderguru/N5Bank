import { prisma } from "@/lib/db/prisma";
import type { PlatformSummaryStats } from "@/components/admin/admin-header";

export async function getPlatformSummaryStats(): Promise<PlatformSummaryStats> {
  const [
    totalUsers,
    usersByRole,
    usersByStatus,
    totalAssets,
    assetsByStatus,
    totalConversations,
    totalModerationLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.user.groupBy({ by: ["status"], _count: true }),
    prisma.asset.count(),
    prisma.asset.groupBy({ by: ["status"], _count: true }),
    prisma.conversation.count(),
    prisma.moderationLog.count(),
  ]);

  const roleMap = Object.fromEntries(usersByRole.map((u) => [u.role, u._count]));
  const userStatusMap = Object.fromEntries(usersByStatus.map((u) => [u.status, u._count]));
  const assetStatusMap = Object.fromEntries(assetsByStatus.map((a) => [a.status, a._count]));

  return {
    totalUsers,
    activeBuyers: roleMap["BUYER"] || 0,
    activeSellers: roleMap["SELLER"] || 0,
    managers: roleMap["MANAGER"] || 0,
    suspendedUsers: (userStatusMap["SUSPENDED"] || 0) + (userStatusMap["REMOVED"] || 0),
    totalAssets,
    publishedAssets: assetStatusMap["PUBLISHED"] || 0,
    draftAssets: assetStatusMap["DRAFT"] || 0,
    suspendedAssets: (assetStatusMap["SUSPENDED"] || 0) + (assetStatusMap["REMOVED"] || 0),
    totalConversations,
    totalModerationLogs,
  };
}
