"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { PixelArrow } from "./candlestick";
import { LocaleSwitcher } from "./locale-switcher";
import type { UserRole } from "@prisma/client";

interface SideNavProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name?: string | null;
  } | null;
}

export function SideNav({ isOpen, onClose, user }: SideNavProps) {
    const tNav = useTranslations("nav");

  // Lock body scroll when side nav is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const navLinks = [
    { href: "/", label: tNav("home") },
    { href: "/assets", label: tNav("assets") },
    { href: "/buyers", label: tNav("buyerDemand") },
    { href: "/inbox", label: tNav("inbox") },
  ];

  if (user?.role === "BUYER") {
    navLinks.push({ href: "/buyer", label: tNav("buyerPortal") });
    navLinks.push({ href: "/buyer/matches", label: tNav("myMatches") });
  } else if (user?.role === "SELLER") {
    navLinks.push({ href: "/seller", label: tNav("sellerPortal") });
    navLinks.push({ href: "/seller/assets/new", label: tNav("listAsset") });
  } else if (user?.role === "MANAGER") {
    navLinks.push({ href: "/admin", label: tNav("adminPortal") });
    navLinks.push({ href: "/admin/moderation", label: tNav("moderation") });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site Navigation"
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto paper-dark text-[#fafffa] animate-in fade-in duration-300"
    >
      

      {/* Top Header inside overlay */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-8 sm:px-10">
        <Link
          href="/"
          onClick={onClose}
          className="group flex items-baseline gap-2 text-2xl font-bold tracking-tight text-[#fafffa] font-lausanne"
        >
          <span className="relative">
            N5
            <span className="absolute -bottom-1 left-0 h-[2.5px] w-full bg-[#2bee4b]" />
          </span>
          <span className="font-serif italic font-normal text-xl text-[#c8d2c8]">DEAL</span>
        </Link>

        <button
          onClick={onClose}
          className="group flex items-center gap-3 text-xs font-lausanne uppercase tracking-widest text-[#fafffa] hover:text-[#2bee4b] transition-colors"
          aria-label={tNav("close")}
        >
          <span>{tNav("close")}</span>
          <div className="flex size-8 items-center justify-center rounded-full border border-[#232924] bg-[#121613] group-hover:border-[#2bee4b]">
            <X className="size-4 text-[#fafffa] group-hover:text-[#2bee4b]" />
          </div>
        </button>
      </div>

      {/* Main oversized broadsheet navigation links */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 py-12 sm:px-10">
        <nav className="flex flex-col gap-4 sm:gap-6">
          {navLinks.map((item, idx) => {
            
            return (
              <div key={item.href} className="group relative flex items-center">
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="flex items-baseline gap-4 font-lausanne text-5xl sm:text-7xl lg:text-8xl font-bold uppercase tracking-tight text-[#fafffa] transition-all duration-300 group-hover:text-[#2bee4b] group-hover:translate-x-3"
                >
                  <span className="text-sm sm:text-base text-[#516254] font-mono select-none">
                    0{idx + 1}
                  </span>
                  <span>{item.label}</span>
                </Link>
                {/* Blinking green marker on hover */}
                <span className="ml-4 hidden h-[12px] w-[40px] bg-[#2bee4b] blinky-cursor group-hover:inline-block" />
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom info & contact drawer */}
      <div className="relative z-10 border-t border-[#232924] bg-[#121613]/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div className="space-y-1">
            <span className="font-lausanne text-[11px] uppercase tracking-widest text-[#516254]">
              {tNav("bilateralEnquiries")}
            </span>
            <div>
              <a
                href="mailto:deals@n5deal.com"
                className="group inline-flex items-center gap-2 font-lausanne text-lg font-medium text-[#fafffa] hover:text-[#2bee4b] transition-colors"
              >
                <span>deals@n5deal.com</span>
                <PixelArrow className="text-[#2bee4b] transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#c8d2c8] font-lausanne">
            <div className="flex items-center gap-2">
              <LocaleSwitcher />
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-[#516254]">{tNav("loggedInAs", { email: user.email })}</span>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="text-[#2bee4b] uppercase tracking-wider hover:underline"
                >
                  {tNav("account")}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="uppercase tracking-wider hover:text-white"
                >
                  {tNav("signIn")}
                </Link>
                <Link
                  href="/register"
                  onClick={onClose}
                  className="btn-highlighter !py-2 !px-4 text-[10px]"
                >
                  {tNav("register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
