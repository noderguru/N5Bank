import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register — N5Deal Marketplace",
  description: "Create an account on N5Deal M&A financial asset marketplace as Buyer or Seller.",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-8 bg-canvas">
      <RegisterForm />
    </main>
  );
}
