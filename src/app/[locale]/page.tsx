import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { readSession } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { RotatingWords } from "@/components/home/rotating-words";
import { AssetCard } from "@/components/marketplace/asset-card";
import { BuyerCard } from "@/components/marketplace/buyer-card";

const FEATURED_ASSETS = [
  {
    id: "ast_demo_1",
    title: "Operating EMI Institution with Direct SEPA & Multi-currency IBANs",
    summary: "Fully operational European Electronic Money Institution with Tier-1 correspondent banking relationships and passporting rights across all EEA member states.",
    country: "Lithuania",
    licenseType: "E_MONEY" as const,
    businessType: "FINTECH" as const,
    businessStatus: "OPERATING" as const,
    askingPrice: 2850000,
    priceMode: "FIXED" as const,
    currency: "EUR",
    features: ["Direct SEPA", "SWIFT Member", "Core Banking API", "Card Issuing BIN"],
    validated: true,
    regulator: "Bank of Lithuania",
  },
  {
    id: "ast_demo_2",
    title: "Licensed Crypto Asset Service Provider (CASP / VASP)",
    summary: "Turnkey digital asset custody and exchange license with compliant KYC/AML procedures, proprietary liquidity connectivity, and active operational bank accounts.",
    country: "Czech Republic",
    licenseType: "CRYPTO" as const,
    businessType: "CRYPTO_BUSINESS" as const,
    businessStatus: "OPERATING" as const,
    askingPrice: null,
    priceMode: "ON_LOI" as const,
    currency: "EUR",
    features: ["Crypto-Fiat Rails", "Custody Infrastructure", "Zero Historical Sanctions"],
    validated: true,
    regulator: "FAU Czechia",
  },
  {
    id: "ast_demo_3",
    title: "Specialised Brokerage & Asset Management License",
    summary: "MiFID II compliant investment firm authorization permitting execution, portfolio management, and custody across European financial instruments.",
    country: "Cyprus",
    licenseType: "BROKERAGE" as const,
    businessType: "BROKERAGE" as const,
    businessStatus: "OPERATING" as const,
    askingPrice: null,
    priceMode: "NDA" as const,
    currency: "USD",
    features: ["MiFID II Passport", "Omnibus Accounts", "MT4/MT5 Integration"],
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
    thesis: "Seeking operational EMI and payment institutions with established correspondent accounts to expand cross-border merchant acquiring across Northern Europe.",
    ticketMin: 2000000,
    ticketMax: 8000000,
    currency: "EUR",
    targetCountries: ["Lithuania", "Estonia", "Malta", "Cyprus"],
    targetLicenseTypes: ["E_MONEY" as const, "PAYMENT" as const],
    targetBusinessTypes: ["FINTECH" as const, "PAYMENT_INSTITUTION" as const],
    horizon: "SHORT_TERM" as const,
  },
  {
    id: "byr_demo_2",
    name: "Marcus Sterling",
    company: "Apex Capital Partners",
    country: "United Kingdom",
    thesis: "Institutional private equity mandate seeking distressed or pre-launch Tier-2 banking assets for full recapitalisation and digital core modernisation.",
    ticketMin: 5000000,
    ticketMax: 25000000,
    currency: "USD",
    targetCountries: ["United Kingdom", "Switzerland", "Luxembourg"],
    targetLicenseTypes: ["BANKING" as const, "BROKERAGE" as const],
    targetBusinessTypes: ["BANK" as const],
    horizon: "MEDIUM_TERM" as const,
  },
];

export default async function Home() {
  const session = await readSession();
  const t = await getTranslations("home");
  const rotatingWords = t.raw("rotatingWords") as string[];

  return (
    <AppShell
      fullBleed
      user={session ? { id: session.userId, email: session.userId, role: session.role } : null}
    >
      {/*
        Night band. Forced dark in both themes — this is the system's photo
        band, and its type must read white whatever the visitor's theme is.
        The nested `dark` class flips the tokens for the whole subtree, so
        descendants keep using var(--ink) instead of hardcoding hexes.
      */}
      <section className="dark relative isolate overflow-hidden bg-canvas">
        <div aria-hidden="true" className="grid-field absolute inset-0" />

        <div
          data-hero
          className="relative mx-auto flex min-h-[86vh] max-w-6xl flex-col justify-center gap-8 px-4 py-24 sm:px-6"
        >
          <span className="eyebrow text-muted-ink">{t("eyebrow")}</span>

          <h1 className="display-xxl max-w-5xl text-ink">
            {t("headlineLead")}{" "}
            <RotatingWords words={rotatingWords} />
          </h1>

          <p className="lead max-w-xl text-muted-ink">{t("lead")}</p>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            {/* One ghost pill per band — the only marketing CTA in the system. */}
            <Link href="/assets" prefetch={false} className="cta-ghost caps text-ink">
              <span>{t("ctaPrimary")}</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/buyers"
              prefetch={false}
              className="caps text-muted-ink underline underline-offset-8 transition-colors hover:text-ink"
            >
              {t("ctaSecondary")}
            </Link>
          </div>

          <ul className="flex flex-wrap gap-x-10 gap-y-3 border-t border-hairline pt-6 eyebrow text-muted-ink">
            <li>{t("proofValidated")}</li>
            <li>{t("proofNda")}</li>
            <li>{t("proofConfidential")}</li>
          </ul>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <section data-reveal className="py-20">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-5">
            <div className="space-y-2">
              <span className="eyebrow text-muted-ink">{t("featuredEyebrow")}</span>
              <h2 className="display-lg text-ink">{t("featuredTitle")}</h2>
            </div>
            <Link
              href="/assets"
              prefetch={false}
              className="caps text-ink underline underline-offset-8 transition-opacity hover:opacity-60"
            >
              {t("featuredLink")}
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-px bg-hairline md:grid-cols-2 lg:grid-cols-3">
            {FEATURED_ASSETS.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </section>

        <section data-reveal className="py-20">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-5">
            <div className="space-y-2">
              <span className="eyebrow text-muted-ink">{t("demandEyebrow")}</span>
              <h2 className="display-lg text-ink">{t("demandTitle")}</h2>
            </div>
            <Link
              href="/buyers"
              prefetch={false}
              className="caps text-ink underline underline-offset-8 transition-opacity hover:opacity-60"
            >
              {t("demandLink")}
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-px bg-hairline md:grid-cols-2">
            {FEATURED_BUYERS.map((buyer) => (
              <BuyerCard key={buyer.id} buyer={buyer} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
