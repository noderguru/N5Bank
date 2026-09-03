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
    <section className="relative overflow-hidden paper-dark text-[#fafffa] py-24 sm:py-32 border-b border-[#232924]">
      

      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-16 border-b border-[#232924]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="inline-block size-2 bg-[#2bee4b]" />
              <span className="font-lausanne text-xs font-semibold uppercase tracking-widest text-[#c8d2c8]">
                {t("velocityEyebrow")}
              </span>
            </div>
            <h2 className="font-mondwest text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight leading-[0.95] text-[#fafffa]">
              {t("velocityTitle")}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/seller/assets/new" className="btn-highlighter">
              <span>{t("listAssetCta")}</span>
              <PixelArrow />
            </Link>
            <Link href="/buyers" className="btn-ghost-dark">
              <span>{t("reviewMandatesCta")}</span>
            </Link>
          </div>
        </div>

        {/* 4 Large Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#232924] my-12 border border-[#232924]">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="bg-[#121613] p-8 sm:p-10 flex flex-col justify-between hover:bg-[#161b17] transition-colors duration-300"
            >
              <div>
                <span className="font-mono text-xs text-[#516254] block mb-6">0{idx + 1}</span>
                <div className="font-mondwest text-4xl sm:text-5xl lg:text-6xl text-[#fafffa] leading-none mb-3">
                  {s.figure}
                </div>
                <h3 className="font-lausanne text-sm font-semibold uppercase tracking-wider text-[#2bee4b] mb-2">
                  {s.label}
                </h3>
              </div>
              <p className="font-lausanne text-xs text-[#c8d2c8] leading-relaxed mt-6">
                {s.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
