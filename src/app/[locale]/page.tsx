import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { HeroEditorial } from "@/components/home/hero-editorial";
import { StoriesSection } from "@/components/home/stories-section";
import { MarqueeBanner } from "@/components/home/marquee-banner";
import { PillarsSection } from "@/components/home/pillars-section";
import { StatsEditorial } from "@/components/home/stats-editorial";
import { AssetCard, type AssetCardData } from "@/components/marketplace/asset-card";
import { BuyerCard, type BuyerCardData } from "@/components/marketplace/buyer-card";
import { PixelArrow } from "@/components/layout/candlestick";

const FALLBACK_FEATURED_ASSETS: AssetCardData[] = [
  {
    id: "asset_01",
    title: "Germany banking opportunity",
    summary: "A regulated bank business operating from Germany.",
    country: "Germany",
    licenseType: "BANKING",
    businessType: "BANK",
    businessStatus: "OPERATING",
    askingPrice: 1175000,
    priceMode: "FIXED",
    currency: "EUR",
    features: ["Regulated operation", "Established client portfolio", "Documented compliance process"],
    validated: true,
    regulator: "BaFin",
  },
  {
    id: "asset_02",
    title: "Lithuania e money opportunity",
    summary: "A regulated payment institution business operating from Lithuania.",
    country: "Lithuania",
    licenseType: "E_MONEY",
    businessType: "PAYMENT_INSTITUTION",
    businessStatus: "PRE_LAUNCH",
    askingPrice: 1900000,
    priceMode: "FIXED",
    currency: "EUR",
    features: ["Regulated operation", "Remote onboarding", "Documented compliance process"],
    validated: true,
    regulator: "Bank of Lithuania",
  },
  {
    id: "asset_03",
    title: "United Kingdom payment opportunity",
    summary: "A regulated brokerage business operating from United Kingdom.",
    country: "United Kingdom",
    licenseType: "PAYMENT",
    businessType: "BROKERAGE",
    businessStatus: "DORMANT",
    askingPrice: 2625000,
    priceMode: "FIXED",
    currency: "GBP",
    features: ["Regulated operation", "Established client portfolio", "Multi-currency accounts"],
    validated: true,
    regulator: "FCA",
  },
];

const FALLBACK_FEATURED_BUYERS: BuyerCardData[] = [
  {
    id: "usr_buyer_02",
    name: "Sofia Weber",
    company: "Rhein Growth Partners",
    country: "Germany",
    thesis: "Profitable fintech infrastructure serving regulated institutions in the DACH region.",
    ticketMin: 3000000,
    ticketMax: 15000000,
    currency: "EUR",
    targetCountries: ["Germany", "Switzerland", "Poland"],
    targetLicenseTypes: ["PAYMENT", "BROKERAGE"],
    targetBusinessTypes: ["FINTECH", "BROKERAGE"],
    horizon: "LONG_TERM",
    verified: true,
  },
  {
    id: "usr_buyer_03",
    name: "Marta Jankowska",
    company: "Vistula Ventures",
    country: "Poland",
    thesis: "Early-stage payment institutions and e-money platforms ready for European expansion.",
    ticketMin: 500000,
    ticketMax: 4000000,
    currency: "EUR",
    targetCountries: ["Poland", "Lithuania", "Spain"],
    targetLicenseTypes: ["E_MONEY", "PAYMENT"],
    targetBusinessTypes: ["PAYMENT_INSTITUTION", "FINTECH"],
    horizon: "SHORT_TERM",
    verified: true,
  },
];

export default async function Home() {
  const session = await readSession();
  const t = await getTranslations("home");

  let featuredAssets: AssetCardData[] = [];
  let featuredBuyers: BuyerCardData[] = [];

  try {
    const dbAssets = await prisma.asset.findMany({
      where: {
        status: "PUBLISHED",
        seller: {
          status: "ACTIVE",
        },
      },
      orderBy: [
        { validated: "desc" },
        { views: "desc" },
        { createdAt: "desc" },
      ],
      take: 3,
      select: {
        id: true,
        title: true,
        summary: true,
        country: true,
        licenseType: true,
        businessType: true,
        businessStatus: true,
        askingPrice: true,
        priceMode: true,
        currency: true,
        features: true,
        validated: true,
        views: true,
        regulator: true,
      },
    });

    if (dbAssets.length > 0) {
      featuredAssets = dbAssets.map((asset) => ({
        id: asset.id,
        title: asset.title,
        summary: asset.summary,
        country: asset.country,
        licenseType: asset.licenseType,
        businessType: asset.businessType,
        businessStatus: asset.businessStatus,
        askingPrice: asset.askingPrice ? Number(asset.askingPrice) : null,
        priceMode: asset.priceMode,
        currency: asset.currency,
        features: asset.features,
        validated: asset.validated,
        views: asset.views,
        regulator: asset.regulator,
      }));
    }

    const dbBuyers = await prisma.buyerProfile.findMany({
      where: {
        user: {
          status: "ACTIVE",
        },
      },
      take: 2,
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (dbBuyers.length > 0) {
      featuredBuyers = dbBuyers.map((buyer) => ({
        id: buyer.userId,
        name: buyer.user.name,
        company: buyer.company,
        country: buyer.country,
        thesis: buyer.thesis,
        ticketMin: buyer.ticketMin ? Number(buyer.ticketMin) : null,
        ticketMax: buyer.ticketMax ? Number(buyer.ticketMax) : null,
        currency: buyer.currency,
        targetCountries: buyer.targetCountries,
        targetLicenseTypes: buyer.targetLicenseTypes,
        targetBusinessTypes: buyer.targetBusinessTypes,
        horizon: buyer.horizon,
        verified: true,
      }));
    }
  } catch (err) {
    console.error("[Home] Error fetching featured data from database:", err);
  }

  if (featuredAssets.length === 0) {
    featuredAssets = FALLBACK_FEATURED_ASSETS;
  }

  if (featuredBuyers.length === 0) {
    featuredBuyers = FALLBACK_FEATURED_BUYERS;
  }

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
          heroLine1: t("heroLine1"),
          heroLine2: t("heroLine2"),
          heroLine3: t("heroLine3"),
          heroLine4: t("heroLine4"),
          platformVolumeLabel: t("platformVolumeLabel"),
          platformVolumeSub: t("platformVolumeSub"),
          globalReachLabel: t("globalReachLabel"),
          globalReachSub: t("globalReachSub"),
          verificationLabel: t("verificationLabel"),
          confidentialityLabel: t("confidentialityLabel"),
          viewBuyerDirectory: t("viewBuyerDirectory"),
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
            {featuredAssets.map((asset) => (
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
            {featuredBuyers.map((buyer) => (
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
