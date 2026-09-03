import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // next-intl's navigation helpers import "next/navigation" without an
      // extension, which Vite cannot resolve from Next's ESM package.
      "next/navigation": path.resolve(__dirname, "./node_modules/next/navigation.js"),
    },
  },
  esbuild: {
    jsx: "automatic",
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["tests/**", "node_modules/**"],
    server: {
      // next-intl must go through Vite so the "next/navigation" alias above
      // applies; externalised deps bypass resolve.alias entirely.
      deps: { inline: ["next-intl"] },
    },
  },
});
