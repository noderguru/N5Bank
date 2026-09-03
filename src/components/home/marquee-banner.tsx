"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface MarqueeBannerProps {
  dark?: boolean;
  speed?: "normal" | "fast" | "slow";
}

export function MarqueeBanner({ dark = false, speed = "normal" }: MarqueeBannerProps) {
  const t = useTranslations("home");

  const items = [
    { editorial: t("marqueeFintech"), mondwest: t("marqueeMna"), img: "/static/Marquee-one-01-08a4b95c42607bb02f9a7c212d13188a.webp" },
    { editorial: t("marqueeBanking"), mondwest: t("marqueeEmi"), img: "/static/Story-01-7adf4ba13032bb16612d169daaf9d44f.webp" },
    { editorial: t("marqueeCrypto"), mondwest: t("marqueeBrokerage"), img: "/static/Marquee-one-02-f5db565a07497b53d68555c43916f725.webp" },
  ];

  const durationClass = speed === "fast" ? "[animation-duration:20s]" : speed === "slow" ? "[animation-duration:40s]" : "[animation-duration:30s]";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden border-y py-3 sm:py-4 select-none",
        dark
          ? "border-[#232924] bg-[#121613] text-[#fafffa]"
          : "border-[#e2ece3] bg-[#fafffa] text-[#121613]"
      )}
    >
      <div className={cn("marquee-track flex items-center gap-8 sm:gap-12", durationClass)}>
        {[...items, ...items, ...items].map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 sm:gap-5 shrink-0">
            <span className="font-editorial text-lg sm:text-2xl md:text-3xl font-light italic opacity-75 whitespace-nowrap">
              {item.editorial}
            </span>

            {item.img && (
              <div className="relative size-7 sm:size-9 overflow-hidden rounded-[6px] border border-[#232924]/30 shrink-0">
                <Image
                  src={item.img}
                  alt="Editorial tile"
                  fill
                  sizes="36px"
                  className="object-cover editorial-filter"
                />
              </div>
            )}

            <span className="font-mondwest text-lg sm:text-2xl md:text-3xl font-normal tracking-tight whitespace-nowrap">
              {item.mondwest}
            </span>

            <span className="size-1.5 sm:size-2 rounded-full bg-[#2bee4b] shrink-0 mx-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
