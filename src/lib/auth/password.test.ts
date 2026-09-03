import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("hashes passwords with a unique salt and verifies the matching value", async () => {
    const password = "correct horse battery staple";
    const [firstHash, secondHash] = await Promise.all([
      hashPassword(password),
      hashPassword(password),
    ]);

    expect(firstHash).not.toBe(password);
    expect(secondHash).not.toBe(firstHash);
    await expect(verifyPassword(password, firstHash)).resolves.toBe(true);
    await expect(verifyPassword("wrong password", firstHash)).resolves.toBe(false);
  });
});
