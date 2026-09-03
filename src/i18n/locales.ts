/**
 * The one place the supported locales are declared.
 *
 * Deliberately dependency-free: the middleware imports this, and pulling in
 * `routing.ts` there would drag `next/navigation` into the edge bundle.
 */
export const LOCALES = ["en", "uk", "ru"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
