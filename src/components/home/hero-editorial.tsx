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
  };
}

export function HeroEditorial({ t }: HeroEditorialProps) {
  return (
    <section className="relative isolate overflow-hidden paper-light text-[#121613] pt-28 pb-20 sm:pt-36 sm:pb-28 border-b border-[#e2ece3]">
      {/* Background paper texture & subtle grid */}
      <div className="grid-field absolute inset-0 opacity-40 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
        {/* Eyebrow badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded border border-[#e2ece3] bg-[#fafffa]/80 px-3 py-1 backdrop-blur-sm">
          <span className="size-2 rounded-full bg-[#2bee4b]" />
          <span className="font-lausanne text-[11px] font-semibold uppercase tracking-widest text-[#516254]">
            {t.eyebrow}
          </span>
        </div>

        {/* Monolithic Typographic Wall in PP Mondwest & TWK Lausanne with inline photo inserts */}
        <div className="space-y-2 sm:space-y-3">
          {/* Line 1 */}
          <div className="flex flex-wrap items-baseline gap-x-4 sm:gap-x-6 gap-y-2">
            <h1 className="font-mondwest text-5xl sm:text-7xl md:text-8xl lg:text-[105px] xl:text-[120px] font-normal tracking-tight leading-[0.92] text-[#121613]">
              Advancing
            </h1>

            {/* Photo Tile 1 */}
            <div className="relative h-[48px] w-[80px] sm:h-[72px] sm:w-[130px] md:h-[86px] md:w-[155px] overflow-hidden rounded-[14px] border border-[#232924]/20 shadow-sm align-middle self-center my-auto inline-block">
              <Image
                src="/static/Hero-CRYPTO-01-f02c7b2ef403195aaa3970a8f942f3c3.webp"
                alt="Financial billboard"
                fill
                sizes="160px"
                className="object-cover editorial-filter hero-img-swap"
              />
              <Image
                src="/static/Hero-NYSE-01-24bb730d87e775c1bc17a14a707054f4.webp"
                alt="NYSE building"
                fill
                sizes="160px"
                className="object-cover editorial-filter"
              />
            </div>

            <h1 className="font-editorial text-5xl sm:text-7xl md:text-8xl lg:text-[105px] xl:text-[120px] font-light italic tracking-tight leading-[0.92] text-[#121613]">
              the Capital
            </h1>
          </div>

          {/* Line 2 */}
          <div className="flex flex-wrap items-baseline gap-x-4 sm:gap-x-6 gap-y-2">
            {/* Photo Tile 2 */}
            <div className="relative h-[48px] w-[75px] sm:h-[72px] sm:w-[125px] md:h-[86px] md:w-[150px] overflow-hidden rounded-[14px] border border-[#232924]/20 shadow-sm align-middle self-center my-auto inline-block">
              <Image
                src="/static/Hero-CRYPTO-02-74411fc1db6623826e129e6bd93ffc7b.webp"
                alt="Server infrastructure"
                fill
                sizes="150px"
                className="object-cover editorial-filter hero-img-swap"
              />
              <Image
                src="/static/Hero-NYSE-02-f68100766baf1c98fe5716d6b3f4ace5.webp"
                alt="Wall street sign"
                fill
                sizes="150px"
                className="object-cover editorial-filter"
              />
            </div>

            <h1 className="font-mondwest text-5xl sm:text-7xl md:text-8xl lg:text-[105px] xl:text-[120px] font-normal tracking-tight leading-[0.92] text-[#121613]">
              Networks of
            </h1>

            {/* Photo Tile 3 */}
            <div className="relative h-[48px] w-[80px] sm:h-[72px] sm:w-[130px] md:h-[86px] md:w-[155px] overflow-hidden rounded-[14px] border border-[#232924]/20 shadow-sm align-middle self-center my-auto inline-block">
              <Image
                src="/static/Hero-CRYPTO-03-981c7cbe612acff9ab0287487d5085b8.webp"
                alt="Data center server"
                fill
                sizes="160px"
                className="object-cover editorial-filter hero-img-swap"
              />
              <Image
                src="/static/Hero-NYSE-03-eeae7c86cc7b53e6c302cc4d46f1e1dd.webp"
                alt="Wall street bull"
                fill
                sizes="160px"
                className="object-cover editorial-filter"
              />
            </div>

            <h1 className="font-lausanne text-5xl sm:text-7xl md:text-8xl lg:text-[105px] xl:text-[120px] font-semibold uppercase tracking-tighter leading-[0.92] text-[#121613]">
              M&A
            </h1>
          </div>

          {/* Line 3 */}
          <div className="flex flex-wrap items-baseline gap-x-4 sm:gap-x-6 gap-y-2">
            <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-[95px] xl:text-[110px] font-light italic tracking-tight leading-[0.92] text-[#516254]">
              and Regulated Financial Assets
            </h1>

            {/* Photo Tile 4 */}
            <div className="relative h-[45px] w-[75px] sm:h-[65px] sm:w-[120px] md:h-[76px] md:w-[140px] overflow-hidden rounded-[14px] border border-[#232924]/20 shadow-sm align-middle self-center my-auto inline-block">
              <Image
                src="/static/Hero-CRYPTO-04-0ecd9362de52a808c35ead4c9338c025.webp"
                alt="Digital stock ticker"
                fill
                sizes="140px"
                className="object-cover editorial-filter"
              />
            </div>
          </div>
        </div>

        {/* Lead description & Actions */}
        <div className="mt-10 sm:mt-14 max-w-2xl space-y-8">
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
              {t.ctaSecondary}
            </Link>
          </div>
        </div>

        {/* Live Metrics & Verification Proof Bar */}
        <div className="mt-14 sm:mt-20 border-t border-[#e2ece3] pt-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div className="space-y-1">
              <span className="font-mono text-xs uppercase tracking-widest text-[#516254]">
                Platform Volume
              </span>
              <div className="font-lausanne text-xl sm:text-2xl font-bold tracking-tight text-[#121613]">
                $1,064,137,489
              </div>
              <div className="font-lausanne text-[11px] text-[#516254]">
                Verified Asset Value
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-xs uppercase tracking-widest text-[#516254]">
                Global Reach
              </span>
              <div className="font-lausanne text-xl sm:text-2xl font-bold tracking-tight text-[#121613]">
                100+
              </div>
              <div className="font-lausanne text-[11px] text-[#516254]">
                Sovereign Jurisdictions
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-xs uppercase tracking-widest text-[#516254]">
                Verification
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
                Confidentiality
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
