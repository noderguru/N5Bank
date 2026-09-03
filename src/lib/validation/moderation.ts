import { z } from "zod";

export const moderateUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  action: z.enum(["SUSPEND", "RESTORE", "REMOVE"]),
  reason: z
    .string()
    .trim()
    .min(5, "A justification reason of at least 5 characters is mandatory"),
});

export type ModerateUserInput = z.infer<typeof moderateUserSchema>;

export const moderateAssetSchema = z.object({
  assetId: z.string().min(1, "Asset ID is required"),
  action: z.enum(["SUSPEND", "RESTORE", "REMOVE", "VALIDATE", "REJECT"]),
  reason: z
    .string()
    .trim()
    .min(5, "A justification reason of at least 5 characters is mandatory"),
});

export type ModerateAssetInput = z.infer<typeof moderateAssetSchema>;
