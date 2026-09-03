import type { ReactNode } from "react";
import type { UserRole } from "@prisma/client";
import { PillNav } from "./pill-nav";
import { Footer } from "./footer";

export type AppShellProps = {
  children: ReactNode;
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name?: string | null;
  } | null;
  unreadCount?: number;
  hideFooter?: boolean;
};

export function AppShell({
  children,
  user,
  unreadCount = 0,
  hideFooter = false,
}: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink font-sans selection:bg-brand/20 selection:text-brand">
      {/* Floating Pill Nav */}
      <PillNav user={user} unreadCount={unreadCount} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12">
        {children}
      </main>

      {/* Footer */}
      {!hideFooter && <Footer />}
    </div>
  );
}
