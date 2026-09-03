"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  return (
    <footer className="mt-24 border-t border-[#3a3a3f] bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand & Intro */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center bg-white text-black font-bold text-[11px]">
                N5
              </div>
              <span className="font-heading text-base font-bold uppercase tracking-[0.06em] text-white">N5Deal</span>
              <span className="border border-[#3a3a3f] px-2 py-0.5 eyebrow text-[#9a9aa2]">
                M&A Platform
              </span>
            </div>

            <p className="max-w-md text-xs leading-relaxed text-[#9a9aa2]">
              Curated introduction platform for financial licenses, operational payment institutions, and regulated fintech entities across Europe, the Americas, and Asia.
            </p>

            <div className="flex items-center gap-1.5 pt-1 text-xs text-[#9a9aa2]">
              <ShieldCheck className="size-4 text-white" />
              <span>Strict bilateral NDAs & LOI escrow coordination</span>
            </div>
          </div>

          {/* Directory Links */}
          <div className="space-y-3">
            <h4 className="eyebrow text-white">Marketplace</h4>
            <ul className="space-y-2 text-xs text-[#9a9aa2]">
              <li>
                <Link href="/assets?license=E_MONEY" className="transition-colors hover:text-white">
                  EMI & Payment Licences
                </Link>
              </li>
              <li>
                <Link href="/assets?license=BANKING" className="transition-colors hover:text-white">
                  Banking & Credit Institutions
                </Link>
              </li>
              <li>
                <Link href="/assets?license=CRYPTO" className="transition-colors hover:text-white">
                  Crypto & VASP Entities
                </Link>
              </li>
              <li>
                <Link href="/buyers" className="transition-colors hover:text-white">
                  Institutional Buyer Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Regulatory & Legal */}
          <div className="space-y-3">
            <h4 className="eyebrow text-white">Compliance</h4>
            <ul className="space-y-2 text-xs text-[#9a9aa2]">
              <li>
                <Link href="/#faq" className="transition-colors hover:text-white">
                  Verification Standards
                </Link>
              </li>
              <li>
                <Link href="/#escrow" className="transition-colors hover:text-white">
                  Escrow Protocol
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-white">
                  Seller Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-white">
                  Investor Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="mt-14 space-y-3 border-t border-[#3a3a3f] pt-6 text-[11px] text-[#9a9aa2]">
          <p className="leading-relaxed">
            {t("regulatoryNotice")}
          </p>
          <div className="flex flex-col items-center justify-between gap-2 border-t border-[#3a3a3f]/60 pt-2 sm:flex-row">
            <div>{t("copyright")}</div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="transition-colors hover:text-white">{tNav("signIn")}</Link>
              <Link href="/register" className="transition-colors hover:text-white">{tNav("register")}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
