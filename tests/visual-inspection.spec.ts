import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const VIEWPORTS = [
  { name: "mobile_375", width: 375, height: 812 },
  { name: "tablet_768", width: 768, height: 1024 },
  { name: "desktop_1440", width: 1440, height: 900 },
];

test.describe("Visual Responsive & Theme Inspection", () => {
  test.beforeAll(() => {
    const scratchDir = path.join(process.cwd(), "scratch");
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }
  });

  for (const vp of VIEWPORTS) {
    test(`captures responsive screens at ${vp.name} (${vp.width}x${vp.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // 1. Catalogue (Light theme)
      await page.goto("/assets");
      await expect(page.getByRole("heading", { name: /Financial Assets/i })).toBeVisible();

      // Check no horizontal scroll overflow on mobile
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(vp.width + 1);

      await page.screenshot({
        path: `scratch/catalogue_${vp.name}_light.png`,
        fullPage: false,
      });

      // 2. Toggle Dark Theme
      const themeBtn = page.getByRole("button", { name: /theme/i }).first();
      if (await themeBtn.isVisible()) {
        await themeBtn.click();
        await page.waitForTimeout(300);
        await page.screenshot({
          path: `scratch/catalogue_${vp.name}_dark.png`,
          fullPage: false,
        });

        // Switch back to light
        await themeBtn.click();
        await page.waitForTimeout(200);
      }

      // 3. Buyer Directory
      await page.goto("/buyers");
      await expect(page.getByRole("heading", { name: /Verified Buyer Mandates/i })).toBeVisible();
      await page.screenshot({
        path: `scratch/buyers_${vp.name}_light.png`,
        fullPage: false,
      });

      // 4. Admin Console (Log in as manager)
      await page.goto("/login");
      const managerDemoBtn = page.getByRole("button", { name: /Manager/i });
      if (await managerDemoBtn.isVisible()) {
        await managerDemoBtn.click();
        await page.waitForURL(/\/admin/);
        await page.screenshot({
          path: `scratch/admin_${vp.name}_light.png`,
          fullPage: false,
        });
      }
    });
  }
});
