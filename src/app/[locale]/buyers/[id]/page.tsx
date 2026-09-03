import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Building2, CheckCircle2, Globe, Shield, Tag } from "lucide-react";
import { readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { ContactBuyerButton } from "@/components/marketplace/contact-buyer-button";
import { getLocale, getTranslations } from "next-intl/server";
import { formatTicketRange } from "@/lib/formatters";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const buyer = await prisma.buyerProfile.findUnique({
    where: { userId: id },
    include: { user: { select: { name: true } } },
  });

  return {
    title: buyer ? `${buyer.company} — Institutional Mandate | N5Deal` : "Buyer Mandate | N5Deal",
    description: buyer?.thesis || "Institutional buyer acquisition mandate profile.",
  };
}

export default async function BuyerDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await readSession();
  const locale = await getLocale();
  const t = await getTranslations("buyerDetail");
  const tCommon = await getTranslations("common");
  const tEnums = await getTranslations("enums");
  const enumLabel = (group: string, value: string) => tEnums(`${group}.${value}`);
  const ticketLabels = {
    flexible: tCommon("flexibleTicket"),
    from: (amount: string) => tCommon("from", { amount }),
    upTo: (amount: string) => tCommon("upTo", { amount }),
  };

  const buyer = await prisma.buyerProfile.findUnique({
    where: { userId: id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!buyer) {
    notFound();
  }

  const isSuspended = buyer.user.status === "SUSPENDED" || buyer.user.status === "REMOVED";
  const ticketDisplay = formatTicketRange(
    buyer.ticketMin ? Number(buyer.ticketMin) : null,
    buyer.ticketMax ? Number(buyer.ticketMax) : null,
    buyer.currency,
    locale,
    ticketLabels
  );

  return (
    <AppShell
      user={
        session
          ? { id: session.userId, email: session.userId, role: session.role }
          : null
      }
    >
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/buyers"
            className="inline-flex items-center text-xs font-semibold text-neutral-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Buyer Directory
          </Link>
        </div>

        {/* Suspended Alert Banner */}
        {isSuspended && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
              <Shield className="h-4 w-4 text-amber-700" />
              <span>{t("complianceReview")}</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              This institutional buyer account is currently suspended by platform moderation. New bilateral conversations cannot be initiated.
            </p>
          </div>
        )}

        {/* Main Profile Header Card */}
        <div className="rounded-[24px] border border-[#D9D9D9] bg-white p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-[#D9D9D9] pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4F9FF] text-[#383BFE] border border-[#E7F3FF]">
                  <Building2 className="h-5 w-5" />
                </span>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                    {buyer.company}
                  </h1>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                    <span className="font-medium text-neutral-800">{buyer.user.name}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {buyer.country}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified Acquirer
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sm:text-right space-y-1 shrink-0">
              <span className="text-xs uppercase font-semibold tracking-wider text-neutral-400 block">
                Target Ticket Size
              </span>
              <Badge className="rounded-full bg-[#F4F9FF] border border-[#383BFE]/20 px-3 py-1 text-sm font-bold text-[#383BFE]">
                {ticketDisplay}
              </Badge>
            </div>
          </div>

          {/* Acquisition Thesis */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Investment & Acquisition Thesis
            </h2>
            <div className="rounded-2xl border border-[#D9D9D9] bg-[#F7F9FB] p-5">
              <p className="text-base text-neutral-900 leading-relaxed font-normal">
                {buyer.thesis || "Active strategic buyer open to bilateral M&A conversations."}
              </p>
            </div>
          </div>

          {/* Structured Mandate Targets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Target Jurisdictions */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Target Jurisdictions
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {buyer.targetCountries.length > 0 ? (
                  buyer.targetCountries.map((c, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-800 border border-neutral-200"
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-xs italic text-muted-foreground">{t("globalFlexible")}</span>
                )}
              </div>
            </div>

            {/* Target License Types */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Target License Types
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {buyer.targetLicenseTypes.length > 0 ? (
                  buyer.targetLicenseTypes.map((l, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-800 border border-neutral-200"
                    >
                      <Tag className="h-3 w-3 text-neutral-400" />
                      {enumLabel("licenseType", l)}
                    </span>
                  ))
                ) : (
                  <span className="text-xs italic text-muted-foreground">{t("openToAllLicenses")}</span>
                )}
              </div>
            </div>

            {/* Target Business Types */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Target Business Models
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {buyer.targetBusinessTypes.length > 0 ? (
                  buyer.targetBusinessTypes.map((b, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-800 border border-neutral-200"
                    >
                      {enumLabel("businessType", b)}
                    </span>
                  ))
                ) : (
                  <span className="text-xs italic text-muted-foreground">{t("flexibleBusinessModel")}</span>
                )}
              </div>
            </div>

            {/* Investment Horizon */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Execution Horizon
              </h3>
              <p className="text-sm font-semibold text-neutral-800">
                {enumLabel("horizon", buyer.horizon)}
              </p>
            </div>
          </div>

          {/* Background / Bio if available */}
          {buyer.bio && (
            <div className="space-y-2 pt-2 border-t border-[#D9D9D9]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                About the Acquirer
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {buyer.bio}
              </p>
            </div>
          )}

          {/* CTA Row */}
          <div className="pt-4 border-t border-[#D9D9D9] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-neutral-500">
              All communications are confidential and conducted within bilateral encrypted threads.
            </div>

            <ContactBuyerButton
              buyerId={buyer.userId}
              buyerName={buyer.company}
              isSuspended={isSuspended}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
