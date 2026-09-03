"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { PixelArrow } from "@/components/layout/candlestick";
import { cn } from "@/lib/utils";

interface Story {
  id: string;
  phase: string;
  image: string;
  alt: string;
  statement: React.ReactNode;
}

const STORIES: Story[] = [
  {
    id: "01",
    phase: "Phase · 01",
    image: "/static/Story-01-7adf4ba13032bb16612d169daaf9d44f.webp",
    alt: "NYSE trading floor",
    statement: (
      <>
        Traditional financial M&A is{" "}
        <span className="font-editorial italic font-light text-[#c8d2c8]">archaic</span>,
        taking 18 months and exposing confidential balance sheets...
      </>
    )
  },
  {
    id: "02",
    phase: "Phase · 02",
    image: "/static/Story-02-d1df78de491af1880cfda92bb637dee2.webp",
    alt: "Data center server infrastructure",
    statement: (
      <>
        Novel tech stacks have
        <span className="inline-block w-8 sm:w-12 h-2.5 bg-[#2bee4b] mx-2 align-baseline" />
        enabled a new
        <span className="inline-block w-8 sm:w-12 h-2.5 bg-[#2bee4b] mx-2 align-baseline" />
        form of bilateral markets...
        <span className="inline-block w-8 sm:w-12 h-2.5 bg-[#2bee4b] mx-2 align-baseline blinky-cursor" />
      </>
    )
  },
  {
    id: "03",
    phase: "Phase · 03",
    image: "/static/Story-03-fa3ee620c23979fb611a21b46183e247.webp",
    alt: "Modern institutional capital allocators",
    statement: (
      <>
        We bridge{" "}
        <span className="font-editorial italic font-light text-[#c8d2c8]">sovereign banking institutions</span>{" "}
        to digital finance allocators worldwide.
      </>
    )
  }
];

export function StoriesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const targetProgressRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);

  useEffect(() => {
    let animId: number;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScroll = containerRef.current.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      const p = Math.max(0, Math.min(1, -rect.top / totalScroll));
      targetProgressRef.current = p;
    };

    const updateLoop = () => {
      // Smooth lerp for silky inertial scroll
      const diff = targetProgressRef.current - currentProgressRef.current;
      if (Math.abs(diff) > 0.0005) {
        currentProgressRef.current += diff * 0.12;
        setProgress(currentProgressRef.current);
      } else if (currentProgressRef.current !== targetProgressRef.current) {
        currentProgressRef.current = targetProgressRef.current;
        setProgress(targetProgressRef.current);
      }
      animId = requestAnimationFrame(updateLoop);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    animId = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Compute 3D orbit transforms for each of the 3 images based on progress (0 to 1)
  const getImageTransform = (index: number) => {
    // Smooth 3-stage orbital choreography
    if (index === 0) {
      if (progress <= 0.45) {
        const t = progress / 0.45;
        const x = t * 70;
        const y = -t * 40;
        const scale = 1 - t * 0.25;
        const opacity = 1 - t * 0.85;
        return {
          transform: `translate3d(${x}%, ${y}%, 0) scale(${scale})`,
          opacity,
          zIndex: t > 0.5 ? 1 : 3
        };
      }
      return {
        transform: "translate3d(70%, -40%, 0) scale(0.75)",
        opacity: 0,
        zIndex: 0
      };
    } else if (index === 1) {
      if (progress <= 0.45) {
        const t = progress / 0.45;
        const x = 70 - t * 70;
        const y = 40 - t * 40;
        const scale = 0.75 + t * 0.25;
        const opacity = 0.2 + t * 0.8;
        return {
          transform: `translate3d(${x}%, ${y}%, 0) scale(${scale})`,
          opacity,
          zIndex: t > 0.5 ? 3 : 2
        };
      } else if (progress <= 0.85) {
        const t = (progress - 0.45) / 0.4;
        const x = t * 70;
        const y = -t * 40;
        const scale = 1 - t * 0.25;
        const opacity = 1 - t * 0.85;
        return {
          transform: `translate3d(${x}%, ${y}%, 0) scale(${scale})`,
          opacity,
          zIndex: t > 0.5 ? 1 : 3
        };
      }
      return {
        transform: "translate3d(70%, -40%, 0) scale(0.75)",
        opacity: 0,
        zIndex: 0
      };
    } else {
      // index === 2
      if (progress <= 0.45) {
        return {
          transform: "translate3d(70%, 70%, 0) scale(0.75)",
          opacity: 0,
          zIndex: 1
        };
      }
      const t = Math.min(1, (progress - 0.45) / 0.4);
      const x = 70 - t * 70;
      const y = 40 - t * 40;
      const scale = 0.75 + t * 0.25;
      const opacity = 0.2 + t * 0.8;
      return {
        transform: `translate3d(${x}%, ${y}%, 0) scale(${scale})`,
        opacity,
        zIndex: t > 0.5 ? 3 : 2
      };
    }
  };

  // Determine current active story index for narrative focus
  const activeStoryIndex = progress < 0.33 ? 0 : progress < 0.66 ? 1 : 2;

  return (
    <section
      ref={containerRef}
      className="relative h-[260vh] paper-dark text-[#fafffa] border-b border-[#232924]"
    >
      {/* Sticky Pinned Viewport */}
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
        <div className="mx-auto max-w-7xl w-full px-6 sm:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">

            {/* Left Column: Vertical Scroll Indicator & Pinned 3D Image Orbit */}
            <div className="lg:col-span-6 flex items-center gap-6 sm:gap-10">
              
              {/* Vertical Scroll Invite (matching newformcap.com) */}
              <div className="hidden sm:flex flex-col items-center gap-3 text-[#516254] font-lausanne text-[11px] uppercase tracking-widest select-none">
                <span className="[writing-mode:vertical-lr] rotate-180">Scroll</span>
                <span className="font-mono text-[#2bee4b] text-xs">0{activeStoryIndex + 1}</span>
                <div className="text-[#2bee4b] animate-bounce">
                  <PixelArrow />
                </div>
              </div>

              {/* 3D Image Orbit Stage */}
              <div className="relative w-full max-w-[420px] h-[360px] sm:h-[480px] lg:h-[540px]">
                {STORIES.map((story, idx) => {
                  const style = getImageTransform(idx);
                  return (
                    <div
                      key={story.id}
                      className="absolute inset-0 rounded-[14px] overflow-hidden border border-[#232924] shadow-2xl bg-[#161b17] transition-all will-change-transform"
                      style={{
                        transform: style.transform,
                        opacity: style.opacity,
                        zIndex: style.zIndex,
                        transition: "opacity 0.15s ease-out"
                      }}
                    >
                      <Image
                        src={story.image}
                        alt={story.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 420px"
                        className="object-cover editorial-filter"
                        priority={idx === 0}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Thesis Card attached at bottom of left stage */}
              <div className="hidden xl:block absolute bottom-8 left-8 max-w-[320px] space-y-3 z-10">
                <div className="space-y-1">
                  <h4 className="font-lausanne text-[11px] font-semibold uppercase tracking-widest text-[#fafffa]">
                    The Institutional Thesis
                  </h4>
                  <p className="font-lausanne text-xs text-[#c8d2c8] leading-relaxed">
                    Curated bilateral acquisitions with cryptographic LOI escrow and pre-vetted compliance.
                  </p>
                </div>
                <Link
                  href="/assets"
                  prefetch={false}
                  className="btn-highlighter text-[10px] py-2.5 px-4"
                >
                  <span>Explore Licences</span>
                  <PixelArrow />
                </Link>
              </div>

            </div>

            {/* Right Column: Scrubbed Narrative Statements */}
            <div className="lg:col-span-6 relative min-h-[320px] flex items-center">
              {STORIES.map((story, idx) => {
                const isActive = activeStoryIndex === idx;
                return (
                  <div
                    key={story.id}
                    className={cn(
                      "absolute inset-x-0 transition-all duration-500 ease-out",
                      isActive
                        ? "opacity-100 translate-y-0 visible pointer-events-auto"
                        : idx < activeStoryIndex
                        ? "opacity-0 -translate-y-8 invisible pointer-events-none"
                        : "opacity-0 translate-y-8 invisible pointer-events-none"
                    )}
                  >
                    <span className="font-mono text-xs text-[#2bee4b] uppercase tracking-widest mb-4 block">
                      {story.phase}
                    </span>

                    <h2 className="font-mondwest text-4xl sm:text-5xl lg:text-[62px] font-normal leading-[1.08] tracking-tight text-[#fafffa]">
                      {story.statement}
                    </h2>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
