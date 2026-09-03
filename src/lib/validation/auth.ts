import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .refine((val) => /^[^\s@]+@[^\s@]+$/.test(val), {
      message: "Please enter a valid email address",
    }),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["BUYER", "SELLER"], {
    errorMap: () => ({ message: "Please select either Buyer or Seller" }),
  }),
  company: z.string().trim().min(2, "Company name is required"),
  country: z.string().trim().min(2, "Country is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
