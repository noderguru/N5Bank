import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-hairline bg-surface/80">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand & Intro */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-lg bg-brand text-surface font-black text-xs">
                N5
              </div>
              <span className="text-base font-bold tracking-tight text-ink">N5Deal</span>
              <span className="rounded-full bg-tint px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
                M&A Platform
              </span>
            </div>

            <p className="max-w-md text-xs text-muted-foreground leading-relaxed">
              Curated introduction platform for financial licenses, operational payment institutions, and regulated fintech entities across Europe, the Americas, and Asia.
            </p>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
              <ShieldCheck className="size-4 text-brand" />
              <span>Strict bilateral NDAs & LOI escrow coordination</span>
            </div>
          </div>

          {/* Directory Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink">Marketplace</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/assets?license=E_MONEY" className="hover:text-brand transition-colors">
                  EMI & Payment Licences
                </Link>
              </li>
              <li>
                <Link href="/assets?license=BANKING" className="hover:text-brand transition-colors">
                  Banking & Credit Institutions
                </Link>
              </li>
              <li>
                <Link href="/assets?license=CRYPTO" className="hover:text-brand transition-colors">
                  Crypto & VASP Entities
                </Link>
              </li>
              <li>
                <Link href="/buyers" className="hover:text-brand transition-colors">
                  Institutional Buyer Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Regulatory & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink">Compliance</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/#faq" className="hover:text-brand transition-colors">
                  Verification Standards
                </Link>
              </li>
              <li>
                <Link href="/#escrow" className="hover:text-brand transition-colors">
                  Escrow Protocol
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-brand transition-colors">
                  Seller Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-brand transition-colors">
                  Investor Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="mt-12 border-t border-hairline pt-6 text-[11px] text-muted-foreground space-y-3">
          <p className="leading-relaxed">
            Regulatory Notice: N5Deal is an introductions platform and does not act as a licensed broker-dealer, investment advisor, or custodian. Listings do not constitute an offer to buy or sell securities. Deal terms, escrow conditions, and regulatory notifications are subject to local jurisdictional compliance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-hairline/60">
            <div>© {new Date().getFullYear()} N5Deal Marketplace. Built with Next.js 15, Neon PostgreSQL & Prisma.</div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hover:text-brand">Sign in</Link>
              <Link href="/register" className="hover:text-brand">Register</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
