"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { PixelArrow } from "@/components/layout/candlestick";
import { cn } from "@/lib/utils";

interface Pillar {
  id: string;
  number: string;
  tag: string;
  title: string;
  description: string;
  details: string[];
  bgImage: string;
}

export function PillarsSection() {
  const t = useTranslations("home");
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const userInteractedRef = useRef<boolean>(false);

  const pillars: Pillar[] = [
    {
      id: "banking",
      number: "01",
      tag: t("pillar1Tag"),
      title: t("pillar1Title"),
      description: t("pillar1Desc"),
      details: t.raw("pillar1Details") as string[],
      bgImage: "/static/finance-background-8fc6f257ec55013a5a01fa94aa07598d.webp"
    },
    {
      id: "crypto",
      number: "02",
      tag: t("pillar2Tag"),
      title: t("pillar2Title"),
      description: t("pillar2Desc"),
      details: t.raw("pillar2Details") as string[],
      bgImage: "/static/blockchain-background-ec2ba01259ed2bb95c46e3f57da1ba88.webp"
    },
    {
      id: "data",
      number: "03",
      tag: t("pillar3Tag"),
      title: t("pillar3Title"),
      description: t("pillar3Desc"),
      details: t.raw("pillar3Details") as string[],
      bgImage: "/static/data-background-40558dd2ed0062c23ee9deb54987075e.webp"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || userInteractedRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScroll = containerRef.current.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      const p = Math.max(0, Math.min(1, -rect.top / totalScroll));
      
      if (p < 0.33) {
        setActiveTab(0);
      } else if (p < 0.66) {
        setActiveTab(1);
      } else {
        setActiveTab(2);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const current = (pillars[activeTab] ?? pillars[0])!;

  return (
    <section
      ref={containerRef}
      className="relative h-[220vh] border-y border-[#232924] paper-dark text-[#fafffa]"
    >
      {/* Sticky Pinned Stage */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden py-12">
        <div className="relative z-10 mx-auto max-w-6xl w-full px-6 sm:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#232924]">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="inline-block size-2 bg-[#2bee4b]" />
                <span className="font-lausanne text-xs font-semibold uppercase tracking-widest text-[#c8d2c8]">
                  {t("architectureEyebrow")}
                </span>
              </div>
              <h2 className="font-mondwest text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#fafffa] leading-[0.95]">
                {t("architectureTitle")}
              </h2>
            </div>
            <p className="max-w-md font-lausanne text-xs sm:text-sm text-[#c8d2c8] leading-relaxed">
              {t("architectureDesc")}
            </p>
          </div>

          {/* Tab Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#232924] my-6 border border-[#232924]">
            {pillars.map((p, idx) => {
              const isSelected = activeTab === idx;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    userInteractedRef.current = true;
                    setActiveTab(idx);
                  }}
                  className={cn(
                    "group relative flex flex-col justify-between p-5 sm:p-6 text-left transition-all duration-300",
                    isSelected ? "bg-[#1a201c] text-[#fafffa]" : "bg-[#121613] text-[#c8d2c8] hover:bg-[#161b17]"
                  )}
                >
                  {/* Active indicator bar */}
                  <span
                    className={cn(
                      "absolute top-0 left-0 h-[3px] w-full transition-all duration-300",
                      isSelected ? "bg-[#2bee4b]" : "bg-transparent group-hover:bg-[#2bee4b]/40"
                    )}
                  />

                  <div className="flex items-baseline justify-between w-full mb-3">
                    <span className="font-mono text-xs text-[#516254]">{p.number}</span>
                    <span
                      className={cn(
                        "font-lausanne text-[10px] uppercase tracking-widest px-2 py-0.5 rounded",
                        isSelected ? "bg-[#2bee4b] text-black font-semibold" : "bg-[#232924] text-[#c8d2c8]"
                      )}
                    >
                      {p.tag}
                    </span>
                  </div>

                  <h3 className="font-lausanne text-base sm:text-lg font-bold tracking-tight">
                    {p.title}
                  </h3>
                </button>
              );
            })}
          </div>

          {/* Selected Pillar Content View */}
          <div className="relative overflow-hidden rounded-[10px] border border-[#232924] bg-[#121613] p-6 sm:p-10 lg:p-12 shadow-2xl">
            {/* Subtle background texture tile */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity pointer-events-none transition-all duration-700"
              style={{ backgroundImage: `url(${current.bgImage})` }}
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Pillar Left Details */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 rounded border border-[#232924] bg-[#161b17] px-3 py-1 font-lausanne text-[11px] uppercase tracking-widest text-[#2bee4b]">
                  {t("charterSpec")} · {current.tag}
                </div>

                <h4 className="font-mondwest text-2xl sm:text-3xl lg:text-4xl font-normal text-[#fafffa] leading-tight">
                  {current.title}
                </h4>

                <p className="font-lausanne text-xs sm:text-sm text-[#c8d2c8] leading-relaxed max-w-xl">
                  {current.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/assets"
                    prefetch={false}
                    className="btn-highlighter text-xs py-3 px-6"
                  >
                    <span>{t("exploreMatching")}</span>
                    <PixelArrow />
                  </Link>

                  <Link
                    href="/buyers"
                    prefetch={false}
                    className="btn-ghost-dark text-xs py-3 px-5"
                  >
                    {t("viewDemand")}
                  </Link>
                </div>
              </div>

              {/* Pillar Right Spec Box with Venn diagram center highlight */}
              <div className="lg:col-span-5 rounded-[8px] border border-[#232924] bg-[#161b17]/90 p-5 sm:p-6 space-y-4 backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-[#232924] pb-3">
                  <span className="font-lausanne text-[11px] font-semibold uppercase tracking-widest text-[#fafffa]">
                    {t("verifiedInclusions")}
                  </span>
                  
                  {/* Central Green Venn Highlight icon */}
                  <div className="flex items-center gap-1.5 text-xs text-[#2bee4b]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="9" cy="9" r="6" stroke="#2bee4b" strokeWidth="1.5" strokeOpacity="0.4" fill="#2bee4b" fillOpacity="0.1" />
                      <circle cx="15" cy="9" r="6" stroke="#2bee4b" strokeWidth="1.5" strokeOpacity="0.4" fill="#2bee4b" fillOpacity="0.1" />
                      <circle cx="12" cy="14" r="6" stroke="#2bee4b" strokeWidth="1.5" strokeOpacity="0.8" fill="#2bee4b" fillOpacity="0.35" />
                    </svg>
                  </div>
                </div>

                <ul className="space-y-2.5 font-lausanne text-xs text-[#c8d2c8]">
                  {current.details.map((detail, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-2.5">
                      <span className="size-1.5 rounded-full bg-[#2bee4b] mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-[#232924] pt-3 flex items-center justify-between text-[11px] text-[#516254]">
                  <span>{t("directProtocol")}</span>
                  <span className="text-[#2bee4b] font-mono">{t("ndaProtected")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
