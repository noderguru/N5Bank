"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { UserRole } from "@prisma/client";
import {
  Briefcase,
  ChevronDown,
  LogOut,
  Menu,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeSwitcher } from "./theme-switcher";
import { getRoleNavConfig } from "./nav-data";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

export type PillNavProps = {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name?: string | null;
  } | null;
  unreadCount?: number;
};

export function PillNav({ user, unreadCount = 0 }: PillNavProps) {
  const pathname = usePathname() || "";
  const [mobileOpen, setMobileOpen] = useState(false);

  let tFunc: ((k: string) => string) | undefined;
  try {
    const t = useTranslations();
    tFunc = (key: string) => t(key as never);
  } catch {
    tFunc = undefined;
  }

  const { items, cta, secondaryCta } = getRoleNavConfig(user?.role, unreadCount, tFunc);

  return (
    <header className="sticky top-4 z-40 mx-auto w-full max-w-6xl px-3 sm:px-6">
      <nav
        aria-label="Main Navigation"
        className="flex h-14 items-center justify-between rounded-full border border-hairline/80 bg-surface/90 px-4 py-2 shadow-floating backdrop-blur-md transition-all sm:px-5"
      >
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            <div className="flex size-7 items-center justify-center rounded-lg bg-brand text-surface font-black text-sm tracking-tighter">
              N5
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold tracking-tight text-ink">Deal</span>
              <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Marketplace
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-1 md:flex">
          {items.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  isActive
                    ? "bg-canvas text-brand font-semibold shadow-2xs"
                    : "text-muted-foreground hover:bg-canvas/60 hover:text-ink"
                )}
              >
                <span>{item.label}</span>
                {typeof item.badge === "number" && item.badge > 0 && (
                  <Badge
                    variant="default"
                    className="size-4 rounded-full bg-brand p-0 text-[10px] font-bold text-surface flex items-center justify-center"
                  >
                    {item.badge > 9 ? "9+" : item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Section: Locale, Theme, CTA, User profile or Sign in */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeSwitcher />
          <div className="hidden sm:block">
            <LocaleSwitcher />
          </div>

          {user ? (
            /* Authenticated User Menu */
            <div className="flex items-center gap-2">
              <Button
                asChild
                size="sm"
                className={cn(
                  "hidden sm:inline-flex h-8 rounded-full px-3.5 text-xs font-medium shadow-xs focus-visible:ring-2 focus-visible:ring-brand",
                  cta.variant === "outline"
                    ? "border-hairline bg-surface text-ink hover:bg-canvas"
                    : "bg-brand text-surface hover:bg-brand/90"
                )}
              >
                <Link href={cta.href}>{cta.label}</Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    data-role={user.role}
                    className="flex h-9 items-center gap-2 rounded-full border border-hairline bg-surface px-2.5 hover:bg-canvas focus-visible:ring-2 focus-visible:ring-brand"
                    aria-label={`User profile menu (${user.role})`}
                  >
                    <div className="flex size-6 items-center justify-center rounded-full bg-tint text-brand text-xs font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden max-w-[100px] truncate text-xs font-semibold text-ink sm:inline-block">
                      {user.name || user.email.split("@")[0]}
                    </span>
                    <ChevronDown className="size-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-hairline p-1.5 shadow-floating">
                  <DropdownMenuLabel className="px-2 py-1.5">
                    <div className="text-xs font-bold text-ink truncate">{user.name || user.email}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-0.5">
                      <span className="rounded-full bg-tint px-2 py-0.2 text-[10px] font-semibold uppercase tracking-wider text-brand">
                        {user.role}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 bg-hairline/60" />
                  <DropdownMenuItem asChild className="rounded-lg text-xs font-medium cursor-pointer">
                    <Link href={user.role === "SELLER" ? "/seller/assets" : user.role === "BUYER" ? "/buyer" : "/admin"}>
                      <Briefcase className="mr-2 size-3.5 text-muted-foreground" />
                      <span>Workspace Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg text-xs font-medium cursor-pointer">
                    <Link href="/inbox">
                      <User className="mr-2 size-3.5 text-muted-foreground" />
                      <span>Inbox & Deals</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 bg-hairline/60" />
                  <DropdownMenuItem
                    onClick={async () => {
                      await logoutAction();
                    }}
                    className="rounded-lg text-xs font-medium text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 size-3.5" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            /* Guest actions */
            <div className="flex items-center gap-1.5">
              {secondaryCta && (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex h-8 rounded-full px-3 text-xs font-medium text-muted-foreground hover:bg-canvas hover:text-ink focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <Link href={secondaryCta.href} prefetch={false}>{secondaryCta.label}</Link>
                </Button>
              )}
              <Button
                asChild
                size="sm"
                className="h-8 rounded-full bg-brand px-3.5 text-xs font-medium text-surface hover:bg-brand/90 shadow-xs focus-visible:ring-2 focus-visible:ring-brand"
              >
                <Link href={cta.href} prefetch={false}>{cta.label}</Link>
              </Button>
            </div>
          )}

          {/* Mobile Sheet Trigger */}
          <div className="flex md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-8 rounded-full p-0 text-ink hover:bg-canvas focus-visible:ring-2 focus-visible:ring-brand"
                  aria-label="Open mobile navigation"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="rounded-b-3xl border-b border-hairline bg-surface/98 p-6 shadow-floating">
                <SheetHeader className="flex flex-row items-center justify-between pb-4 border-b border-hairline">
                  <SheetTitle className="text-base font-bold text-ink">Navigation</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-2 py-4">
                  {items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={false}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                        pathname === item.href
                          ? "bg-canvas text-brand font-semibold"
                          : "text-ink hover:bg-canvas/50"
                      )}
                    >
                      <span>{item.label}</span>
                      {typeof item.badge === "number" && item.badge > 0 && (
                        <Badge className="bg-brand text-surface text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  ))}

                  <div className="pt-2 border-t border-hairline">
                    <Button
                      asChild
                      className="w-full h-10 rounded-xl bg-brand text-sm font-medium text-surface hover:bg-brand/90"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Link href={cta.href} prefetch={false}>{cta.label}</Link>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground">
                    <span>Language</span>
                    <LocaleSwitcher />
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground border-t border-hairline/60">
                    <span>Theme</span>
                    <ThemeSwitcher />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
