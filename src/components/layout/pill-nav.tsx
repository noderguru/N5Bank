"use client";

import { Link } from "@/i18n/routing";
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
  /** Lays the bar over a dark hero band instead of sitting on the canvas. */
  overlay?: boolean;
};

export function PillNav({ user, unreadCount = 0, overlay = false }: PillNavProps) {
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
  const tNav = useTranslations("nav");

  return (
    <header
      className={cn(
        "z-40 w-full",
        overlay
          // `dark` flips the tokens for the subtree, so the bar reads white
          // over the night band without hardcoding a single hex.
          ? "dark absolute inset-x-0 top-0 bg-transparent"
          : "sticky top-0 border-b border-hairline bg-canvas/85 backdrop-blur-md"
      )}
    >
      <nav
        aria-label={tNav("mainNavigation")}
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
          >
            <div className="flex size-7 items-center justify-center bg-ink text-canvas font-bold text-[13px] tracking-tight">
              N5
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-base font-bold uppercase tracking-[0.06em] text-ink">
                Deal
              </span>
              <span className="hidden sm:inline-block eyebrow text-muted-foreground">
                Marketplace
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-1 lg:flex">
          {items.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-2 eyebrow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
                  "after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-200 hover:after:scale-x-100",
                  isActive ? "text-ink after:scale-x-100" : "text-muted-foreground hover:text-ink"
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
                  "hidden sm:inline-flex h-9 rounded-full border px-4 caps transition-colors focus-visible:ring-2 focus-visible:ring-ink",
                  cta.variant === "outline"
                    ? "border-ink bg-transparent text-ink hover:bg-ink hover:text-canvas"
                    : "border-ink bg-ink text-canvas hover:bg-transparent hover:text-ink"
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
                      <span>{tNav("workspaceDashboard")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg text-xs font-medium cursor-pointer">
                    <Link href="/inbox">
                      <User className="mr-2 size-3.5 text-muted-foreground" />
                      <span>{tNav("inboxDeals")}</span>
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
                    <span>{tNav("signOut")}</span>
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
                  className="hidden sm:inline-flex h-9 rounded-full px-3 caps text-muted-foreground hover:text-ink focus-visible:ring-2 focus-visible:ring-ink"
                >
                  <Link href={secondaryCta.href} prefetch={false}>{secondaryCta.label}</Link>
                </Button>
              )}
              <Button
                asChild
                size="sm"
                className="h-9 rounded-full border border-ink bg-ink px-4 caps text-canvas transition-colors hover:bg-transparent hover:text-ink focus-visible:ring-2 focus-visible:ring-ink"
              >
                <Link href={cta.href} prefetch={false}>{cta.label}</Link>
              </Button>
            </div>
          )}

          {/* Mobile Sheet Trigger */}
          <div className="flex lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-9 rounded-none p-0 text-ink hover:bg-tint focus-visible:ring-2 focus-visible:ring-ink"
                  aria-label={tNav("openMobileNav")}
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="rounded-b-3xl border-b border-hairline bg-surface/98 p-6 shadow-floating">
                <SheetHeader className="flex flex-row items-center justify-between pb-4 border-b border-hairline">
                  <SheetTitle className="font-heading text-base font-bold uppercase tracking-[0.06em] text-ink">{tNav("navigation")}</SheetTitle>
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
                    <span>{tNav("language")}</span>
                    <LocaleSwitcher />
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground border-t border-hairline/60">
                    <span>{tNav("theme")}</span>
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
