"use client";

import { useState } from "react";
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

const PILLARS: Pillar[] = [
  {
    id: "banking",
    number: "01",
    tag: "Finance",
    title: "Financial Primitives & Banking",
    description:
      "Fully operational European Electronic Money Institutions (EMI), Payment Institutions, and Tier-1 Banking entities equipped with direct SEPA Instant, SWIFT clearing, and multi-currency virtual IBAN infrastructure.",
    details: [
      "Direct SEPA & TARGET2 Connectivity",
      "Mastercard & Visa Principal BIN Sponsorship",
      "Pre-cleared Correspondent Banking Rails",
      "Full Passporting across all EEA Member States"
    ],
    bgImage: "/static/finance-background-8fc6f257ec55013a5a01fa94aa07598d.webp"
  },
  {
    id: "crypto",
    number: "02",
    tag: "Blockchain",
    title: "Regulated CASP & Digital Custody",
    description:
      "Turnkey European Crypto Asset Service Provider (CASP) charters, institutional custody architectures, and compliant fiat-to-crypto gateway entities operating with strict MiCA readiness.",
    details: [
      "Segregated Multi-Sig MPC Vault Architecture",
      "Pre-configured Real-time AML & Sanctions Monitoring",
      "Active Fiat Settlement Accounts in Tier-1 Jurisdictions",
      "Clean Regulatory Ledger with Zero Historical Sanctions"
    ],
    bgImage: "/static/blockchain-background-ec2ba01259ed2bb95c46e3f57da1ba88.webp"
  },
  {
    id: "data",
    number: "03",
    tag: "Data",
    title: "Bilateral NDA & Sovereign Escrow",
    description:
      "Institutional deal room safeguarding sensitive customer balances, core codebases, and cap tables. Every counterparty undergoes strict KYC verification before LOI submission.",
    details: [
      "Cryptographic LOI Escrow Coordination",
      "Automated Dual-Signature Non-Disclosure Agreements",
      "Confidential Blind Listings with Zero Balance Sheet Leaks",
      "Institutional Diligence & Regulatory Ownership Approval"
    ],
    bgImage: "/static/data-background-40558dd2ed0062c23ee9deb54987075e.webp"
  }
];

export function PillarsSection() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const current = (PILLARS[activeTab] ?? PILLARS[0])!;

  return (
    <section className="relative overflow-hidden border-y border-[#232924] paper-dark text-[#fafffa] py-24 sm:py-32">
      

      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-[#232924]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="inline-block size-2 bg-[#2bee4b]" />
              <span className="font-lausanne text-xs font-semibold uppercase tracking-widest text-[#c8d2c8]">
                Marketplace Architecture
              </span>
            </div>
            <h2 className="font-mondwest text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-[#fafffa] leading-[0.95]">
              Three Pillars of Sovereign M&A
            </h2>
          </div>
          <p className="max-w-md font-lausanne text-xs sm:text-sm text-[#c8d2c8] leading-relaxed">
            N5Deal bridges traditional financial regulatory frameworks with modern digital rails, enabling seamless bilateral institutional transactions.
          </p>
        </div>

        {/* Tab Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#232924] my-10 border border-[#232924]">
          {PILLARS.map((p, idx) => {
            const isSelected = activeTab === idx;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={cn(
                  "group relative flex flex-col justify-between p-6 sm:p-8 text-left transition-all duration-300",
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

                <div className="flex items-baseline justify-between w-full mb-4">
                  <span className="font-mono text-xs text-[#516254]">{p.number}</span>
                  <span
                    className={cn(
                      "font-lausanne text-[11px] uppercase tracking-widest px-2 py-0.5 rounded",
                      isSelected ? "bg-[#2bee4b] text-black font-semibold" : "bg-[#232924] text-[#c8d2c8]"
                    )}
                  >
                    {p.tag}
                  </span>
                </div>

                <h3 className="font-lausanne text-lg sm:text-xl font-bold tracking-tight mb-2">
                  {p.title}
                </h3>
              </button>
            );
          })}
        </div>

        {/* Selected Pillar Content View */}
        <div className="relative overflow-hidden rounded-[10px] border border-[#232924] bg-[#121613] p-8 sm:p-12 lg:p-16">
          {/* Subtle background texture tile */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-luminosity pointer-events-none transition-all duration-500"
            style={{ backgroundImage: `url(${current.bgImage})` }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 border border-[#232924] bg-[#161b17] px-3 py-1 rounded">
                <span className="size-1.5 rounded-full bg-[#2bee4b]" />
                <span className="font-lausanne text-[10px] uppercase tracking-widest text-[#c8d2c8]">
                  Charter Specification · {current.tag}
                </span>
              </div>

              <h3 className="font-mondwest text-3xl sm:text-5xl text-[#fafffa] leading-tight">
                {current.title}
              </h3>

              <p className="font-lausanne text-sm sm:text-base text-[#c8d2c8] leading-relaxed max-w-xl">
                {current.description}
              </p>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href="/assets"
                  className="btn-highlighter"
                >
                  <span>Explore Matching Licences</span>
                  <PixelArrow />
                </Link>
                <Link
                  href="/buyers"
                  className="btn-ghost-dark"
                >
                  <span>View Buyer Demand</span>
                </Link>
              </div>
            </div>

            {/* Right Spec List & Venn Intersection Icon */}
            <div className="lg:col-span-5 bg-[#161b17]/80 backdrop-blur-sm border border-[#232924] p-6 sm:p-8 rounded-[8px] space-y-6">
              <div className="flex items-center justify-between border-b border-[#232924] pb-4">
                <span className="font-lausanne text-xs font-semibold uppercase tracking-widest text-[#fafffa]">
                  Verified Inclusions
                </span>
                {/* Venn Center Highlight SVG */}
                <svg
                  viewBox="0 0 65 59"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-6 text-[#2bee4b] shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M64.6258 2.89032C57.2953 23.4079 46.2428 42.1566 32.2816 58.3231C18.3601 42.2025 7.33084 23.5145 0 3.0653C10.6189 1.05295 21.5773 0 32.7816 0C43.6566 0 54.2998 0.991955 64.6258 2.89032Z"
                    fill="#2bee4b"
                  />
                </svg>
              </div>

              <ul className="space-y-3">
                {current.details.map((detail, dIdx) => (
                  <li key={dIdx} className="flex items-start gap-3 font-lausanne text-xs text-[#c8d2c8]">
                    <span className="text-[#2bee4b] font-bold mt-0.5">+</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-[#232924] flex items-center justify-between text-[11px] text-[#516254] font-lausanne">
                <span>Direct Bilateral Protocol</span>
                <span className="text-[#2bee4b]">NDA Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
