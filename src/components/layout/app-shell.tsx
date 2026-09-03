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
  /** Drops the reading container so a page can run bands edge to edge. */
  fullBleed?: boolean;
};

export function AppShell({
  children,
  user,
  unreadCount = 0,
  hideFooter = false,
  fullBleed = false,
}: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink font-sans">
      {/* Accessible Skip Link for Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-ink focus:text-canvas focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink caps"
      >
        Skip to main content
      </a>

      {/* Floating Pill Nav */}
      <PillNav user={user} unreadCount={unreadCount} overlay={fullBleed} />

      {/* Main Content Area */}
      <main
        id="main-content"
        tabIndex={-1}
        className={
          fullBleed
            ? "flex-1 w-full outline-none"
            : "flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16 outline-none"
        }
      >
        {children}
      </main>

      {/* Footer */}
      {!hideFooter && <Footer />}
    </div>
  );
}
