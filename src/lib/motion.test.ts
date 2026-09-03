import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

describe("Motion and Reduced Motion Specifications (N5B-41, N5B-97)", () => {
  const globalsCssPath = path.join(process.cwd(), "src/app/globals.css");
  const globalsCss = fs.readFileSync(globalsCssPath, "utf-8");

  it("contains strict prefers-reduced-motion reset for instantaneous state transitions", () => {
    expect(globalsCss).toContain("@media (prefers-reduced-motion: reduce)");
    expect(globalsCss).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
    expect(globalsCss).toMatch(/transition-duration:\s*0\.01ms\s*!important/);
    expect(globalsCss).toMatch(/scroll-behavior:\s*auto\s*!important/);
  });

  it("defines standard easing curves conforming to emil-design-eng and animate skills", () => {
    expect(globalsCss).toContain("--ease-out: cubic-bezier(0.23, 1, 0.32, 1);");
    expect(globalsCss).toContain("--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);");
    expect(globalsCss).toContain("--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);");
  });

  it("ensures no forbidden properties (width, height, top, left, bottom, right) are animated in global styles", () => {
    const forbiddenTransitions = [
      "transition: width",
      "transition: height",
      "transition: top",
      "transition: left",
      "transition: margin",
      "transition: padding",
    ];
    for (const forbidden of forbiddenTransitions) {
      expect(globalsCss).not.toContain(forbidden);
    }
  });
});
