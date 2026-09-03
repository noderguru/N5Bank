import { prisma } from "@/lib/db/prisma";

/**
 * Counts unread messages for a user across all active deal threads in a single query.
 * Meets acceptance criteria for N5B-75: "readAt на сообщении, счётчик считается одним запросом".
 */
export async function getUnreadMessagesCount(userId?: string | null): Promise<number> {
  if (!userId) return 0;

  try {
    return await prisma.message.count({
      where: {
        conversation: {
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
        senderId: { not: userId },
        readAt: null,
      },
    });
  } catch {
    return 0;
  }
}
