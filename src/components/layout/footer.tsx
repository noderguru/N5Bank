"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ShieldCheck, ArrowUp } from "lucide-react";
import { PixelArrow } from "./candlestick";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mt-20">
      {/* Full-Bleed Accent Band per design_2.md:
          "Edge-to-edge #2bee4b fill, used as a visual full stop between content and footer.
           Contains the wordmark N in white at the top-left. The band is the closing signature."
      */}
      <div className="relative w-full bg-[#2bee4b] py-16 px-6 sm:px-12 overflow-hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-baseline gap-4">
            <span className="font-lausanne text-6xl sm:text-8xl md:text-9xl font-extrabold text-[#121613] tracking-tighter select-none">
              N5
            </span>
            <span className="font-editorial italic text-3xl sm:text-5xl md:text-6xl text-[#121613]/80 select-none">
              Deal
            </span>
          </div>
          <div className="max-w-xs text-right hidden sm:block">
            <p className="font-lausanne text-xs font-semibold uppercase tracking-widest text-[#121613]">
              {t("sovereignInfrastructure")}
            </p>
            <p className="font-lausanne text-xs text-[#121613]/80 mt-1">
              {t("sovereignInfraDesc")}
            </p>
          </div>
        </div>
      </div>

      {/* Dark Broadsheet Footer */}
      <footer className="relative border-t border-[#232924] paper-dark text-[#fafffa] overflow-hidden">
        

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 sm:px-8">
          {/* Giant Email Headline */}
          <div className="border-b border-[#232924] pb-12 mb-16">
            <span className="font-lausanne text-[11px] uppercase tracking-widest text-[#516254] block mb-2">
              {t("confidentialDesk")}
            </span>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-6">
              <a
                href="mailto:deals@n5deal.com"
                className="group inline-flex items-baseline gap-4 font-lausanne text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#fafffa] hover:text-[#2bee4b] transition-colors"
              >
                <span>deals@n5deal.com</span>
                <PixelArrow className="text-[#2bee4b] transition-transform group-hover:translate-x-2" />
              </a>

              {/* Interactive Back to Top Blob Button */}
              <button
                type="button"
                onClick={scrollToTop}
                className="group flex items-center gap-3 self-start sm:self-auto px-5 py-3 rounded border border-[#232924] bg-[#121613] hover:border-[#2bee4b] hover:bg-[#1a201c] transition-all"
                aria-label={t("topOfPage")}
              >
                <span className="font-lausanne text-[11px] font-semibold uppercase tracking-widest text-[#fafffa] group-hover:text-[#2bee4b]">
                  {t("topOfPage")}
                </span>
                <ArrowUp className="size-4 text-[#2bee4b] transition-transform duration-300 group-hover:-translate-y-1" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand column */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-baseline gap-2">
                <span className="relative font-lausanne text-2xl font-bold tracking-tight text-[#fafffa]">
                  N5
                  <span className="absolute -bottom-0.5 left-0 h-[2px] w-full bg-[#2bee4b]" />
                </span>
                <span className="font-editorial text-2xl italic font-light text-[#c8d2c8]">
                  DEAL
                </span>
                <span className="font-lausanne text-[10px] uppercase tracking-widest text-[#c8d2c8] ml-2 border border-[#232924] bg-[#161b17] px-2 py-0.5 rounded">
                  {t("mnaPlatform")}
                </span>
              </div>

              <p className="max-w-md font-lausanne text-xs leading-relaxed text-[#c8d2c8]">
                {t("mnaPlatformDesc")}
              </p>

              <div className="flex items-center gap-2 pt-2 text-xs text-[#516254]">
                <ShieldCheck className="size-4 text-[#2bee4b]" />
                <span className="font-lausanne">{t("ndaNotice")}</span>
              </div>
            </div>

            {/* Marketplace Directory */}
            <div className="space-y-3">
              <h4 className="font-lausanne text-[11px] font-semibold uppercase tracking-widest text-[#fafffa]">
                {tNav("marketplaceSection")}
              </h4>
              <ul className="space-y-2.5 font-lausanne text-xs text-[#c8d2c8]">
                <li>
                  <Link href="/assets?license=E_MONEY" className="hover:text-[#2bee4b] transition-colors">
                    {t("emiPaymentLink")}
                  </Link>
                </li>
                <li>
                  <Link href="/assets?license=BANKING" className="hover:text-[#2bee4b] transition-colors">
                    {t("bankingCreditLink")}
                  </Link>
                </li>
                <li>
                  <Link href="/assets?license=CRYPTO" className="hover:text-[#2bee4b] transition-colors">
                    {t("cryptoVaspLink")}
                  </Link>
                </li>
                <li>
                  <Link href="/buyers" className="hover:text-[#2bee4b] transition-colors">
                    {t("buyerDirectoryLink")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Protocol & Verification */}
            <div className="space-y-3">
              <h4 className="font-lausanne text-[11px] font-semibold uppercase tracking-widest text-[#fafffa]">
                {tNav("compliance")}
              </h4>
              <ul className="space-y-2.5 font-lausanne text-xs text-[#c8d2c8]">
                <li>
                  <Link href="/assets" className="hover:text-[#2bee4b] transition-colors">
                    {t("regVerificationLink")}
                  </Link>
                </li>
                <li>
                  <Link href="/buyers" className="hover:text-[#2bee4b] transition-colors">
                    {t("pofProtocolLink")}
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[#2bee4b] transition-colors">
                    {t("sellerDealRoomLink")}
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[#2bee4b] transition-colors">
                    {t("mandatesLink")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Legal Notice & Copyright */}
          <div className="mt-16 border-t border-[#232924] pt-8 font-lausanne text-[11px] text-[#516254]">
            <p className="leading-relaxed">
              {t("regulatoryNotice")}
            </p>
            <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row border-t border-[#232924]/60 pt-4">
              <div>{t("copyright")}</div>
              <div className="flex items-center gap-6 text-[#c8d2c8]">
                <Link href="/login" className="hover:text-[#2bee4b] transition-colors">
                  {tNav("signIn")}
                </Link>
                <Link href="/register" className="hover:text-[#2bee4b] transition-colors">
                  {tNav("register")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
