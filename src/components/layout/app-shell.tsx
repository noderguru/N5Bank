import type { ReactNode } from "react";
import type { UserRole } from "@prisma/client";
import { PillNav } from "./pill-nav";
import { Footer } from "./footer";

export type AppShellProps = {
  children?: ReactNode;
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
      {/* Accessible Skip Link for Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-xl focus:shadow-floating focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand font-medium text-xs"
      >
        Skip to main content
      </a>

      {/* Floating Pill Nav */}
      <PillNav user={user} unreadCount={unreadCount} />

      {/* Main Content Area */}
      <main id="main-content" tabIndex={-1} className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12 outline-none">
        {children}
      </main>

      {/* Footer */}
      {!hideFooter && <Footer />}
    </div>
  );
}
