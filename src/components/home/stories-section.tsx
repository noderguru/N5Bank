"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { PixelArrow } from "@/components/layout/candlestick";
import { cn } from "@/lib/utils";

interface Story {
  id: string;
  image: string;
  alt: string;
  statement: React.ReactNode;
}

const STORIES: Story[] = [
  {
    id: "01",
    image: "/static/Story-01-7adf4ba13032bb16612d169daaf9d44f.webp",
    alt: "Archaic financial trading floor",
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
    image: "/static/Story-02-d1df78de491af1880cfda92bb637dee2.webp",
    alt: "Server infrastructure and novel tech stacks",
    statement: (
      <>
        Novel tech stacks have
        <span className="inline-block w-8 h-2 bg-[#2bee4b] mx-2 align-baseline" />
        enabled a new
        <span className="inline-block w-8 h-2 bg-[#2bee4b] mx-2 align-baseline" />
        form of bilateral markets...
        <span className="inline-block w-8 h-2 bg-[#2bee4b] mx-2 align-baseline blinky-cursor" />
      </>
    )
  },
  {
    id: "03",
    image: "/static/Story-03-fa3ee620c23979fb611a21b46183e247.webp",
    alt: "Institutional capital allocators desk",
    statement: (
      <>
        We bridge{" "}
        <span className="font-editorial italic font-light text-[#c8d2c8]">sovereign banking institutions</span>{" "}
        to digital finance allocators across 100+ jurisdictions.
      </>
    )
  }
];

export function StoriesSection() {
  const [activeStory, setActiveStory] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      
      itemRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // Check if element is in the middle of viewport
        if (rect.top <= windowHeight * 0.55 && rect.bottom >= windowHeight * 0.35) {
          setActiveStory(idx);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative border-b border-[#232924] paper-dark text-[#fafffa]"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Sticky Column with Image & Callout */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            {/* Scroll Indicator */}
            <div className="hidden lg:flex items-center gap-2 text-[#516254] font-lausanne text-[10px] uppercase tracking-widest">
              <span>Story</span>
              <span className="font-mono text-[#2bee4b]">0{activeStory + 1} / 0{STORIES.length}</span>
              <span className="text-[#2bee4b] animate-bounce ml-1">↓</span>
            </div>

            {/* Pinned Image Frame with smooth cross-fade */}
            <div className="relative h-[420px] sm:h-[520px] w-full max-w-[400px] overflow-hidden rounded-[14px] border border-[#232924] shadow-2xl bg-[#161b17]">
              {STORIES.map((story, idx) => (
                <div
                  key={story.id}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-700 ease-in-out",
                    activeStory === idx ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105"
                  )}
                  style={{ transitionProperty: "opacity, transform" }}
                >
                  <Image
                    src={story.image}
                    alt={story.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover editorial-filter"
                    priority={idx === 0}
                  />
                </div>
              ))}
            </div>

            {/* Left Story Footer Card */}
            <div className="max-w-[400px] space-y-4 pt-2">
              <div className="space-y-1">
                <h4 className="font-lausanne text-xs font-semibold uppercase tracking-widest text-[#fafffa]">
                  The Institutional Thesis
                </h4>
                <p className="font-lausanne text-xs text-[#c8d2c8] leading-relaxed">
                  Curated bilateral acquisitions with cryptographic LOI escrow and pre-vetted compliance.
                </p>
              </div>

              <Link
                href="/assets"
                prefetch={false}
                className="btn-highlighter text-[10px] py-3 px-5"
              >
                <span>Explore Licences</span>
                <PixelArrow />
              </Link>
            </div>
          </div>

          {/* Right Scrolling Column with Giant Narrative Statements */}
          <div className="lg:col-span-7 space-y-36 lg:space-y-64 py-12 lg:py-24">
            {STORIES.map((story, idx) => (
              <div
                key={story.id}
                ref={(el) => { itemRefs.current[idx] = el; }}
                className={cn(
                  "transition-opacity duration-500 min-h-[50vh] flex flex-col justify-center",
                  activeStory === idx ? "opacity-100" : "opacity-35"
                )}
              >
                <span className="font-mono text-xs text-[#2bee4b] uppercase tracking-widest mb-4 block">
                  Phase · 0{idx + 1}
                </span>

                <h2 className="font-mondwest text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-tight text-[#fafffa]">
                  {story.statement}
                </h2>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
