"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { PixelArrow } from "@/components/layout/candlestick";

export function StatsEditorial() {
  const t = useTranslations("home");

  const stats = [
    {
      figure: "$1.06B+",
      label: t("metric1Label"),
      detail: t("metric1Desc"),
    },
    {
      figure: "100+",
      label: t("metric2Label"),
      detail: t("metric2Desc"),
    },
    {
      figure: "98.4%",
      label: t("metric3Label"),
      detail: t("metric3Desc"),
    },
    {
      figure: "350+",
      label: t("metric4Label"),
      detail: t("metric4Desc"),
    }
  ];

  return (
    <section className="relative overflow-hidden paper-dark text-[#fafffa] py-8 sm:py-12 lg:py-14 border-b border-[#232924]">
      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-[#232924]">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-block size-1.5 sm:size-2 bg-[#2bee4b]" />
              <span className="font-lausanne text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-[#c8d2c8]">
                {t("velocityEyebrow")}
              </span>
            </div>
            <h2 className="font-mondwest text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight leading-[0.95] text-[#fafffa]">
              {t("velocityTitle")}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/seller/assets/new" className="btn-highlighter text-xs !py-2 !px-4">
              <span>{t("listAssetCta")}</span>
              <PixelArrow />
            </Link>
            <Link href="/buyers" className="btn-ghost-dark text-xs !py-2 !px-3.5">
              <span>{t("reviewMandatesCta")}</span>
            </Link>
          </div>
        </div>

        {/* 4 Large Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#232924] my-4 sm:my-6 border border-[#232924]">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="bg-[#121613] p-4 sm:p-5 lg:p-6 flex flex-col justify-between hover:bg-[#161b17] transition-colors duration-300"
            >
              <div>
                <span className="font-mono text-[11px] text-[#516254] block mb-2 sm:mb-3">0{idx + 1}</span>
                <div className="font-mondwest text-3xl sm:text-4xl lg:text-[40px] text-[#fafffa] leading-none mb-1.5">
                  {s.figure}
                </div>
                <h3 className="font-lausanne text-xs sm:text-[13px] font-semibold uppercase tracking-wider text-[#2bee4b] mb-1">
                  {s.label}
                </h3>
              </div>
              <p className="font-lausanne text-[11px] sm:text-xs text-[#c8d2c8] leading-relaxed mt-3 sm:mt-4">
                {s.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
