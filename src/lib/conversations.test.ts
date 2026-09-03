import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  message: {
    count: vi.fn(),
  },
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: prismaMock,
}));

import { getUnreadMessagesCount } from "./conversations";

describe("getUnreadMessagesCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 0 if userId is null or empty", async () => {
    expect(await getUnreadMessagesCount(null)).toBe(0);
    expect(await getUnreadMessagesCount("")).toBe(0);
    expect(prismaMock.message.count).not.toHaveBeenCalled();
  });

  it("queries unread messages count in a single query where readAt is null and sender is counterparty", async () => {
    prismaMock.message.count.mockResolvedValue(4);

    const count = await getUnreadMessagesCount("usr_123");
    expect(count).toBe(4);
    expect(prismaMock.message.count).toHaveBeenCalledWith({
      where: {
        conversation: {
          OR: [{ buyerId: "usr_123" }, { sellerId: "usr_123" }],
        },
        senderId: { not: "usr_123" },
        readAt: null,
      },
    });
  });
});
