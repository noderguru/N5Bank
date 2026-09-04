import { test, expect } from "@playwright/test";

test.describe("Manager Moderation Cascade End-to-End Journey", () => {
  test("suspends seller as manager, verifies catalogue disappearance as buyer, reinstates seller and verifies reappearance", async ({
    browser,
  }) => {
    // 1. Create isolated browser contexts for concurrent roles
    const managerContext = await browser.newContext();
    const buyerContext = await browser.newContext();

    const managerPage = await managerContext.newPage();
    const buyerPage = await buyerContext.newPage();

    const consoleErrors: string[] = [];
    managerPage.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(`[Manager Console] ${msg.text()}`);
    });
    buyerPage.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("404")) {
        consoleErrors.push(`[Buyer Console] ${msg.text()}`);
      }
    });

    const targetSellerName = "Olivia Hart";
    const canaryAssetTitle = "Germany banking opportunity";
    const canaryAssetUrl = "/assets/asset_01";

    try {
      // 2. Buyer baseline: verify seed asset is visible in public catalogue & direct link works
      await buyerPage.goto("/login");
      await buyerPage.getByRole("button", { name: /Buyer/i }).click();
      await expect(buyerPage).toHaveURL(/\/buyer/);

      await buyerPage.goto("/assets");
      await expect(buyerPage.getByRole("heading", { name: /Financial Assets/i })).toBeVisible();
      await expect(buyerPage.getByText(canaryAssetTitle)).toBeVisible();

      await buyerPage.goto(canaryAssetUrl);
      await expect(buyerPage.locator("h1")).toContainText(canaryAssetTitle);

      // 3. Manager action: Log in as Platform Manager & locate seller
      await managerPage.goto("/login");
      await managerPage.getByRole("button", { name: /Manager/i }).click();
      await expect(managerPage).toHaveURL(/\/admin/);

      const searchInput = managerPage.getByPlaceholder(/Search/i);
      await searchInput.fill(targetSellerName);
      await expect(managerPage.getByText(targetSellerName)).toBeVisible();

      const sellerRow = managerPage.locator("tr", { hasText: targetSellerName });
      await expect(sellerRow.getByText("Active")).toBeVisible();

      // Click Suspend on seller
      await sellerRow.getByRole("button", { name: "Suspend" }).click();

      // Complete justification in moderation dialog
      const reasonInput = managerPage.locator("#moderation-reason");
      await expect(reasonInput).toBeVisible();
      await reasonInput.fill("Compliance audit triggered under AML review protocol");

      await managerPage.getByRole("button", { name: "Suspend Entity" }).click();
      await expect(sellerRow.getByText("Suspended")).toBeVisible();

      // 4. Cascade verification as Buyer: seller's listings must vanish
      await buyerPage.goto("/assets");
      await expect(buyerPage.getByText(canaryAssetTitle)).toHaveCount(0);

      // Direct URL must now result in 404 (not found)
      await buyerPage.goto(canaryAssetUrl);
      await expect(buyerPage.getByText(/404|Page not found/i)).toBeVisible();

      // 5. Manager action: Reinstate the seller
      await expect(sellerRow.getByText("Suspended")).toBeVisible();
      await sellerRow.getByRole("button", { name: "Reinstate" }).click();

      const reinstateReason = managerPage.locator("#moderation-reason");
      await expect(reinstateReason).toBeVisible();
      await reinstateReason.fill("Compliance review concluded and cleared with full approval");

      await managerPage.getByRole("button", { name: "Reinstate Entity" }).click();
      await expect(sellerRow.getByText("Active")).toBeVisible();

      // 6. Buyer verification: listings immediately reappear and direct link succeeds
      await buyerPage.goto("/assets");
      await expect(buyerPage.getByText(canaryAssetTitle)).toBeVisible();

      await buyerPage.goto(canaryAssetUrl);
      await expect(buyerPage.locator("h1")).toContainText(canaryAssetTitle);

      // Assert zero console errors across both roles
      expect(consoleErrors).toHaveLength(0);
    } finally {
      await managerContext.close();
      await buyerContext.close();
    }
  });
});
