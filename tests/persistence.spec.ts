import { test, expect } from "@playwright/test";

test.describe("Application State & Session Persistence (N5B-46)", () => {
  test("persists state across reload on filtered catalogue, buyer profile, deal thread, and manager console", async ({
    context,
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    // ==========================================
    // 1. Filtered Catalogue Persistence
    // ==========================================
    await page.goto("/assets");
    await expect(page.getByRole("heading", { name: /Financial Assets/i })).toBeVisible();

    const searchInput = page.getByPlaceholder(/Search/i);
    await searchInput.fill("Banking");
    await expect(page).toHaveURL(/q=Banking/);

    // Filter by Country
    const countrySelect = page.locator("select").first();
    await countrySelect.selectOption("Germany");
    await expect(page).toHaveURL(/country=Germany/);

    // Verify both filters survive reload
    await page.reload();
    await expect(page).toHaveURL(/q=Banking/);
    await expect(page).toHaveURL(/country=Germany/);
    await expect(searchInput).toHaveValue("Banking");
    await expect(countrySelect).toHaveValue("Germany");

    // ==========================================
    // 2. Buyer Profile Mandate Persistence
    // ==========================================
    await page.goto("/login");
    await page.getByRole("button", { name: /Buyer/i }).click();
    await expect(page).toHaveURL(/\/buyer/);

    const thesisTextarea = page.locator('textarea[name="thesis"]');
    await expect(thesisTextarea).toBeVisible();
    const uniqueThesis = `Persistence verification thesis string ${Date.now()}`;
    await thesisTextarea.fill(uniqueThesis);
    await page.getByRole("button", { name: /Save Mandate Profile/i }).click();
    await expect(page.getByText(/saved successfully/i)).toBeVisible();

    // Verify thesis persists across reload
    await page.reload();
    await expect(thesisTextarea).toHaveValue(uniqueThesis);

    // ==========================================
    // 3. Bilateral Conversation Thread Persistence
    // ==========================================
    await page.goto("/inbox");
    await expect(page.getByRole("heading", { name: /Messages & Deal Memos/i })).toBeVisible();

    // Select the first conversation thread if available
    const threadBtn = page.locator('[data-testid^="thread-item-"]').first();
    if (await threadBtn.isVisible()) {
      await threadBtn.click();
      await expect(page).toHaveURL(/conversationId=/);
      const convUrl = page.url();

      const messageInput = page.getByTestId("message-input");
      const persistenceMsg = `Persistence memo audit ${Date.now()}`;
      await messageInput.fill(persistenceMsg);
      await page.getByTestId("send-message-button").click();

      const sentMsg = page.getByTestId("messages-stream").getByText(persistenceMsg);
      await expect(sentMsg).toBeVisible();
      await expect(page.getByText("Sending...")).toHaveCount(0);

      // Verify thread selection and message stream survive reload
      await page.reload();
      expect(page.url()).toBe(convUrl);
      await expect(sentMsg).toBeVisible();
    }

    // ==========================================
    // 4. Manager Console Filter & Query Persistence
    // ==========================================
    await page.goto("/login");
    // Clear cookies or switch to manager
    await context.clearCookies();
    await page.goto("/login");
    await page.getByRole("button", { name: /Manager/i }).click();
    await expect(page).toHaveURL(/\/admin/);

    const adminSearch = page.getByPlaceholder(/Search email, name, or company/i);
    await adminSearch.fill("Olivia");
    await expect(page).toHaveURL(/q=Olivia/);

    // Verify search and table results survive reload
    await page.reload();
    await expect(page).toHaveURL(/q=Olivia/);
    await expect(adminSearch).toHaveValue("Olivia");
    await expect(page.getByText("Olivia Hart")).toBeVisible();

    // ==========================================
    // 5. New Tab Session Survival
    // ==========================================
    const newTab = await context.newPage();
    await newTab.goto("/admin");
    // The new tab in the same context must be immediately authenticated as Manager
    await expect(newTab).toHaveURL(/\/admin/);
    await expect(newTab.getByRole("heading", { name: /Manager Oversight Console/i })).toBeVisible();
    await newTab.close();

    // Assert zero console errors
    expect(consoleErrors).toHaveLength(0);
  });
});
