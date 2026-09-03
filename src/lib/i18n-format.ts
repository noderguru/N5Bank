"use client";

import { useLocale, useTranslations } from "next-intl";

import type { PriceLabels, TicketLabels } from "./formatters";

/**
 * The locale plus the words the pure formatters cannot translate themselves.
 * Client components pass these into `formatPrice` / `formatTicketRange`;
 * server components build the same shape from `getTranslations`.
 */
export function useFormatLabels() {
  const locale = useLocale();
  const t = useTranslations("common");

  const price: PriceLabels = {
    onRequest: t("priceOnRequest"),
    uponLoi: t("uponLoi"),
    underNda: t("underNda"),
  };

  const ticket: TicketLabels = {
    flexible: t("flexibleTicket"),
    from: (amount) => t("from", { amount }),
    upTo: (amount) => t("upTo", { amount }),
  };

  return { locale, price, ticket };
}

/** Translated label for a Prisma enum value, e.g. `licenseType`/`E_MONEY`. */
export function useEnumLabel() {
  const t = useTranslations("enums");
  return (group: string, value: string | null | undefined) =>
    value ? t(`${group}.${value}`) : "";
}
