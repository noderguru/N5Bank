import { z } from "zod";

const baseAssetSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title cannot exceed 120 characters"),
  summary: z
    .string({ required_error: "Summary is required" })
    .trim()
    .min(10, "Summary must be at least 10 characters")
    .max(300, "Summary cannot exceed 300 characters"),
  description: z
    .string({ required_error: "Description is required" })
    .trim()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description cannot exceed 5000 characters"),
  country: z
    .string({ required_error: "Country is required" })
    .trim()
    .min(2, "Country is required"),
  licenseType: z.enum(
    [
      "BANKING",
      "E_MONEY",
      "PAYMENT",
      "CRYPTO",
      "BROKERAGE",
      "INSURANCE",
      "OTHER",
    ],
    {
      errorMap: () => ({ message: "Please select a valid license type" }),
    }
  ),
  businessType: z.enum(
    [
      "BANK",
      "FINTECH",
      "PAYMENT_INSTITUTION",
      "CRYPTO_BUSINESS",
      "BROKERAGE",
      "INSURANCE_COMPANY",
      "OTHER",
    ],
    {
      errorMap: () => ({ message: "Please select a valid business type" }),
    }
  ),
  businessStatus: z.enum(
    ["OPERATING", "PRE_LAUNCH", "DORMANT", "DISTRESSED"],
    {
      errorMap: () => ({ message: "Please select a valid operational status" }),
    }
  ),
  yearOfIssue: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? null : Number(val),
    z
      .number({ invalid_type_error: "Year must be a number" })
      .int("Year must be an integer")
      .min(1800, "Year must be 1800 or later")
      .max(new Date().getFullYear() + 1, "Year cannot be in the future")
      .nullable()
      .optional()
  ),
  employees: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? null : Number(val),
    z
      .number({ invalid_type_error: "Employees must be a number" })
      .int("Employees must be an integer")
      .min(0, "Employees cannot be negative")
      .nullable()
      .optional()
  ),
  regulator: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined
        ? null
        : String(val).trim(),
    z.string().nullable().optional()
  ),
  features: z.preprocess((val) => {
    if (Array.isArray(val)) {
      return val.map((item) => String(item).trim()).filter(Boolean);
    }
    if (typeof val === "string") {
      return val
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  }, z.array(z.string().min(1)).default([])),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export const fixedAssetSchema = baseAssetSchema.extend({
  priceMode: z.literal("FIXED"),
  askingPrice: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? undefined : Number(val),
    z
      .number({
        required_error: "Asking price is required for FIXED price mode",
        invalid_type_error: "Asking price must be a valid number",
      })
      .positive("Asking price must be greater than 0")
  ),
  currency: z
    .string()
    .trim()
    .min(3, "Currency must be 3 letters (e.g. USD)")
    .max(3, "Currency must be 3 letters (e.g. USD)")
    .toUpperCase()
    .default("USD"),
});

export const onLoiAssetSchema = baseAssetSchema.extend({
  priceMode: z.literal("ON_LOI"),
  askingPrice: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? null : val,
    z.null({
      invalid_type_error:
        "Asking price must not be specified when price mode is ON_LOI",
    })
  ),
  currency: z
    .string()
    .trim()
    .default("USD"),
});

export const ndaAssetSchema = baseAssetSchema.extend({
  priceMode: z.literal("NDA"),
  askingPrice: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? null : val,
    z.null({
      invalid_type_error:
        "Asking price must not be specified when price mode is NDA",
    })
  ),
  currency: z
    .string()
    .trim()
    .default("USD"),
});

export const assetFormSchema = z.discriminatedUnion("priceMode", [
  fixedAssetSchema,
  onLoiAssetSchema,
  ndaAssetSchema,
]);

export type FixedAssetInput = z.infer<typeof fixedAssetSchema>;
export type OnLoiAssetInput = z.infer<typeof onLoiAssetSchema>;
export type NdaAssetInput = z.infer<typeof ndaAssetSchema>;
export type AssetFormInput = z.infer<typeof assetFormSchema>;
