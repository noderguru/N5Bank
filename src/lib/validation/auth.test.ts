import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth";

describe("auth validation schemas", () => {
  describe("loginSchema", () => {
    it("validates correct login credentials", () => {
      const result = loginSchema.safeParse({
        email: "buyer@demo",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email addresses", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toBeDefined();
      }
    });

    it("rejects empty password", () => {
      const result = loginSchema.safeParse({
        email: "valid@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toBeDefined();
      }
    });
  });

  describe("registerSchema", () => {
    it("accepts valid buyer registration input", () => {
      const result = registerSchema.safeParse({
        name: "Alex Morgan",
        email: "alex@example.com",
        password: "secretpassword",
        role: "BUYER",
        company: "Northstar Capital",
        country: "United Kingdom",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid seller registration input", () => {
      const result = registerSchema.safeParse({
        name: "Olivia Hart",
        email: "olivia@example.com",
        password: "secretpassword",
        role: "SELLER",
        company: "Hart Financial",
        country: "Germany",
      });
      expect(result.success).toBe(true);
    });

    it("rejects passwords under 6 characters", () => {
      const result = registerSchema.safeParse({
        name: "Alex Morgan",
        email: "alex@example.com",
        password: "123",
        role: "BUYER",
        company: "Northstar Capital",
        country: "United Kingdom",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toBeDefined();
      }
    });

    it("rejects invalid role selection", () => {
      const result = registerSchema.safeParse({
        name: "Alex Morgan",
        email: "alex@example.com",
        password: "secretpassword",
        role: "MANAGER", // registration is only for BUYER or SELLER
        company: "Northstar Capital",
        country: "United Kingdom",
      });
      expect(result.success).toBe(false);
    });
  });
});
