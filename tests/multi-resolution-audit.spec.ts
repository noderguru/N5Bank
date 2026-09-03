import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const AUDIT_DIR = path.join(process.cwd(), "scratch/audit");

const VIEWPORTS = [
  { id: "mobile_320", name: "Mobile (320x568, iPhone SE Gen 1)", width: 320, height: 568 },
  { id: "mobile_375", name: "Mobile (375x812, iPhone X/Mini)", width: 375, height: 812 },
  { id: "mobile_390", name: "Mobile (390x844, iPhone 14/15)", width: 390, height: 844 },
  { id: "mobile_428", name: "Mobile (428x926, iPhone Pro Max)", width: 428, height: 926 },
  { id: "tablet_600", name: "Small Tablet (600x960, Foldable)", width: 600, height: 960 },
  { id: "tablet_768", name: "Tablet Portrait (768x1024, iPad)", width: 768, height: 1024 },
  { id: "tablet_1024", name: "Tablet Landscape / Netbook (1024x768)", width: 1024, height: 768 },
  { id: "desktop_1280", name: "Laptop (1280x800, MacBook 13)", width: 1280, height: 800 },
  { id: "desktop_1440", name: "Desktop (1440x900, MacBook 15/16)", width: 1440, height: 900 },
  { id: "desktop_1920", name: "Full HD (1920x1080)", width: 1920, height: 1080 },
  { id: "desktop_2560", name: "QHD / 2K Ultra-wide (2560x1440)", width: 2560, height: 1440 },
];

test.describe("Cross-Device Multi-Resolution Visual Verification", () => {
  test.beforeAll(() => {
    if (!fs.existsSync(AUDIT_DIR)) {
      fs.mkdirSync(AUDIT_DIR, { recursive: true });
    }
  });

  for (const vp of VIEWPORTS) {
    test(`audits visual layout at ${vp.id} [${vp.name}]`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Helper function to assert no horizontal overflow
      const assertNoOverflow = async (pageName: string) => {
        const overflowData = await page.evaluate(() => {
          const docEl = document.documentElement;
          const scrollW = docEl.scrollWidth;
          const clientW = docEl.clientWidth;
          const innerW = window.innerWidth;
          
          if (scrollW > innerW + 1) {
            // Find offending elements
            const badElements: { tag: string; cls: string; right: number }[] = [];
            document.querySelectorAll("*").forEach((el) => {
              const rect = el.getBoundingClientRect();
              if (rect.right > innerW + 1) {
                badElements.push({
                  tag: el.tagName,
                  cls: (el.className || "").toString().slice(0, 80),
                  right: Math.round(rect.right),
                });
              }
            });
            return { scrollW, innerW, badElements: badElements.slice(0, 5) };
          }
          return null;
        });

        if (overflowData) {
          throw new Error(
            `Horizontal overflow on ${pageName} at ${vp.width}px! scrollWidth: ${overflowData.scrollW}px vs window: ${overflowData.innerW}px. Offending: ${JSON.stringify(overflowData.badElements)}`
          );
        }
      };

      // 1. Landing Page / Homepage
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await assertNoOverflow("Landing Page");
      await page.screenshot({
        path: `${AUDIT_DIR}/01_home_${vp.id}_light.png`,
        fullPage: false,
      });

      // 2. Marketplace Catalogue (Light theme)
      await page.goto("/assets");
      await page.waitForLoadState("networkidle");
      await assertNoOverflow("Assets Catalogue (Light)");
      await page.screenshot({
        path: `${AUDIT_DIR}/02_assets_${vp.id}_light.png`,
        fullPage: false,
      });

      // 3. Dark Theme Toggle on Catalogue
      const themeBtn = page.getByRole("button", { name: /theme/i }).first();
      if (await themeBtn.isVisible()) {
        await themeBtn.click();
        await page.waitForTimeout(200);
        await assertNoOverflow("Assets Catalogue (Dark)");
        await page.screenshot({
          path: `${AUDIT_DIR}/03_assets_${vp.id}_dark.png`,
          fullPage: false,
        });

        // Switch back to light for consistent baseline
        await themeBtn.click();
        await page.waitForTimeout(100);
      }

      // 4. Buyer Demand Directory
      await page.goto("/buyers");
      await page.waitForLoadState("networkidle");
      await assertNoOverflow("Buyer Directory");
      await page.screenshot({
        path: `${AUDIT_DIR}/04_buyers_${vp.id}_light.png`,
        fullPage: false,
      });

      // 5. Manager Admin Console (One-click Login)
      await page.goto("/login");
      const managerDemo = page.getByRole("button", { name: /Manager/i });
      if (await managerDemo.isVisible()) {
        await managerDemo.click();
        await page.waitForURL(/\/admin/);
        await page.waitForLoadState("networkidle");
        await assertNoOverflow("Admin Console");
        await page.screenshot({
          path: `${AUDIT_DIR}/05_admin_${vp.id}_light.png`,
          fullPage: false,
        });
      }
    });
  }
});
