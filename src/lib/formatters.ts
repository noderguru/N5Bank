import type { LicenseType, PriceMode } from "@prisma/client";

export function formatCurrency(
  amount: number | string | null | undefined,
  currency = "USD",
  locale = "en-US"
): string {
  if (amount === null || amount === undefined || amount === "") {
    return "Price on request";
  }

  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return "Price on request";
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `${currency.toUpperCase()} ${num.toLocaleString(locale)}`;
  }
}

export function formatPrice(
  amount: number | string | null | undefined,
  mode: PriceMode = "FIXED",
  currency = "USD",
  locale = "en-US"
): string {
  switch (mode) {
    case "ON_LOI":
      return "Upon LOI";
    case "NDA":
      return "Under NDA";
    case "FIXED":
    default:
      return formatCurrency(amount, currency, locale);
  }
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
  locale = "en-US"
): string {
  if (!min && !max) return "Flexible ticket";
  if (min && max) {
    const formattedMin = formatCurrency(min, currency, locale);
    const formattedMax = formatCurrency(max, currency, locale);
    return `${formattedMin} – ${formattedMax}`;
  }
  if (min) return `From ${formatCurrency(min, currency, locale)}`;
  return `Up to ${formatCurrency(max, currency, locale)}`;
}
