# N5Deal Marketplace Prototype

A full-stack, production-grade financial asset and M&A marketplace prototype built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Prisma ORM**, and **PostgreSQL (Neon Serverless)**.

- **Live Deployment**: [https://n5deal-phi.vercel.app](https://n5deal-phi.vercel.app)
- **Repository**: [https://github.com/noderguru/N5Bank](https://github.com/noderguru/N5Bank)

---

## 1. Quick Start & Demo Accounts

### Live Demo Accounts (One-Click Login)
The application includes a zero-friction **One-Click Demo Login** on [`/login`](https://n5deal-phi.vercel.app/login) for all three primary platform roles:

| Role | Demo Identity | Description & Primary Flows |
|------|---------------|-----------------------------|
| **Institutional Buyer** | `buyer@demo` (Alexander Vance, Apex Capital) | Edit investment thesis & target ticket, filter asset catalogue, view match scores, initiate confidential deal threads. |
| **Asset Seller** | `seller@demo` (Elena Rostova, FinTech Ventures) | Publish M&A assets with financial metrics (EBITDA, ARR, Revenue), search buyer directory, negotiate deal terms. |
| **Platform Manager** | `manager@demo` (Compliance & Oversight Ops) | Full governance console: verify participants, review assets, suspend/reinstate bad actors with auditable log cascade. |

*No manual credential typing is required — simply click any role button on `/login`.*

---

## 2. Local Setup from Scratch

### Prerequisites
- **Node.js**: `v20.18.0` or higher
- **npm**: `v10.0.0` or higher
- **PostgreSQL**: A live PostgreSQL instance (e.g. [Neon](https://neon.tech)) or local PostgreSQL.

### Step-by-Step Installation

```bash
# 1. Clone the repository
git clone https://github.com/noderguru/N5Bank.git
cd N5Bank

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
```

Edit `.env` with your database and authentication secrets:

```bash
# Database connection string (PostgreSQL / Neon pooled)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Direct URL for schema migrations and DDL
DIRECT_URL="postgresql://user:password@host/database?sslmode=require"

# 32+ character secret for JWT sessions (e.g. generated via `openssl rand -base64 32`)
AUTH_SECRET="your-secure-random-32-byte-secret"

# Optional: OpenRouter API key for LLM-powered natural language search and listing draft assist
# Note: The app is 100% operational without this key via deterministic rule-based fallbacks.
OPENROUTER_API_KEY="sk-or-v1-..."
OPENROUTER_MODEL="anthropic/claude-3.5-haiku"
```

```bash
# 4. Push schema to database
npm run db:push

# 5. Populate realistic demo dataset (18 users, 47 assets, 12 buyer mandates, deal rooms)
npm run db:seed

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Verification & Quality Gates

The codebase adheres to strict automated testing and type-safety standards:

```bash
# Typecheck TypeScript (strict mode, zero errors)
npm run typecheck

# Run unit and integration test suite (208 tests across 32 suites)
npm run test

# Run end-to-end browser test suite (Playwright with real Chromium)
npm run test:e2e

# Run linter
npm run lint

# Production build test
npm run build
```

---

## 4. Key Architectural Decisions

Rather than selecting technologies for familiarity, every architectural choice in N5Deal was made to resolve specific domain challenges of a confidential M&A marketplace:

### 1. Auditable Soft State over Destructive Deletions
- **Decision**: Participants and assets are never hard-deleted with SQL `DELETE`. Statuses transition through strict states (`ACTIVE`, `SUSPENDED`, `REMOVED`) accompanied by an immutable `ModerationLog`.
- **Rationale**: Real-world M&A platforms require complete counterparty history for legal compliance and anti-fraud audit trails. Hard deletes break active conversation threads, invalidate historical offers, and prevent reversible actions.

### 2. Query-Time Moderation Cascade over Fragile Distributed Writes
- **Decision**: When a platform manager suspends a seller, the system does not execute an update across dozens of individual asset rows. Instead, public discovery queries enforce `asset.seller.status = ACTIVE`.
- **Rationale**: Eliminates race conditions and database drift. Reinstating a verified seller instantly restores their inventory without needing complex rollback operations.

### 3. Nullable Asking Price with Explicit Pricing Modes
- **Decision**: `Asset.askingPrice` is an optional `Decimal`, paired with `priceMode` (`AUCTION`, `NEGOTIABLE`, `ON_DEMAND`, `FIXED`).
- **Rationale**: Unlike consumer e-commerce, high-value institutional transactions frequently transact under strict Non-Disclosure Agreements (NDA) or Letter of Intent (LOI) without public price tags. Forcing a required price would compel sellers to input fake data.

### 4. First-Class In-App Deal Rooms over External `mailto:` Links
- **Decision**: Confidential deal threads and messaging are built directly into the core platform data model (`Conversation` + `Message`).
- **Rationale**: A marketplace that sends counterparties to external email loses engagement, cannot track introduction conversions, and strips compliance managers of the ability to monitor fraudulent activities.

### 5. Data-Access Layer RBAC & Session Security
- **Decision**: Role-Based Access Control is enforced at the data mutation layer inside Server Actions (`lib/auth/guard.ts`) rather than relying solely on UI conditional rendering.
- **Rationale**: Hiding a button is not security. Every server action cryptographically resolves the `jose` JWT session, queries the active status of the user, and validates ownership before modifying data. The session cookie utilizes `httpOnly`, `sameSite: "lax"`, and `secure: true` in production.

### 6. AI Layer with Zero-Downtime Deterministic Fallbacks
- **Decision**: The three AI capabilities (**Buyer ↔ Asset Matching Scorer**, **Natural Language Query Parser**, and **Seller Listing Draft Assist**) are engineered with guaranteed offline fallbacks.
- **Rationale**: If the external AI API encounters rate limits, network timeouts, or invalid keys, the app automatically executes deterministic heuristics (weighted multi-attribute matrix scoring and regex enum parsing) with zero user-facing degradation.

---

## 5. Scope Boundaries & Intentional Simplifications

To deliver a working, thoroughly tested product within a 24-hour development budget, the following boundaries were deliberately set:

- **Escrow & Fiat Payments**: Financial settlement and banking rails are simulated; real escrow requires regulated payments orchestration (e.g. Stripe Treasury / Escrow.com API).
- **File Upload Storage**: File attachments for NDAs are modeled with metadata; cloud S3/R2 presigned upload buckets were omitted in favor of structured data.
- **Real-Time WebSockets**: Polling and server action mutations update message threads reliably across page reloads and cross-tabs; native WebSockets/SSE server was skipped to keep serverless deployment clean and stateless.
- **Email Delivery**: Platform notifications occur in-app through unread badges and deal rooms rather than external SMTP/SendGrid delivery.

---

## 6. AI Tools & Engineering Reflection

This project was developed with transparent AI pair-programming across distinct phases:

### Tooling Breakdown
- **Architecture, Data Modeling & Linear Breakdown**: Claude Code CLI with Claude 3.7 / Opus (high reasoning effort) — used for domain design, Prisma schema normalization, state transitions, and structuring 10 milestones into actionable sub-issues.
- **Core Implementation & Comprehensive Verification**: Antigravity CLI with Gemini 3.8 (~85% of codebase) — used for full-stack Next.js App Router development, Server Actions, shadcn UI components, responsive layout adaptation, and automated Vitest/Playwright test suites.
- **Grok Build / GPT Sol**: Targeted assistance on specific utility algorithms and mock data generation.

### Where Human Oversight Was Essential
- **Responsive Layout & Visual Calibration**: AI models frequently generate flex layouts that overflow on narrow viewports (such as 320px iPhone SE) or netbook screens (1024px). Real browser automated audits with Playwright caught and fixed header container overflows and action button wrapping.
- **Multi-Locale i18n Currency Calibration**: Automated translations often mangle currency sign positioning or pluralization; manual refinement ensured correct formatting for `USD`, `EUR`, and `GBP` across English, Ukrainian, and Russian locales.
- **State Persistence & Cookie Isolation**: Middleware redirects in Next.js require careful cookie clearing between test runs to avoid cross-role authentication bleeding during multi-role E2E tests.

---

## 7. What Would Be Improved with More Time

Given additional time, the platform would be enhanced with:
1. **Live WebSockets / SSE**: Instant bi-directional messaging in deal rooms without page reload or manual refresh.
2. **Interactive Financial Visualizations**: Dynamic cash flow waterfalls and financial valuation charts (Recharts / Visx) in the asset details dossier.
3. **Automated Teaser PDF Export**: One-click generation of branded, confidential M&A one-pager PDF teasers directly from asset data.
4. **Enhanced Micro-Interactions**: Advanced spring physics animations on deal status changes and multi-step stepper transitions.

