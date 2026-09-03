import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

import { DEFAULT_LOCALE, LOCALES } from "./locales";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
});

export { LOCALES, DEFAULT_LOCALE } from "./locales";
export type { Locale } from "./locales";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
