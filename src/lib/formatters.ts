import type { LicenseType, PriceMode } from "@prisma/client";

/**
 * Words the formatters need but cannot translate themselves — they are plain
 * functions with no access to the request's locale. Callers that live inside
 * the i18n context pass translated labels; the English defaults keep the
 * formatters usable from tests and scripts.
 */
export type PriceLabels = {
  onRequest: string;
  uponLoi: string;
  underNda: string;
};

export type TicketLabels = {
  flexible: string;
  from: (amount: string) => string;
  upTo: (amount: string) => string;
};

const EN_PRICE: PriceLabels = {
  onRequest: "Price on request",
  uponLoi: "Upon LOI",
  underNda: "Under NDA",
};

const EN_TICKET: TicketLabels = {
  flexible: "Flexible ticket",
  from: (amount) => `From ${amount}`,
  upTo: (amount) => `Up to ${amount}`,
};

export function formatCurrency(
  amount: number | string | null | undefined,
  currency = "USD",
  locale = "en-US",
  labels: PriceLabels = EN_PRICE
): string {
  if (amount === null || amount === undefined || amount === "") {
    return labels.onRequest;
  }

  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return labels.onRequest;
  }

  const cleanCurrency = currency?.toUpperCase() || "USD";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: cleanCurrency,
      currencyDisplay: "code",
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `${cleanCurrency} ${num.toLocaleString(locale)}`;
  }
}

export function formatPrice(
  amount: number | string | null | undefined,
  mode: PriceMode = "FIXED",
  currency = "USD",
  locale = "en-US",
  labels: PriceLabels = EN_PRICE
): string {
  switch (mode) {
    case "ON_LOI":
      return labels.uponLoi;
    case "NDA":
      return labels.underNda;
    case "FIXED":
    default:
      return formatCurrency(amount, currency, locale, labels);
  }
}

export function formatNumber(
  value: number | string | null | undefined,
  locale = "en-US",
  options?: Intl.NumberFormatOptions
): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";

  return new Intl.NumberFormat(locale, options).format(num);
}

export function formatDate(
  date: Date | string | number | null | undefined,
  locale = "en-US",
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "—";
  const d = typeof date === "object" && date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(d);
}

export function formatDateTime(
  date: Date | string | number | null | undefined,
  locale = "en-US",
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "—";
  const d = typeof date === "object" && date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(d);
}

export function formatEnum(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatLicenseType(type: LicenseType | string): string {
  switch (type) {
    case "E_MONEY":
      return "E-Money / EMI";
    case "BANKING":
      return "Banking";
    case "PAYMENT":
      return "Payment (PI)";
    case "CRYPTO":
      return "Crypto / VASP";
    case "BROKERAGE":
      return "Brokerage";
    case "INSURANCE":
      return "Insurance";
    case "OTHER":
    default:
      return formatEnum(type);
  }
}

export function formatTicketRange(
  min: number | string | null | undefined,
  max: number | string | null | undefined,
  currency = "USD",
  locale = "en-US",
  labels: TicketLabels = EN_TICKET
): string {
  if (!min && !max) return labels.flexible;
  if (min && max) {
    const formattedMin = formatCurrency(min, currency, locale);
    const formattedMax = formatCurrency(max, currency, locale);
    return `${formattedMin} – ${formattedMax}`;
  }
  if (min) return labels.from(formatCurrency(min, currency, locale));
  return labels.upTo(formatCurrency(max, currency, locale));
}
