"use client";

import Image from "next/image";
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
    <section className="relative isolate overflow-hidden paper-light text-[#121613] pt-24 pb-20 sm:pt-32 sm:pb-28 border-b border-[#e2ece3]">
      <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
        {/* Eyebrow badge */}
        <div className="mb-6 sm:mb-8 inline-flex items-center gap-2 rounded border border-[#e2ece3] bg-[#fafffa]/90 px-3.5 py-1.5 backdrop-blur-sm">
          <span className="size-2 rounded-full bg-[#2bee4b]" />
          <span className="font-lausanne text-[11px] font-semibold uppercase tracking-widest text-[#516254]">
            {t.eyebrow}
          </span>
        </div>

        {/* Monolithic Typographic Wall */}
        <div className="space-y-4 sm:space-y-5">
          
          {/* Line 1: Advancing the Capital + [Large Tile 1] */}
          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-3">
            <h1 className="font-mondwest text-5xl sm:text-7xl md:text-8xl lg:text-[105px] xl:text-[118px] font-normal tracking-tight leading-[0.92] text-[#121613]">
              {t.heroLine1}
            </h1>

            {/* Photo Tile 1 (322px x 135px) */}
            <div className="relative inline-flex h-[56px] w-[130px] sm:h-[84px] sm:w-[210px] md:h-[110px] md:w-[270px] lg:h-[135px] lg:w-[322px] overflow-hidden rounded-[14px] border border-[#232924]/15 shadow-md align-middle shrink-0 bg-[#161b17]">
              <Image
                src="/static/Hero-CRYPTO-01-f02c7b2ef403195aaa3970a8f942f3c3.webp"
                alt="Financial billboard"
                fill
                sizes="330px"
                className="object-cover editorial-filter hero-img-swap"
                priority
              />
              <Image
                src="/static/Hero-NYSE-01-24bb730d87e775c1bc17a14a707054f4.webp"
                alt="NYSE building"
                fill
                sizes="330px"
                className="object-cover editorial-filter"
                priority
              />
            </div>
          </div>

          {/* Line 2: Networks of M&A (no images, pure typography) */}
          <div className="flex flex-wrap items-baseline gap-x-4 sm:gap-x-6 gap-y-3">
            <h1 className="font-mondwest text-5xl sm:text-7xl md:text-8xl lg:text-[105px] xl:text-[118px] font-normal tracking-tight leading-[0.92] text-[#121613]">
              {t.heroLine2}
            </h1>
          </div>

          {/* Line 3 & 4: and Regulated Financial + Assets [Tile 4 directly opposite Assets] */}
          <div className="space-y-2 sm:space-y-3">
            <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-[92px] xl:text-[105px] font-light italic tracking-tight leading-[0.92] text-[#516254]">
              {t.heroLine3}
            </h1>

            {/* Assets + Image 4 in a locked flex row, preventing image from dropping underneath */}
            <div className="flex items-center gap-4 sm:gap-8">
              <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-[92px] xl:text-[105px] font-light italic tracking-tight leading-[0.92] text-[#516254]">
                {t.heroLine4}
              </h1>

              {/* Photo Tile 4 directly next to / opposite Assets */}
              <div className="relative inline-flex h-[56px] w-[140px] sm:h-[84px] sm:w-[230px] md:h-[110px] md:w-[300px] lg:h-[135px] lg:w-[375px] overflow-hidden rounded-[14px] border border-[#232924]/15 shadow-md align-middle shrink-0 bg-[#161b17]">
                <Image
                  src="/static/Hero-CRYPTO-04-0ecd9362de52a808c35ead4c9338c025.webp"
                  alt="Digital stock ticker"
                  fill
                  sizes="380px"
                  className="object-cover editorial-filter hero-img-swap"
                  priority
                />
                <Image
                  src="/static/Hero-NYSE-04-889ef0d843263d63e413de2856b57c90.webp"
                  alt="NYSE floor columns"
                  fill
                  sizes="380px"
                  className="object-cover editorial-filter"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lead description & Actions */}
        <div className="mt-12 sm:mt-16 max-w-2xl space-y-8">
          <p className="font-lausanne text-base sm:text-lg text-[#516254] leading-relaxed font-normal">
            {t.lead}
          </p>

          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <Link
              href="/assets"
              prefetch={false}
              className="btn-highlighter"
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

        {/* Live Metrics & Verification Proof Bar */}
        <div className="mt-16 sm:mt-20 border-t border-[#e2ece3] pt-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div className="space-y-1">
              <span className="font-mono text-xs uppercase tracking-widest text-[#516254]">
                {t.platformVolumeLabel}
              </span>
              <div className="font-lausanne text-xl sm:text-2xl font-bold tracking-tight text-[#121613]">
                $1,064,137,489
              </div>
              <div className="font-lausanne text-[11px] text-[#516254]">
                {t.platformVolumeSub}
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-xs uppercase tracking-widest text-[#516254]">
                {t.globalReachLabel}
              </span>
              <div className="font-lausanne text-xl sm:text-2xl font-bold tracking-tight text-[#121613]">
                100+
              </div>
              <div className="font-lausanne text-[11px] text-[#516254]">
                {t.globalReachSub}
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-xs uppercase tracking-widest text-[#516254]">
                {t.verificationLabel}
              </span>
              <div className="flex items-center gap-1.5 font-lausanne text-xl sm:text-2xl font-bold tracking-tight text-[#121613]">
                <CheckCircle2 className="size-5 text-[#2bee4b] shrink-0" />
                <span>100%</span>
              </div>
              <div className="font-lausanne text-[11px] text-[#516254]">
                {t.proofValidated}
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-xs uppercase tracking-widest text-[#516254]">
                {t.confidentialityLabel}
              </span>
              <div className="flex items-center gap-1.5 font-lausanne text-xl sm:text-2xl font-bold tracking-tight text-[#121613]">
                <ShieldCheck className="size-5 text-[#2bee4b] shrink-0" />
                <span>NDA</span>
              </div>
              <div className="font-lausanne text-[11px] text-[#516254]">
                {t.proofNda}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
