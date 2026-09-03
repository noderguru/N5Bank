"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface MarqueeBannerProps {
  dark?: boolean;
  speed?: "normal" | "fast" | "slow";
}

export function MarqueeBanner({ dark = false, speed = "normal" }: MarqueeBannerProps) {
  const items = [
    { editorial: "Wall Street M&A", mondwest: "Fintech Charters", img: "/static/Marquee-one-01-08a4b95c42607bb02f9a7c212d13188a.webp" },
    { editorial: "Banking Rails", mondwest: "Sovereign Institutions", img: "/static/Story-01-7adf4ba13032bb16612d169daaf9d44f.webp" },
    { editorial: "Digital Assets", mondwest: "Regulated CASP", img: "/static/Marquee-one-02-f5db565a07497b53d68555c43916f725.webp" },
    { editorial: "Bilateral Escrow", mondwest: "Direct Acquisitions", img: "/static/Story-02-d1df78de491af1880cfda92bb637dee2.webp" },
  ];

  const durationClass = speed === "fast" ? "[animation-duration:20s]" : speed === "slow" ? "[animation-duration:40s]" : "[animation-duration:30s]";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden border-y py-8 sm:py-12 select-none",
        dark
          ? "border-[#232924] bg-[#121613] text-[#fafffa]"
          : "border-[#e2ece3] bg-[#fafffa] text-[#121613]"
      )}
    >
      <div className={cn("marquee-track flex items-center gap-12 sm:gap-16", durationClass)}>
        {[...items, ...items, ...items].map((item, idx) => (
          <div key={idx} className="flex items-center gap-6 sm:gap-10 shrink-0">
            <span className="font-editorial text-4xl sm:text-6xl md:text-7xl font-light italic opacity-75 whitespace-nowrap">
              {item.editorial}
            </span>

            {item.img && (
              <div className="relative size-14 sm:size-20 overflow-hidden rounded-[10px] border border-[#232924]/30 shrink-0">
                <Image
                  src={item.img}
                  alt="Editorial tile"
                  fill
                  sizes="80px"
                  className="object-cover editorial-filter"
                />
              </div>
            )}

            <span className="font-mondwest text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight whitespace-nowrap">
              {item.mondwest}
            </span>

            <span className="size-2 sm:size-3 rounded-full bg-[#2bee4b] shrink-0 mx-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
