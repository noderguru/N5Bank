import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { InboxConversation, InboxView } from "@/components/inbox/inbox-view";

export const metadata = {
  title: "Inbox | N5Deal Marketplace",
  description: "Bilateral deal inquiries and counterparty conversations.",
};

type Props = {
  searchParams: Promise<{
    conversationId?: string;
  }>;
};

export default async function InboxPage({ searchParams }: Props) {
  const { conversationId } = await searchParams;
  const session = await requireUser();

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

  const conversations: InboxConversation[] = rawConversations.map((c) => {
    const isBuyer = c.buyerId === session.userId;
    const counterparty = isBuyer ? c.seller : c.buyer;
    const company = isBuyer
      ? c.seller.sellerProfile?.company
      : c.buyer.buyerProfile?.company;

    return {
      id: c.id,
      assetId: c.assetId,
      assetTitle: c.asset?.title ?? null,
      counterpartyId: counterparty.id,
      counterpartyName: company || counterparty.name,
      counterpartyRole: counterparty.role,
      counterpartyStatus: counterparty.status,
      updatedAt: c.updatedAt,
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
    >
      <div className="py-8 space-y-6 max-w-6xl mx-auto">
        <div className="border-b border-[#D9D9D9] pb-6 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#383BFE]">
            Deal Communications
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Messages &amp; Deal Memos
          </h1>
          <p className="text-sm text-neutral-500">
            Direct communication with counterparties, NDA requests, and indicative acquisition proposals.
          </p>
        </div>

        <InboxView
          currentUserId={session.userId}
          conversations={conversations}
          selectedConversationId={conversationId}
        />
      </div>
    </AppShell>
  );
}
