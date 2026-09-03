import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { readSession } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { HeroEditorial } from "@/components/home/hero-editorial";
import { StoriesSection } from "@/components/home/stories-section";
import { MarqueeBanner } from "@/components/home/marquee-banner";
import { PillarsSection } from "@/components/home/pillars-section";
import { StatsEditorial } from "@/components/home/stats-editorial";
import { AssetCard } from "@/components/marketplace/asset-card";
import { BuyerCard } from "@/components/marketplace/buyer-card";
import { PixelArrow } from "@/components/layout/candlestick";

const FEATURED_ASSETS = [
  {
    id: "ast_demo_1",
    title: "Operating EMI Institution with Direct SEPA & Multi-currency IBANs",
    summary:
      "Fully operational European Electronic Money Institution with Tier-1 correspondent banking relationships, Mastercard issuing BIN, and passporting rights across all 30 EEA member states.",
    country: "Lithuania",
    licenseType: "E_MONEY" as const,
    businessType: "FINTECH" as const,
    businessStatus: "OPERATING" as const,
    askingPrice: 2850000,
    priceMode: "FIXED" as const,
    currency: "EUR",
    features: ["Direct SEPA Instant", "SWIFT Participant", "Core Banking API", "Card Issuing BIN"],
    validated: true,
    regulator: "Bank of Lithuania",
  },
  {
    id: "ast_demo_2",
    title: "Licensed Crypto Asset Service Provider (CASP / VASP)",
    summary:
      "Turnkey digital asset custody and exchange license with compliant KYC/AML procedures, proprietary liquidity connectivity, and active operational bank accounts in Tier-1 EU institutions.",
    country: "Czech Republic",
    licenseType: "CRYPTO" as const,
    businessType: "CRYPTO_BUSINESS" as const,
    businessStatus: "OPERATING" as const,
    askingPrice: null,
    priceMode: "ON_LOI" as const,
    currency: "EUR",
    features: ["Crypto-Fiat Rails", "Custody Infrastructure", "Zero Historical Sanctions", "MiCA Ready"],
    validated: true,
    regulator: "FAU Czechia",
  },
  {
    id: "ast_demo_3",
    title: "Specialised Brokerage & Asset Management License (MiFID II)",
    summary:
      "MiFID II compliant investment firm authorization permitting execution, portfolio management, and safeguarding across European financial instruments and FX liquidity.",
    country: "Cyprus",
    licenseType: "BROKERAGE" as const,
    businessType: "BROKERAGE" as const,
    businessStatus: "OPERATING" as const,
    askingPrice: null,
    priceMode: "NDA" as const,
    currency: "USD",
    features: ["MiFID II Passport", "Omnibus Accounts", "MT4/MT5 Integration", "Tier-1 Prime Broker"],
    validated: true,
    regulator: "CySEC",
  },
];

const FEATURED_BUYERS = [
  {
    id: "byr_demo_1",
    name: "Alexander Vance",
    company: "Nordic Fintech Holdings",
    country: "Sweden",
    thesis:
      "Seeking operational EMI and payment institutions with established correspondent accounts to expand cross-border merchant acquiring across Northern Europe.",
    ticketMin: 2000000,
    ticketMax: 8000000,
    currency: "EUR",
    targetCountries: ["Lithuania", "Estonia", "Malta", "Cyprus"],
    targetLicenseTypes: ["E_MONEY" as const, "PAYMENT" as const],
    targetBusinessTypes: ["FINTECH" as const, "PAYMENT_INSTITUTION" as const],
    horizon: "SHORT_TERM" as const,
    verified: true,
  },
  {
    id: "byr_demo_2",
    name: "Marcus Sterling",
    company: "Apex Capital Partners",
    country: "United Kingdom",
    thesis:
      "Institutional private equity mandate seeking pre-launch Tier-2 banking assets or distressed electronic money charters for full recapitalisation and digital core modernisation.",
    ticketMin: 5000000,
    ticketMax: 25000000,
    currency: "USD",
    targetCountries: ["United Kingdom", "Switzerland", "Luxembourg"],
    targetLicenseTypes: ["BANKING" as const, "BROKERAGE" as const],
    targetBusinessTypes: ["BANK" as const],
    horizon: "MEDIUM_TERM" as const,
    verified: true,
  },
];

export default async function Home() {
  const session = await readSession();
  const t = await getTranslations("home");

  return (
    <AppShell
      fullBleed
      user={session ? { id: session.userId, email: session.userId, role: session.role } : null}
    >
      {/* Editorial Broadsheet Hero Section */}
      <HeroEditorial
        t={{
          eyebrow: t("eyebrow"),
          lead: t("lead"),
          ctaPrimary: t("ctaPrimary"),
          ctaSecondary: t("ctaSecondary"),
          proofValidated: t("proofValidated"),
          proofNda: t("proofNda"),
          proofConfidential: t("proofConfidential"),
        }}
      />

      {/* Narrative Stories Stage Pinned on Scroll */}
      <StoriesSection />

      {/* Infinite Dual-Type Marquee 1 */}
      <MarqueeBanner />

      {/* Interactive 3 Pillars Architecture Section */}
      <PillarsSection />

      {/* Featured Market Listings */}
      <section className="py-24 sm:py-32 paper-light border-b border-[#e2ece3]">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-[#e2ece3] pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#2bee4b]" />
                <span className="font-lausanne text-xs font-semibold uppercase tracking-widest text-[#516254]">
                  {t("featuredEyebrow")}
                </span>
              </div>
              <h2 className="font-mondwest text-4xl sm:text-6xl text-[#121613] tracking-tight leading-[0.95]">
                {t("featuredTitle")}
              </h2>
            </div>
            <Link
              href="/assets"
              prefetch={false}
              className="btn-highlighter"
            >
              <span>{t("featuredLink")}</span>
              <PixelArrow />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURED_ASSETS.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>
      </section>

      {/* Dark Institutional Velocity & Stats */}
      <StatsEditorial />

      {/* Institutional Demand / Buyer Mandates */}
      <section className="py-24 sm:py-32 paper-light border-b border-[#e2ece3]">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-[#e2ece3] pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#2bee4b]" />
                <span className="font-lausanne text-xs font-semibold uppercase tracking-widest text-[#516254]">
                  {t("demandEyebrow")}
                </span>
              </div>
              <h2 className="font-mondwest text-4xl sm:text-6xl text-[#121613] tracking-tight leading-[0.95]">
                {t("demandTitle")}
              </h2>
            </div>
            <Link
              href="/buyers"
              prefetch={false}
              className="font-lausanne text-xs font-semibold uppercase tracking-widest text-[#121613] hover:text-[#2bee4b] underline underline-offset-8 transition-colors"
            >
              {t("demandLink")}
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {FEATURED_BUYERS.map((buyer) => (
              <BuyerCard key={buyer.id} buyer={buyer} />
            ))}
          </div>
        </div>
      </section>

      {/* Second Marquee in Dark Theme */}
      <MarqueeBanner dark speed="slow" />
    </AppShell>
  );
}
