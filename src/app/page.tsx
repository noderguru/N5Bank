import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Sparkles } from "lucide-react";
import { readSession } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { AssetCard } from "@/components/marketplace/asset-card";
import { BuyerCard } from "@/components/marketplace/buyer-card";
import { Button } from "@/components/ui/button";

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

  return (
    <AppShell user={session ? { id: session.userId, email: session.userId, role: session.role } : null}>
      {/* Hero Section */}
      <section className="py-12 md:py-20 text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3.5 py-1 text-xs font-semibold text-muted-foreground shadow-2xs">
          <Sparkles className="size-3.5 text-brand" />
          <span>Curated M&amp;A for Regulated Financial Assets</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl leading-[1.08]">
          Institutional marketplace for banking, payment &amp; fintech licences.
        </h1>

        <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Direct bilateral acquisitions, verified balance sheets, and LOI escrow coordination. Connecting qualified institutional buyers with licensed entities worldwide.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button asChild size="lg" className="h-11 rounded-full bg-brand px-6 text-sm font-semibold text-surface hover:bg-brand/90 shadow-xs">
            <Link href="/assets" prefetch={false}>
              <span>Explore Marketplace</span>
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-11 rounded-full border-hairline bg-surface px-6 text-sm font-semibold text-ink hover:bg-canvas">
            <Link href="/buyers" prefetch={false}>View Buyer Directory</Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-success" />
            <span>100% Validated Sellers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="size-4 text-brand" />
            <span>Bilateral NDA Workflows</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-success" />
            <span>Zero Public Balance Leaks</span>
          </div>
        </div>
      </section>

      {/* Featured Opportunities Section */}
      <section className="py-10 space-y-6">
        <div className="flex items-end justify-between border-b border-hairline pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand">Featured Assets</span>
            <h2 className="text-2xl font-bold tracking-tight text-ink mt-0.5">
              Available Financial Institutions
            </h2>
          </div>
          <Button asChild variant="ghost" className="text-xs font-semibold text-brand hover:text-brand-hover">
            <Link href="/assets" prefetch={false}>View all listings &rarr;</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURED_ASSETS.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </section>

      {/* Institutional Buyers Section */}
      <section className="py-10 space-y-6">
        <div className="flex items-end justify-between border-b border-hairline pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand">Verified Demand</span>
            <h2 className="text-2xl font-bold tracking-tight text-ink mt-0.5">
              Active Institutional Mandates
            </h2>
          </div>
          <Button asChild variant="ghost" className="text-xs font-semibold text-brand hover:text-brand-hover">
            <Link href="/buyers" prefetch={false}>View all mandates &rarr;</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {FEATURED_BUYERS.map((buyer) => (
            <BuyerCard key={buyer.id} buyer={buyer} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
