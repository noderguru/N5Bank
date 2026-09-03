import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in — N5Deal Marketplace",
  description: "Sign in or use 1-click demo accounts on N5Deal M&A financial asset marketplace.",
};

type PageProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-8 bg-canvas">
      <LoginForm returnTo={params.returnTo} />
    </main>
  );
}
