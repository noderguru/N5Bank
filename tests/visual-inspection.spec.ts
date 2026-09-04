import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const VIEWPORTS = [
  { name: "375", width: 375, height: 812 },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 900 },
];

test.describe("Multi-Viewport Visual & Overflow Audit (N5B-48)", () => {
  test.beforeAll(() => {
    const scratchDir = path.join(process.cwd(), "scratch");
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }
  });

  for (const vp of VIEWPORTS) {
    test(`audits responsive layouts and captures screenshots at ${vp.name} (${vp.width}x${vp.height})`, async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      const assertNoHorizontalOverflow = async (screenName: string) => {
        const overflow = await page.evaluate(() => {
          const scrollW = document.documentElement.scrollWidth;
          const innerW = window.innerWidth;
          return { scrollW, innerW, hasOverflow: scrollW > innerW + 1 };
        });
        expect(
          overflow.hasOverflow,
          `Horizontal overflow detected on ${screenName} at ${vp.width}px! scrollWidth: ${overflow.scrollW}px, innerWidth: ${overflow.innerW}px`
        ).toBe(false);
      };

      // 1. Homepage / Landing Page
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await assertNoHorizontalOverflow("Homepage");
      await page.screenshot({
        path: `scratch/01_home_${vp.name}.png`,
        fullPage: false,
      });

      // 2. Marketplace Catalogue (Light theme)
      await page.goto("/assets");
      await page.waitForLoadState("networkidle");
      await expect(page.getByRole("heading", { name: /Financial Assets/i })).toBeVisible();
      await assertNoHorizontalOverflow("Catalogue");
      await page.screenshot({
        path: `scratch/02_catalogue_${vp.name}_light.png`,
        fullPage: false,
      });

      // 3. Asset Detail Page
      await page.goto("/assets/asset_01");
      await page.waitForLoadState("networkidle");
      await expect(page.locator("h1")).toBeVisible();
      await assertNoHorizontalOverflow("Asset Detail");
      await page.screenshot({
        path: `scratch/03_asset_detail_${vp.name}.png`,
        fullPage: false,
      });

      // 4. Buyer Directory
      await page.goto("/buyers");
      await page.waitForLoadState("networkidle");
      await expect(page.getByRole("heading", { name: /Active Institutional Buyers/i })).toBeVisible();
      await assertNoHorizontalOverflow("Buyer Directory");
      await page.screenshot({
        path: `scratch/04_buyers_${vp.name}.png`,
        fullPage: false,
      });

      // 5. Manager Admin Console
      await context.clearCookies();
      await page.goto("/login");
      const managerDemoBtn = page.getByRole("button", { name: /Manager/i });
      await expect(managerDemoBtn).toBeVisible();
      await managerDemoBtn.click();
      await page.waitForURL(/\/admin/);
      await page.waitForLoadState("networkidle");

      await expect(page.getByRole("heading", { name: /Manager Oversight Console/i })).toBeVisible();
      await assertNoHorizontalOverflow("Admin Console");

      // Verify table readability at 768px (table must be rendered and visible)
      const participantsTable = page.locator("table");
      await expect(participantsTable).toBeVisible();
      const tableHeaders = page.locator("th");
      await expect(tableHeaders.first()).toBeVisible();

      await page.screenshot({
        path: `scratch/05_admin_${vp.name}.png`,
        fullPage: false,
      });
    });
  }
});
