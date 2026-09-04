"use client";

import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { UserRole } from "@prisma/client";
import {
  Briefcase,
  ChevronDown,
  LogOut,
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
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeSwitcher } from "./theme-switcher";
import { Candlestick } from "./candlestick";
import { SideNav } from "./side-nav";
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
  overlay?: boolean;
};

export function PillNav({ user, unreadCount = 0 }: PillNavProps) {
  const pathname = usePathname() || "";
  const [sideNavOpen, setSideNavOpen] = useState(false);

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
    <>
      <header
        className="sticky top-0 z-40 w-full border-b border-hairline bg-canvas/90 backdrop-blur-md transition-colors"
      >
        <nav
          aria-label={tNav("mainNavigation")}
          className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6"
        >
          {/* Brand Logo with 2px Highlighter Green marker */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-baseline gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2bee4b]"
            >
              <div className="relative font-lausanne text-xl font-bold tracking-tight text-ink">
                N5
                <span className="absolute -bottom-0.5 left-0 h-[2px] w-full bg-[#2bee4b]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-editorial text-xl italic font-light tracking-wide text-ink">
                  Deal
                </span>
                <span className="hidden sm:inline-block font-lausanne text-[10px] uppercase tracking-widest text-muted-ink border-l border-hairline pl-2">
                  {tNav("marketplaceSection")}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-1 xl:flex">
            {items.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-2 font-lausanne text-[11px] uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2bee4b]",
                    "after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-200 hover:after:scale-x-100",
                    isActive ? "text-ink after:scale-x-100 font-semibold" : "text-muted-ink hover:text-ink"
                  )}
                >
                  <span>{item.label}</span>
                  {typeof item.badge === "number" && item.badge > 0 && (
                    <Badge
                      variant="default"
                      className="size-4 rounded-full bg-[#2bee4b] p-0 text-[10px] font-bold text-black flex items-center justify-center"
                    >
                      {item.badge > 9 ? "9+" : item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Section: Locale, Theme, CTA, User profile or Sign in, and Candlestick Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
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
                    "hidden sm:inline-flex h-9 rounded-[5px] border px-4 font-lausanne text-[11px] uppercase tracking-wider transition-all focus-visible:ring-2 focus-visible:ring-[#2bee4b]",
                    cta.variant === "outline"
                      ? "border-ink bg-transparent text-ink hover:bg-ink hover:text-canvas"
                      : "border-none bg-[#2bee4b] text-black hover:bg-[#25d943] shadow-[1px_8px_20px_rgba(16,94,29,0.35)]"
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
                      className="flex h-9 items-center gap-2 rounded-[5px] border border-hairline bg-surface px-2.5 hover:bg-canvas focus-visible:ring-2 focus-visible:ring-[#2bee4b]"
                      aria-label={`User profile menu (${user.role})`}
                    >
                      <div className="flex size-6 items-center justify-center rounded-sm bg-[#2bee4b] text-black text-xs font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden max-w-[100px] truncate text-xs font-medium text-ink sm:inline-block font-lausanne">
                        {user.name || user.email.split("@")[0]}
                      </span>
                      <ChevronDown className="size-3 text-muted-ink" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-lg border-hairline p-1.5 shadow-floating bg-surface">
                    <DropdownMenuLabel className="px-2 py-1.5">
                      <div className="text-xs font-bold text-ink truncate font-lausanne">{user.name || user.email}</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-ink pt-0.5 font-mono">
                        <span className="rounded bg-tint px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink border border-hairline">
                          {user.role}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1 bg-hairline" />
                    <DropdownMenuItem asChild className="rounded text-xs font-medium cursor-pointer font-lausanne">
                      <Link href={user.role === "SELLER" ? "/seller/assets" : user.role === "BUYER" ? "/buyer" : "/admin"}>
                        <Briefcase className="mr-2 size-3.5 text-muted-ink" />
                        <span>{tNav("workspaceDashboard")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded text-xs font-medium cursor-pointer font-lausanne">
                      <Link href="/inbox">
                        <User className="mr-2 size-3.5 text-muted-ink" />
                        <span>{tNav("inboxDeals")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 bg-hairline" />
                    <DropdownMenuItem
                      onClick={async () => {
                        await logoutAction();
                      }}
                      className="rounded text-xs font-medium text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer font-lausanne"
                    >
                      <LogOut className="mr-2 size-3.5" />
                      <span>{tNav("signOut")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              /* Guest actions */
              <div className="flex items-center gap-2">
                {secondaryCta && (
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="hidden sm:inline-flex h-9 rounded-[5px] px-3 font-lausanne text-[11px] uppercase tracking-wider text-muted-ink hover:text-ink focus-visible:ring-2 focus-visible:ring-[#2bee4b]"
                  >
                    <Link href={secondaryCta.href} prefetch={false}>
                      {secondaryCta.label}
                    </Link>
                  </Button>
                )}
                <Button
                  asChild
                  size="sm"
                  className="h-9 rounded-[5px] bg-[#2bee4b] px-4 font-lausanne text-[11px] font-semibold uppercase tracking-wider text-black shadow-[1px_8px_20px_rgba(16,94,29,0.35)] transition-all hover:bg-[#25d943] hover:shadow-[1px_12px_24px_rgba(16,94,29,0.45)] focus-visible:ring-2 focus-visible:ring-[#2bee4b]"
                >
                  <Link href={cta.href} prefetch={false}>
                    {cta.label}
                  </Link>
                </Button>
              </div>
            )}

            {/* Candlestick Menu Button for Full-Screen Editorial Navigation */}
            <button
              type="button"
              onClick={() => setSideNavOpen(true)}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-canvas/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2bee4b]"
              aria-label={tNav("openMobileNav")}
            >
              <span className="hidden sm:inline font-lausanne text-[11px] font-semibold uppercase tracking-widest text-ink">
                {tNav("menu")}
              </span>
              <Candlestick active={sideNavOpen} />
            </button>
          </div>
        </nav>
      </header>

      {/* Full-screen editorial overlay drawer from newformcap */}
      <SideNav
        isOpen={sideNavOpen}
        onClose={() => setSideNavOpen(false)}
        user={user}
      />
    </>
  );
}
