import { test, expect } from "@playwright/test";

test.describe("Buyer End-to-End Journey", () => {
  test("authenticates as buyer, inspects profile, filters catalog, opens asset, and messages seller", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    // 1. One-click Demo Buyer authentication
    await page.goto("/login");
    const buyerDemoBtn = page.getByRole("button", { name: /Buyer/i });
    await buyerDemoBtn.click();
    await expect(page).toHaveURL(/\/buyer/);

    // Verify buyer dashboard survives refresh
    await page.reload();
    await expect(page).toHaveURL(/\/buyer/);

    // 2. Verify and update investment mandate thesis in buyer profile
    const thesisTextarea = page.locator('textarea[name="thesis"]');
    await expect(thesisTextarea).toBeVisible();
    const updatedThesis = `Strategic acquisitions of licensed EEA financial institutions ${Date.now()}`;
    await thesisTextarea.fill(updatedThesis);
    await page.getByRole("button", { name: /Save Mandate Profile/i }).click();
    await expect(page.getByText(/saved successfully/i)).toBeVisible();

    // Verify thesis persistence after refresh
    await page.reload();
    await expect(thesisTextarea).toHaveValue(updatedThesis);

    // 3. Browse marketplace catalogue and test URL-persisted filter
    await page.goto("/assets");
    await expect(page.getByRole("heading", { name: /Financial Assets/i })).toBeVisible();

    const searchInput = page.getByPlaceholder(/Search/i);
    await searchInput.fill("Payment");
    await expect(page).toHaveURL(/q=Payment/);

    // Verify filter survives reload
    await page.reload();
    await expect(page).toHaveURL(/q=Payment/);
    await expect(searchInput).toHaveValue("Payment");

    // 4. Open asset detail page
    const assetCard = page.locator("article a").first();
    await expect(assetCard).toBeVisible();
    await assetCard.click();
    await expect(page).toHaveURL(/\/assets\//);

    // Verify key asset detail elements
    await expect(page.locator("h1")).toBeVisible();
    const contactSellerBtn = page.getByTestId("contact-seller-button").first();
    await expect(contactSellerBtn).toBeVisible();

    // 5. Initiate deal discussion with seller
    await contactSellerBtn.click();
    await expect(page).toHaveURL(/\/inbox\?conversationId=/);

    // 6. Send message and verify persistence across reload
    const messageInput = page.getByTestId("message-input");
    const testMessage = `Formal expression of interest from buyer mandate ${Date.now()}`;
    await messageInput.fill(testMessage);
    await page.getByTestId("send-message-button").click();

    const streamMsg = page.getByTestId("messages-stream").getByText(testMessage);
    await expect(streamMsg).toBeVisible();
    await expect(page.getByText("Sending...")).toHaveCount(0);

    // Verify message persistence across reload
    await page.reload();
    await expect(streamMsg).toBeVisible();

    // Assert zero console errors throughout the journey
    expect(consoleErrors).toHaveLength(0);
  });
});
