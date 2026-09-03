import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";

import messages from "../../messages/en.json";

/**
 * Renders a component inside the i18n provider the app always supplies.
 *
 * Components call `useTranslations` directly, which throws without a provider.
 * Tests must therefore render through the same context the app does — a
 * missing key should fail the test, not silently fall back to English.
 */
export function renderWithIntl(element: React.ReactElement): string {
  return renderToStaticMarkup(
    React.createElement(
      NextIntlClientProvider as React.ComponentType<{
        locale: string;
        messages: unknown;
        children?: React.ReactNode;
      }>,
      { locale: "en", messages },
      element
    )
  );
}
