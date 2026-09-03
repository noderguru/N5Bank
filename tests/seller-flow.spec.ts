import { test, expect } from "@playwright/test";

test.describe("Seller End-to-End Journey", () => {
  test("authenticates as seller, creates listing, browses buyers, and initiates conversation", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    // 1. One-click Demo Seller authentication
    await page.goto("/login");
    const sellerDemoBtn = page.getByRole("button", { name: /Seller/i });
    await sellerDemoBtn.click();
    await expect(page).toHaveURL(/\/seller\/assets/);

    // Verify dashboard survives refresh
    await page.reload();
    await expect(page).toHaveURL(/\/seller\/assets/);

    // 2. Publish new financial asset
    await page.goto("/seller/assets/new");
    await expect(page.getByRole("heading", { name: /Publish New Financial Asset/i })).toBeVisible();

    const uniqueTitle = `Automated Test Bank ${Date.now()}`;
    await page.fill("#title", uniqueTitle);
    await page.fill("#country", "Lithuania");
    await page.selectOption("#licenseType", "E_MONEY");
    await page.selectOption("#businessType", "PAYMENT_INSTITUTION");
    await page.selectOption("#businessStatus", "OPERATING");
    await page.fill("#askingPrice", "3500000");
    await page.selectOption("#currency", "EUR");
    await page.fill("#summary", "Turnkey licensed electronic money institution with direct SEPA connectivity.");
    await page.fill(
      "#description",
      "Full passporting capabilities across the EEA, robust compliance, correspondent accounts with top tier European institutions."
    );
    await page.fill("#features", "Direct SEPA, SWIFT BIC, Principal Mastercard Member");
    await page.fill("#yearOfIssue", "2022");
    await page.fill("#employees", "18");
    await page.fill("#regulator", "Bank of Lithuania");

    await page.getByRole("button", { name: "Publish Listing" }).click();
    await expect(page).toHaveURL(/\/seller\/assets/);

    // Verify created asset appears and survives reload
    await expect(page.getByText(uniqueTitle)).toBeVisible();
    await page.reload();
    await expect(page.getByText(uniqueTitle)).toBeVisible();

    // 3. Browse buyers catalog and test URL-persisted filter
    await page.goto("/buyers");
    const searchInput = page.getByPlaceholder(/Search by buyer company/i);
    await searchInput.fill("Rhein");
    await expect(page).toHaveURL(/q=Rhein/);
    await page.reload();
    await expect(page).toHaveURL(/q=Rhein/);

    // 4. Inspect buyer mandate details
    const buyerCardLink = page.getByRole("link", { name: /Rhein/i }).first();
    await buyerCardLink.click();
    await expect(page).toHaveURL(/\/buyers\//);
    await expect(page.getByRole("heading", { name: /Rhein/i })).toBeVisible();

    // 5. Initiate conversation and verify inbox thread
    const contactBtn = page.getByRole("button", { name: /Initiate Deal Discussion/i });
    await contactBtn.click();
    await expect(page).toHaveURL(/\/inbox\?conversationId=/);

    // 6. Send message and verify persistence across reload
    const messageInput = page.getByPlaceholder(/Type your message/i);
    const testMessage = `Deal memorandum regarding asset ${Date.now()}`;
    await messageInput.fill(testMessage);
    await page.getByRole("button", { name: /Send Message/i }).click();

    const streamMsg = page.getByTestId("messages-stream").getByText(testMessage);
    await expect(streamMsg).toBeVisible();
    await expect(page.getByText("Sending...")).not.toBeVisible();
    await page.reload();
    await expect(streamMsg).toBeVisible();

    // Assert zero console errors throughout the journey
    expect(consoleErrors).toHaveLength(0);
  });
});
