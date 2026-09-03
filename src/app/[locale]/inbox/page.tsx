import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { InboxConversation, InboxView } from "@/components/inbox/inbox-view";

export const metadata = {
  title: "Inbox | N5Deal Marketplace",
  description: "Bilateral deal inquiries, NDA exchanges, and counterparty conversations.",
};

type Props = {
  searchParams: Promise<{
    conversationId?: string;
  }>;
};

export default async function InboxPage({ searchParams }: Props) {
  const { conversationId } = await searchParams;
  const session = await requireUser();

  // 1. Fetch conversations for user
  const rawConversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { buyerId: session.userId },
        { sellerId: session.userId },
      ],
    },
    include: {
      buyer: {
        select: {
          id: true,
          name: true,
          role: true,
          status: true,
          buyerProfile: { select: { company: true } },
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          role: true,
          status: true,
          sellerProfile: { select: { company: true } },
        },
      },
      asset: {
        select: {
          id: true,
          title: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const activeConversationId = conversationId || rawConversations[0]?.id;

  // Criterion: "Непрочитанные сбрасываются при открытии треда"
  if (activeConversationId) {
    await prisma.message.updateMany({
      where: {
        conversationId: activeConversationId,
        senderId: { not: session.userId },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  // Criterion: "readAt на сообщении, счётчик считается одним запросом" (N5B-75)
  const totalUnreadCount = await prisma.message.count({
    where: {
      conversation: {
        OR: [{ buyerId: session.userId }, { sellerId: session.userId }],
      },
      senderId: { not: session.userId },
      readAt: null,
    },
  });

  const conversations: InboxConversation[] = rawConversations.map((c) => {
    const isBuyer = c.buyerId === session.userId;
    const counterparty = isBuyer ? c.seller : c.buyer;
    const company = isBuyer
      ? c.seller.sellerProfile?.company
      : c.buyer.buyerProfile?.company;

    const unread =
      c.id === activeConversationId
        ? 0
        : c.messages.filter(
            (m) => m.senderId !== session.userId && m.readAt === null
          ).length;

    return {
      id: c.id,
      assetId: c.assetId,
      assetTitle: c.asset?.title ?? null,
      counterpartyId: counterparty.id,
      counterpartyName: company || counterparty.name,
      counterpartyRole: counterparty.role,
      counterpartyStatus: counterparty.status,
      updatedAt: c.updatedAt,
      unreadCount: unread,
      messages: c.messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        body: m.body,
        createdAt: m.createdAt,
      })),
    };
  });

  return (
    <AppShell
      user={{
        id: session.userId,
        email: session.userId,
        role: session.role,
      }}
      unreadCount={totalUnreadCount}
    >
      <div className="py-8 space-y-6 max-w-6xl mx-auto">
        <div className="border-b border-hairline pb-6 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand">
            Deal Communications
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Messages &amp; Deal Memos
          </h1>
          <p className="text-sm text-muted-foreground">
            Direct bilateral inquiries, NDAs, and confidential counterparty negotiations.
          </p>
        </div>

        <InboxView
          currentUserId={session.userId}
          conversations={conversations}
          selectedConversationId={activeConversationId}
        />
      </div>
    </AppShell>
  );
}
