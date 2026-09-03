"use client";

import { cn } from "@/lib/utils";

interface CandlestickProps {
  className?: string;
  active?: boolean;
}

export function Candlestick({ className, active = false }: CandlestickProps) {
  return (
    <div className={cn("flex items-center gap-[5px] h-[25px] cursor-pointer group", className)}>
      <div
        className={cn(
          "w-[3px] h-[20px] bg-[#2bee4b] transition-all duration-300",
          active ? "h-[20px] translate-y-0" : "group-hover:translate-y-0"
        )}
      />
      <div
        className={cn(
          "w-[3px] h-[20px] bg-[#2bee4b] transition-all duration-300 translate-y-[3px]",
          active ? "translate-y-0" : "group-hover:translate-y-0"
        )}
      />
      <div
        className={cn(
          "w-[3px] h-[20px] bg-[#2bee4b] transition-all duration-300 -translate-y-[5px]",
          active ? "translate-y-0" : "group-hover:translate-y-0"
        )}
      />
    </div>
  );
}

export function PixelArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 17 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-[17px] h-[8px] shrink-0", className)}
    >
      <path
        d="M13.613 1.42417V0.0224609H11.9194V1.42417H13.613ZM15.3065 5.62075V4.21904H17V2.82588H15.3065V1.42417H13.613V2.82588H0V4.21904H13.613V5.62075H15.3065ZM13.613 7.02246V5.62075H11.9194V7.02246H13.613Z"
        fill="currentColor"
      />
    </svg>
  );
}
