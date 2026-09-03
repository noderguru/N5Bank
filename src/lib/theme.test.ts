import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";

describe("Dark Theme Tokens & Controls (N5B-52)", () => {
  it("defines comprehensive dark scheme tokens in globals.css", () => {
    const cssPath = path.join(process.cwd(), "src/app/globals.css");
    const css = fs.readFileSync(cssPath, "utf8");

    expect(css).toContain(".dark {");
    expect(css).toContain("--canvas: #090a0f;");
    expect(css).toContain("--surface: #12141c;");
    expect(css).toContain("--ink: #f3f5f8;");
    expect(css).toContain("--muted-ink: #939ba8;");
    expect(css).toContain("--brand: #4e52fe;");
    expect(css).toContain("--hairline: #262c3d;");
  });

  it("renders ThemeSwitcher with accessible aria-label", () => {
    const html = renderToStaticMarkup(React.createElement(ThemeSwitcher));
    expect(html).toContain('aria-label="Toggle theme"');
  });

  it("ensures layout includes inline script preventing dark mode FOUC", () => {
    const layoutPath = path.join(process.cwd(), "src/app/[locale]/layout.tsx");
    const layout = fs.readFileSync(layoutPath, "utf8");

    expect(layout).toContain("suppressHydrationWarning");
    expect(layout).toContain("localStorage.getItem('theme')");
    expect(layout).toContain("document.documentElement.classList.add('dark')");
  });
});
