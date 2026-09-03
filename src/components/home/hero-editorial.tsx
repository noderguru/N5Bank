"use client";

import { Link } from "@/i18n/routing";
import { PixelArrow } from "@/components/layout/candlestick";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

interface HeroEditorialProps {
  t: {
    eyebrow: string;
    lead: string;
    ctaPrimary: string;
    ctaSecondary: string;
    proofValidated: string;
    proofNda: string;
    proofConfidential: string;
    heroLine1: string;
    heroLine2: string;
    heroLine3: string;
    heroLine4: string;
    platformVolumeLabel: string;
    platformVolumeSub: string;
    globalReachLabel: string;
    globalReachSub: string;
    verificationLabel: string;
    confidentialityLabel: string;
    viewBuyerDirectory: string;
  };
}

export function HeroEditorial({ t }: HeroEditorialProps) {
  return (
    <section className="relative isolate overflow-hidden paper-light text-[#121613] min-h-[calc(100dvh-4rem)] flex flex-col justify-between py-6 sm:py-8 md:py-10 border-b border-[#e2ece3]">
      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 w-full flex-1 flex flex-col justify-between">
        
        {/* Upper Content: Eyebrow + Monolithic Typography + Lead & CTAs */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded border border-[#e2ece3] bg-[#fafffa]/90 px-3 py-1 backdrop-blur-sm">
            <span className="size-2 rounded-full bg-[#2bee4b]" />
            <span className="font-lausanne text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#516254]">
              {t.eyebrow}
            </span>
          </div>

          {/* Monolithic Typographic Wall - Pure Editorial Typography */}
          <div className="space-y-1 sm:space-y-2 md:space-y-3">
            {/* Line 1: Advancing the Capital */}
            <div>
              <h1 className="font-mondwest text-4xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[86px] font-normal tracking-tight leading-[0.92] text-[#121613]">
                {t.heroLine1}
              </h1>
            </div>

            {/* Line 2: Networks of M&A */}
            <div>
              <h1 className="font-mondwest text-4xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[86px] font-normal tracking-tight leading-[0.92] text-[#121613]">
                {t.heroLine2}
              </h1>
            </div>

            {/* Line 3: and Regulated Financial Assets */}
            <div>
              <h1 className="font-editorial text-3xl sm:text-5xl md:text-6xl lg:text-[66px] xl:text-[76px] font-light italic tracking-tight leading-[0.92] text-[#516254]">
                {t.heroLine3} {t.heroLine4}
              </h1>
            </div>
          </div>

          {/* Lead description & Actions */}
          <div className="w-full space-y-4 pt-1 sm:pt-2">
            <p className="w-full font-lausanne text-xs sm:text-sm md:text-base text-[#516254] leading-relaxed font-normal">
              {t.lead}
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
              <Link
                href="/assets"
                prefetch={false}
                className="btn-highlighter !py-2.5 !px-5 text-xs sm:text-sm"
              >
                <span>{t.ctaPrimary}</span>
                <PixelArrow />
              </Link>

              <Link
                href="/buyers"
                prefetch={false}
                className="font-lausanne text-xs uppercase tracking-widest text-[#121613] hover:text-[#2bee4b] underline underline-offset-8 transition-colors"
              >
                {t.viewBuyerDirectory}
              </Link>
            </div>
          </div>
        </div>

        {/* Live Metrics & Verification Proof Bar (Anchored at bottom of viewport) */}
        <div className="mt-8 border-t border-[#e2ece3] pt-4 sm:pt-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            <div className="space-y-0.5 sm:space-y-1">
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-[#516254]">
                {t.platformVolumeLabel}
              </span>
              <div className="font-lausanne text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-[#121613]">
                $1,064,137,489
              </div>
              <div className="font-lausanne text-[10px] sm:text-[11px] text-[#516254]">
                {t.platformVolumeSub}
              </div>
            </div>

            <div className="space-y-0.5 sm:space-y-1">
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-[#516254]">
                {t.globalReachLabel}
              </span>
              <div className="font-lausanne text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-[#121613]">
                100+
              </div>
              <div className="font-lausanne text-[10px] sm:text-[11px] text-[#516254]">
                {t.globalReachSub}
              </div>
            </div>

            <div className="space-y-0.5 sm:space-y-1">
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-[#516254]">
                {t.verificationLabel}
              </span>
              <div className="flex items-center gap-1.5 font-lausanne text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-[#121613]">
                <CheckCircle2 className="size-4 sm:size-5 text-[#2bee4b] shrink-0" />
                <span>100%</span>
              </div>
              <div className="font-lausanne text-[10px] sm:text-[11px] text-[#516254]">
                {t.proofValidated}
              </div>
            </div>

            <div className="space-y-0.5 sm:space-y-1">
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-[#516254]">
                {t.confidentialityLabel}
              </span>
              <div className="flex items-center gap-1.5 font-lausanne text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-[#121613]">
                <ShieldCheck className="size-4 sm:size-5 text-[#2bee4b] shrink-0" />
                <span>NDA</span>
              </div>
              <div className="font-lausanne text-[10px] sm:text-[11px] text-[#516254]">
                {t.proofNda}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
