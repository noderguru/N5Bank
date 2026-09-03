import "dotenv/config";

import { hashSync } from "bcryptjs";
import {
  AssetStatus,
  BusinessStatus,
  BusinessType,
  InvestmentHorizon,
  LicenseType,
  ModerationAction,
  ModerationTarget,
  PriceMode,
  PrismaClient,
  UserRole,
  UserStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo123";
const FIXED_BCRYPT_SALT = "$2b$10$abcdefghijklmnopqrstuu";
const passwordHash = hashSync(DEMO_PASSWORD, FIXED_BCRYPT_SALT);

const countries = [
  { name: "Germany", currency: "EUR", regulator: "BaFin" },
  { name: "Lithuania", currency: "EUR", regulator: "Bank of Lithuania" },
  { name: "United Kingdom", currency: "GBP", regulator: "FCA" },
  { name: "Switzerland", currency: "CHF", regulator: "FINMA" },
  { name: "Poland", currency: "EUR", regulator: "KNF" },
  { name: "Spain", currency: "EUR", regulator: "Bank of Spain" },
  { name: "Brazil", currency: "USD", regulator: "Central Bank of Brazil" },
  { name: "Singapore", currency: "USD", regulator: "MAS" },
  { name: "United Arab Emirates", currency: "USD", regulator: "FSRA" },
  { name: "Canada", currency: "USD", regulator: "FINTRAC" },
] as const;

const licenseTypes = [
  LicenseType.BANKING,
  LicenseType.E_MONEY,
  LicenseType.PAYMENT,
  LicenseType.CRYPTO,
  LicenseType.BROKERAGE,
  LicenseType.INSURANCE,
  LicenseType.OTHER,
] as const;

const businessTypes = [
  BusinessType.BANK,
  BusinessType.FINTECH,
  BusinessType.PAYMENT_INSTITUTION,
  BusinessType.CRYPTO_BUSINESS,
  BusinessType.BROKERAGE,
  BusinessType.INSURANCE_COMPANY,
  BusinessType.OTHER,
] as const;

const businessStatuses = [
  BusinessStatus.OPERATING,
  BusinessStatus.PRE_LAUNCH,
  BusinessStatus.DORMANT,
  BusinessStatus.DISTRESSED,
] as const;

const sellerIds = [
  "usr_seller_demo",
  "usr_seller_02",
  "usr_seller_03",
  "usr_seller_04",
  "usr_seller_suspended",
] as const;

const buyerProfiles = [
  {
    id: "usr_buyer_demo",
    name: "Alex Morgan",
    email: "buyer@demo",
    company: "Northstar Capital",
    country: "United Kingdom",
    thesis: "Regulated European payment and banking businesses with recurring B2B revenue.",
    ticketMin: "1000000",
    ticketMax: "8000000",
    currency: "EUR",
    targetCountries: ["Germany", "Lithuania", "United Kingdom"],
    targetLicenseTypes: [LicenseType.BANKING, LicenseType.E_MONEY, LicenseType.PAYMENT],
    targetBusinessTypes: [BusinessType.BANK, BusinessType.FINTECH, BusinessType.PAYMENT_INSTITUTION],
    horizon: InvestmentHorizon.MEDIUM_TERM,
  },
  {
    id: "usr_buyer_02",
    name: "Sofia Weber",
    email: "sofia.weber@n5deal.demo",
    company: "Rhein Growth Partners",
    country: "Germany",
    thesis: "Profitable fintech infrastructure serving regulated institutions in the DACH region.",
    ticketMin: "3000000",
    ticketMax: "15000000",
    currency: "EUR",
    targetCountries: ["Germany", "Switzerland", "Poland"],
    targetLicenseTypes: [LicenseType.PAYMENT, LicenseType.BROKERAGE],
    targetBusinessTypes: [BusinessType.FINTECH, BusinessType.BROKERAGE],
    horizon: InvestmentHorizon.LONG_TERM,
  },
  {
    id: "usr_buyer_03",
    name: "Marta Jankowska",
    email: "marta.jankowska@n5deal.demo",
    company: "Vistula Ventures",
    country: "Poland",
    thesis: "Early-stage payment institutions and e-money platforms ready for European expansion.",
    ticketMin: "500000",
    ticketMax: "4000000",
    currency: "EUR",
    targetCountries: ["Poland", "Lithuania", "Spain"],
    targetLicenseTypes: [LicenseType.E_MONEY, LicenseType.PAYMENT],
    targetBusinessTypes: [BusinessType.PAYMENT_INSTITUTION, BusinessType.FINTECH],
    horizon: InvestmentHorizon.SHORT_TERM,
  },
  {
    id: "usr_buyer_04",
    name: "Lucas Almeida",
    email: "lucas.almeida@n5deal.demo",
    company: "Aurora LatAm Holdings",
    country: "Brazil",
    thesis: "Licensed financial platforms connecting Latin American merchants with global markets.",
    ticketMin: "2000000",
    ticketMax: "12000000",
    currency: "USD",
    targetCountries: ["Brazil", "Canada", "United States"],
    targetLicenseTypes: [LicenseType.PAYMENT, LicenseType.BANKING],
    targetBusinessTypes: [BusinessType.PAYMENT_INSTITUTION, BusinessType.BANK],
    horizon: InvestmentHorizon.LONG_TERM,
  },
  {
    id: "usr_buyer_05",
    name: "Mei Lin",
    email: "mei.lin@n5deal.demo",
    company: "Straits Digital Assets",
    country: "Singapore",
    thesis: "Compliance-led digital asset and brokerage platforms across Asia-Pacific.",
    ticketMin: "4000000",
    ticketMax: "20000000",
    currency: "USD",
    targetCountries: ["Singapore", "United Arab Emirates", "Canada"],
    targetLicenseTypes: [LicenseType.CRYPTO, LicenseType.BROKERAGE],
    targetBusinessTypes: [BusinessType.CRYPTO_BUSINESS, BusinessType.BROKERAGE],
    horizon: InvestmentHorizon.MEDIUM_TERM,
  },
  {
    id: "usr_buyer_06",
    name: "Daniel Rossi",
    email: "daniel.rossi@n5deal.demo",
    company: "Meridian Insurance Group",
    country: "Switzerland",
    thesis: "Specialty insurance carriers and distribution technology with defensible licences.",
    ticketMin: "5000000",
    ticketMax: "30000000",
    currency: "EUR",
    targetCountries: ["Switzerland", "Germany", "United Kingdom"],
    targetLicenseTypes: [LicenseType.INSURANCE],
    targetBusinessTypes: [BusinessType.INSURANCE_COMPANY, BusinessType.FINTECH],
    horizon: InvestmentHorizon.LONG_TERM,
  },
  {
    id: "usr_buyer_07",
    name: "Emma Clarke",
    email: "emma.clarke@n5deal.demo",
    company: "Harbour Bridge Capital",
    country: "Canada",
    thesis: "Cash-generative financial services businesses with clear regulatory standing.",
    ticketMin: "10000000",
    ticketMax: "50000000",
    currency: "USD",
    targetCountries: ["Canada", "United Kingdom", "Germany"],
    targetLicenseTypes: [LicenseType.BANKING, LicenseType.INSURANCE],
    targetBusinessTypes: [BusinessType.BANK, BusinessType.INSURANCE_COMPANY],
    horizon: InvestmentHorizon.FLEXIBLE,
  },
  {
    id: "usr_buyer_08",
    name: "Omar Al Mansoori",
    email: "omar.almansoori@n5deal.demo",
    company: "Falcon Strategic Investments",
    country: "United Arab Emirates",
    thesis: "Cross-border payments and digital brokerage platforms serving the MENA region.",
    ticketMin: "3000000",
    ticketMax: "18000000",
    currency: "USD",
    targetCountries: ["United Arab Emirates", "Singapore", "United Kingdom"],
    targetLicenseTypes: [LicenseType.PAYMENT, LicenseType.BROKERAGE],
    targetBusinessTypes: [BusinessType.PAYMENT_INSTITUTION, BusinessType.BROKERAGE],
    horizon: InvestmentHorizon.MEDIUM_TERM,
  },
  {
    id: "usr_buyer_09",
    name: "Elena García",
    email: "elena.garcia@n5deal.demo",
    company: "Iberia Fintech Partners",
    country: "Spain",
    thesis: "Consumer and SME fintech products with licences that support EU passporting.",
    ticketMin: "750000",
    ticketMax: "6000000",
    currency: "EUR",
    targetCountries: ["Spain", "Lithuania", "Poland"],
    targetLicenseTypes: [LicenseType.E_MONEY, LicenseType.PAYMENT],
    targetBusinessTypes: [BusinessType.FINTECH, BusinessType.PAYMENT_INSTITUTION],
    horizon: InvestmentHorizon.SHORT_TERM,
  },
  {
    id: "usr_buyer_10",
    name: "Thomas Müller",
    email: "thomas.mueller@n5deal.demo",
    company: "Alpine Consolidators",
    country: "Germany",
    thesis: "Subscale regulated banks and brokers suitable for operational consolidation.",
    ticketMin: "8000000",
    ticketMax: "40000000",
    currency: "EUR",
    targetCountries: ["Germany", "Switzerland", "United Kingdom"],
    targetLicenseTypes: [LicenseType.BANKING, LicenseType.BROKERAGE],
    targetBusinessTypes: [BusinessType.BANK, BusinessType.BROKERAGE],
    horizon: InvestmentHorizon.LONG_TERM,
  },
  {
    id: "usr_buyer_11",
    name: "Priya Nair",
    email: "priya.nair@n5deal.demo",
    company: "Continuum Digital Finance",
    country: "Singapore",
    thesis: "API-first regulated infrastructure for embedded finance and treasury products.",
    ticketMin: "1500000",
    ticketMax: "10000000",
    currency: "USD",
    targetCountries: ["Singapore", "Lithuania", "Canada"],
    targetLicenseTypes: [LicenseType.E_MONEY, LicenseType.PAYMENT, LicenseType.OTHER],
    targetBusinessTypes: [BusinessType.FINTECH, BusinessType.OTHER],
    horizon: InvestmentHorizon.MEDIUM_TERM,
  },
  {
    id: "usr_buyer_12",
    name: "James Bennett",
    email: "james.bennett@n5deal.demo",
    company: "Crown Alternative Assets",
    country: "United Kingdom",
    thesis: "Special situations in dormant or distressed regulated financial businesses.",
    ticketMin: "250000",
    ticketMax: "5000000",
    currency: "GBP",
    targetCountries: ["United Kingdom", "Spain", "Poland"],
    targetLicenseTypes: [LicenseType.OTHER, LicenseType.INSURANCE, LicenseType.BROKERAGE],
    targetBusinessTypes: [BusinessType.OTHER, BusinessType.INSURANCE_COMPANY, BusinessType.BROKERAGE],
    horizon: InvestmentHorizon.FLEXIBLE,
  },
] as const;

function assetStatus(index: number) {
  if (index % 19 === 0) return AssetStatus.REMOVED;
  if (index % 17 === 0) return AssetStatus.SUSPENDED;
  if (index % 13 === 0) return AssetStatus.DRAFT;
  return AssetStatus.PUBLISHED;
}

function priceMode(index: number) {
  if (index % 11 === 0) return PriceMode.NDA;
  if (index % 6 === 0) return PriceMode.ON_LOI;
  return PriceMode.FIXED;
}

function cycle<T>(values: readonly T[], index: number): T {
  const value = values[index % values.length];

  if (value === undefined) {
    throw new Error("Cannot cycle through an empty seed collection.");
  }

  return value;
}

function buildAssets() {
  return Array.from({ length: 40 }, (_, offset) => {
    const index = offset + 1;
    const country = cycle(countries, offset);
    const licenseType = cycle(licenseTypes, offset);
    const businessType = cycle(businessTypes, offset * 2);
    const mode = priceMode(index);
    const price = 450_000 + ((index * 725_000) % 18_000_000);

    return {
      id: `asset_${String(index).padStart(2, "0")}`,
      sellerId: cycle(sellerIds, offset),
      title: `${country.name} ${licenseType.replaceAll("_", " ").toLowerCase()} opportunity`,
      summary: `A regulated ${businessType.replaceAll("_", " ").toLowerCase()} business operating from ${country.name}.`,
      description: `Established financial-services platform supervised by ${country.regulator}. The business is presented with enough operating context for an initial acquisition review.`,
      country: country.name,
      licenseType,
      businessType,
      businessStatus: cycle(businessStatuses, offset),
      askingPrice: mode === PriceMode.FIXED ? String(price) : null,
      priceMode: mode,
      currency: country.currency,
      yearOfIssue: 2004 + (index % 20),
      employees: 8 + ((index * 7) % 180),
      regulator: country.regulator,
      features: [
        "Regulated operation",
        index % 2 === 0 ? "Remote onboarding" : "Established client portfolio",
        index % 3 === 0 ? "Multi-currency accounts" : "Documented compliance process",
      ],
      status: assetStatus(index),
      validated: index % 4 !== 0,
      views: 35 + ((index * 137) % 2400),
    };
  });
}

async function clearDatabase() {
  await prisma.$transaction([
    prisma.message.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.moderationLog.deleteMany(),
    prisma.asset.deleteMany(),
    prisma.buyerProfile.deleteMany(),
    prisma.sellerProfile.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function seedUsers() {
  await prisma.user.createMany({
    data: [
      {
        id: "usr_manager_demo",
        email: "manager@demo",
        passwordHash,
        role: UserRole.MANAGER,
        status: UserStatus.ACTIVE,
        name: "Morgan Reed",
      },
      {
        id: "usr_seller_demo",
        email: "seller@demo",
        passwordHash,
        role: UserRole.SELLER,
        status: UserStatus.ACTIVE,
        name: "Olivia Hart",
      },
      {
        id: "usr_seller_02",
        email: "seller.europe@n5deal.demo",
        passwordHash,
        role: UserRole.SELLER,
        status: UserStatus.ACTIVE,
        name: "Leon Fischer",
      },
      {
        id: "usr_seller_03",
        email: "seller.global@n5deal.demo",
        passwordHash,
        role: UserRole.SELLER,
        status: UserStatus.ACTIVE,
        name: "Aisha Rahman",
      },
      {
        id: "usr_seller_04",
        email: "seller.americas@n5deal.demo",
        passwordHash,
        role: UserRole.SELLER,
        status: UserStatus.ACTIVE,
        name: "Mateo Silva",
      },
      {
        id: "usr_seller_suspended",
        email: "seller.suspended@n5deal.demo",
        passwordHash,
        role: UserRole.SELLER,
        status: UserStatus.SUSPENDED,
        name: "Risk Review Account",
      },
      ...buyerProfiles.map((buyer) => ({
        id: buyer.id,
        email: buyer.email,
        passwordHash,
        role: UserRole.BUYER,
        status: UserStatus.ACTIVE,
        name: buyer.name,
      })),
    ],
  });

  await prisma.sellerProfile.createMany({
    data: [
      { userId: "usr_seller_demo", company: "Hart Financial Ventures", country: "United Kingdom", website: "https://example.com/hart", bio: "Owner-operator of regulated financial businesses.", verified: true },
      { userId: "usr_seller_02", company: "Fischer Fintech Holdings", country: "Germany", website: "https://example.com/fischer", bio: "European fintech portfolio company.", verified: true },
      { userId: "usr_seller_03", company: "Atlas Regulated Markets", country: "Singapore", website: "https://example.com/atlas", bio: "Cross-border financial-services operator.", verified: true },
      { userId: "usr_seller_04", company: "Silva Digital Finance", country: "Brazil", website: "https://example.com/silva", bio: "Latin American payments group.", verified: false },
      { userId: "usr_seller_suspended", company: "Legacy Licence Trading", country: "Poland", bio: "Account under platform compliance review.", verified: false },
    ],
  });

  await prisma.buyerProfile.createMany({
    data: buyerProfiles.map((buyer) => ({
      userId: buyer.id,
      company: buyer.company,
      country: buyer.country,
      thesis: buyer.thesis,
      ticketMin: buyer.ticketMin,
      ticketMax: buyer.ticketMax,
      currency: buyer.currency,
      targetCountries: [...buyer.targetCountries],
      targetLicenseTypes: [...buyer.targetLicenseTypes],
      targetBusinessTypes: [...buyer.targetBusinessTypes],
      horizon: buyer.horizon,
    })),
  });
}

async function seedConversations() {
  const conversations = [
    {
      id: "conversation_01",
      assetId: "asset_01",
      buyerId: "usr_buyer_demo",
      sellerId: "usr_seller_demo",
      messages: [
        ["usr_buyer_demo", "Could you share the current regulatory scope and last audit date?"],
        ["usr_seller_demo", "The licence scope is documented and the latest external audit closed in March."],
      ],
    },
    {
      id: "conversation_02",
      assetId: "asset_08",
      buyerId: "usr_buyer_03",
      sellerId: "usr_seller_03",
      messages: [
        ["usr_buyer_03", "Is passporting into the EEA included in the transaction perimeter?"],
        ["usr_seller_03", "Yes, the data room includes the current passporting notifications."],
      ],
    },
    {
      id: "conversation_03",
      assetId: null,
      buyerId: "usr_buyer_08",
      sellerId: "usr_seller_02",
      messages: [
        ["usr_seller_02", "Your acquisition thesis looks aligned with two upcoming payment opportunities."],
        ["usr_buyer_08", "Please send the high-level country and ticket-size details."],
      ],
    },
  ] as const;

  for (const conversation of conversations) {
    await prisma.conversation.create({
      data: {
        id: conversation.id,
        assetId: conversation.assetId,
        buyerId: conversation.buyerId,
        sellerId: conversation.sellerId,
        messages: {
          create: conversation.messages.map(([senderId, body], index) => ({
            id: `${conversation.id}_message_${index + 1}`,
            senderId,
            body,
            readAt: index === 0 ? new Date("2026-09-01T12:00:00.000Z") : null,
          })),
        },
      },
    });
  }
}

async function validateSeed() {
  const [assetCount, buyerCount, conversationCount, licenceGroups, businessGroups, countryGroups, demoBuyer, assets] = await Promise.all([
    prisma.asset.count(),
    prisma.buyerProfile.count(),
    prisma.conversation.count(),
    prisma.asset.groupBy({ by: ["licenseType"], _count: true }),
    prisma.asset.groupBy({ by: ["businessType"], _count: true }),
    prisma.asset.groupBy({ by: ["country"], _count: true }),
    prisma.buyerProfile.findUniqueOrThrow({ where: { userId: "usr_buyer_demo" } }),
    prisma.asset.findMany({ where: { status: AssetStatus.PUBLISHED } }),
  ]);

  if (assetCount !== 40 || buyerCount !== 12 || conversationCount < 3) {
    throw new Error("Seed counts do not match the demo contract.");
  }

  if (
    licenceGroups.length !== licenseTypes.length ||
    businessGroups.length !== businessTypes.length ||
    countryGroups.length !== countries.length
  ) {
    throw new Error("One or more catalogue filter facets are empty.");
  }

  const scores = assets.map((asset) => {
    let score = 0;
    if (demoBuyer.targetCountries.includes(asset.country)) score += 35;
    if (demoBuyer.targetLicenseTypes.includes(asset.licenseType)) score += 25;
    if (demoBuyer.targetBusinessTypes.includes(asset.businessType)) score += 20;
    if (asset.askingPrice && asset.askingPrice.gte(demoBuyer.ticketMin ?? 0) && asset.askingPrice.lte(demoBuyer.ticketMax ?? 0)) score += 15;
    if (asset.validated) score += 5;
    return score;
  });

  if (new Set(scores).size < 5) {
    throw new Error("Demo matching inputs do not produce enough score diversity.");
  }

  console.log(`Seeded ${assetCount} assets, ${buyerCount} buyers, and ${conversationCount} conversations.`);
  console.log(`Demo credentials: buyer@demo, seller@demo, manager@demo / ${DEMO_PASSWORD}`);
  console.log(`Matching sanity check: ${new Set(scores).size} distinct scores.`);
}

async function main() {
  await clearDatabase();
  await seedUsers();
  await prisma.asset.createMany({ data: buildAssets() });
  await prisma.favorite.createMany({
    data: [
      { userId: "usr_buyer_demo", assetId: "asset_01" },
      { userId: "usr_buyer_demo", assetId: "asset_03" },
      { userId: "usr_buyer_05", assetId: "asset_12" },
    ],
  });
  await seedConversations();
  await prisma.moderationLog.createMany({
    data: [
      {
        id: "moderation_01",
        actorId: "usr_manager_demo",
        targetType: ModerationTarget.USER,
        targetId: "usr_seller_suspended",
        action: ModerationAction.SUSPEND,
        reason: "Ownership documentation could not be verified during the platform review.",
      },
      {
        id: "moderation_02",
        actorId: "usr_manager_demo",
        targetType: ModerationTarget.ASSET,
        targetId: "asset_17",
        action: ModerationAction.SUSPEND,
        reason: "Listing claims require additional regulatory evidence.",
      },
    ],
  });
  await validateSeed();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
