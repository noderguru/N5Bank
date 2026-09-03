import { Prisma, UserRole, UserStatus } from "@prisma/client";
import { getLocale, getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { getPlatformSummaryStats } from "@/lib/db/admin";
import { AppShell } from "@/components/layout/app-shell";
import { AdminHeader } from "@/components/admin/admin-header";
import { UsersTable, type AdminUserRow } from "@/components/admin/users-table";
import { formatTicketRange } from "@/lib/formatters";

export const metadata = {
  title: "Participants & KYC | Manager Console | N5Deal",
  description: "Operational management of marketplace participants, role permissions, and compliance status.",
};

type Props = {
  searchParams: Promise<{
    q?: string;
    role?: string;
    status?: string;
    sort?: string;
  }>;
};

export default async function AdminUsersPage({ searchParams }: Props) {
  const locale = await getLocale();
  const tCommon = await getTranslations("common");
  const ticketLabels = {
    flexible: tCommon("flexibleTicket"),
    from: (amount: string) => tCommon("from", { amount }),
    upTo: (amount: string) => tCommon("upTo", { amount }),
  };
  // N5B-39: Доступ строго для роли MANAGER, проверка на сервере
  const session = await requireRole("MANAGER");

  const { q, role, status, sort } = await searchParams;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (q && q.trim()) {
    const term = q.trim();
    andConditions.push({
      OR: [
        { email: { contains: term, mode: "insensitive" } },
        { name: { contains: term, mode: "insensitive" } },
        { sellerProfile: { company: { contains: term, mode: "insensitive" } } },
        { buyerProfile: { company: { contains: term, mode: "insensitive" } } },
      ],
    });
  }

  if (role && Object.values(UserRole).includes(role as UserRole)) {
    andConditions.push({ role: role as UserRole });
  }

  if (status && Object.values(UserStatus).includes(status as UserStatus)) {
    andConditions.push({ status: status as UserStatus });
  }

  const where: Prisma.UserWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  let orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "oldest") {
    orderBy = { createdAt: "asc" };
  } else if (sort === "name_asc") {
    orderBy = { name: "asc" };
  } else if (sort === "name_desc") {
    orderBy = { name: "desc" };
  }

  const [stats, rawUsers, totalUsersCount] = await Promise.all([
    getPlatformSummaryStats(),
    prisma.user.findMany({
      where,
      include: {
        sellerProfile: {
          select: {
            company: true,
            country: true,
            verified: true,
          },
        },
        buyerProfile: {
          select: {
            company: true,
            country: true,
            ticketMin: true,
            ticketMax: true,
            currency: true,
          },
        },
        _count: {
          select: {
            assets: true,
            buyerConversations: true,
            sellerConversations: true,
          },
        },
      },
      orderBy,
    }),
    prisma.user.count(),
  ]);

  const users: AdminUserRow[] = rawUsers.map((u) => {
    const isSeller = u.role === "SELLER";
    const isBuyer = u.role === "BUYER";
    const company = isSeller
      ? u.sellerProfile?.company || null
      : isBuyer
      ? u.buyerProfile?.company || null
      : null;
    const country = isSeller
      ? u.sellerProfile?.country || null
      : isBuyer
      ? u.buyerProfile?.country || null
      : null;
    const verified = isSeller ? Boolean(u.sellerProfile?.verified) : false;
    const ticketDisplay = isBuyer && u.buyerProfile
      ? formatTicketRange(
          u.buyerProfile.ticketMin ? Number(u.buyerProfile.ticketMin) : null,
          u.buyerProfile.ticketMax ? Number(u.buyerProfile.ticketMax) : null,
          u.buyerProfile.currency,
          locale,
          ticketLabels
        )
      : null;

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      company,
      country,
      verified,
      ticketDisplay,
      assetsCount: u._count.assets,
      conversationsCount: u._count.buyerConversations + u._count.sellerConversations,
      createdAt: u.createdAt.toISOString(),
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
        <AdminHeader stats={stats} activeTab="users" />
        <UsersTable
          users={users}
          totalCount={totalUsersCount}
          currentUserId={session.userId}
        />
      </div>
    </AppShell>
  );
}
