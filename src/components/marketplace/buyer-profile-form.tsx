"use client";

import { useActionState } from "react";
import { useEnumLabel } from "@/lib/i18n-format";
import { useTranslations } from "next-intl";
import {
  Building2,
  Globe2,
  Loader2,
  Save,
  Sparkles,
  Target,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  saveBuyerProfileAction,
  type BuyerActionResult,
} from "@/app/actions/buyer";
import {
  computeProfileCompleteness,
  type ProfileCompletenessResult,
} from "@/lib/validation/buyer";
import { LicenseType, BusinessType, InvestmentHorizon } from "@prisma/client";

const COMMON_COUNTRIES = [
  "United Kingdom",
  "Germany",
  "Lithuania",
  "Switzerland",
  "Cyprus",
  "Spain",
  "Singapore",
  "United Arab Emirates",
  "Malta",
  "Estonia",
  "Brazil",
];

const LICENSE_TYPES: LicenseType[] = [
  "BANKING",
  "E_MONEY",
  "PAYMENT",
  "CRYPTO",
  "BROKERAGE",
  "INSURANCE",
  "OTHER",
];

const BUSINESS_TYPES: BusinessType[] = [
  "BANK",
  "FINTECH",
  "PAYMENT_INSTITUTION",
  "CRYPTO_BUSINESS",
  "BROKERAGE",
  "INSURANCE_COMPANY",
  "OTHER",
];

export type BuyerProfileFormProps = {
  initialProfile?: {
    company: string;
    country: string;
    bio?: string | null;
    thesis?: string | null;
    ticketMin?: number | string | null;
    ticketMax?: number | string | null;
    currency?: string;
    targetCountries?: string[];
    targetLicenseTypes?: LicenseType[];
    targetBusinessTypes?: BusinessType[];
    horizon?: InvestmentHorizon;
  } | null;
};

export function BuyerProfileForm({ initialProfile }: BuyerProfileFormProps) {
  const tForm = useTranslations("buyerForm");
  const enumLabel = useEnumLabel();
  const [state, formAction, isPending] = useActionState(
    async (prev: BuyerActionResult | null, formData: FormData) => {
      const res = await saveBuyerProfileAction(prev, formData);
      if (res.success) {
        toast.success(res.message || "Profile saved successfully");
      } else if (res.errors) {
        toast.error("Please check the form for validation errors.");
      }
      return res;
    },
    null
  );

  const completeness: ProfileCompletenessResult = computeProfileCompleteness(
    initialProfile ?? null
  );

  return (
    <form action={formAction} className="space-y-8" data-testid="buyer-profile-form">
      {/* Completeness & Match Quality Banner */}
      <div className="rounded-2xl border border-hairline bg-surface p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-brand" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Buyer Match Quality
            </span>
            <Badge
              variant="outline"
              className="rounded-full border-brand/40 bg-brand/10 text-brand font-semibold text-[11px]"
            >
              {completeness.qualityLabel} ({completeness.score}%)
            </Badge>
          </div>

          <span className="text-xs text-muted-foreground">
            {completeness.isComplete
              ? "Profile complete for active matchmaking"
              : "Complete your thesis and ticket range to unlock AI matching"}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-canvas">
          <div
            className="h-full rounded-full bg-brand transition-all duration-500"
            style={{ width: `${completeness.score}%` }}
          />
        </div>

        {completeness.missingFields.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-muted-foreground">
            <span>{tForm("recommendedAdditions")}</span>
            {completeness.missingFields.map((field) => (
              <span
                key={field}
                className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-0.5 text-[11px] font-medium text-ink"
              >
                <Target className="size-3 text-brand" />
                <span>{field}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* General Company & Country Info */}
      <div className="rounded-3xl border border-hairline bg-surface p-6 sm:p-7 shadow-2xs space-y-5">
        <div className="border-b border-hairline/60 pb-3">
          <h2 className="text-base font-semibold text-ink tracking-tight flex items-center gap-2">
            <Building2 className="size-4 text-brand" />
            <span>{tForm("counterpartyDetails")}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Identify your fund, family office, or strategic acquiring entity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="company" className="text-xs font-medium text-ink">
              {tForm("companyName")} <span className="text-brand">*</span>
            </Label>
            <Input
              id="company"
              name="company"
              defaultValue={initialProfile?.company || ""}
              placeholder={tForm("phCompany")}
              required
              className="h-10 rounded-xl border-hairline text-sm"
            />
            {state?.errors?.company && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="size-3" />
                <span>{state.errors.company[0]}</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="country" className="text-xs font-medium text-ink">
              {tForm("baseCountry")} <span className="text-brand">*</span>
            </Label>
            <select
              id="country"
              name="country"
              defaultValue={initialProfile?.country || ""}
              required
              className="w-full h-10 rounded-xl border border-hairline bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-canvas/50 focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">{tForm("selectCountry")}</option>
              {COMMON_COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {state?.errors?.country && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="size-3" />
                <span>{state.errors.country[0]}</span>
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio" className="text-xs font-medium text-ink">
            {tForm("firmOverview")}
          </Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={initialProfile?.bio || ""}
            placeholder="Describe your firm's asset management focus, AUM, partners, or track record..."
            className="min-h-[80px] rounded-xl border-hairline text-sm leading-relaxed"
          />
        </div>
      </div>

      {/* Investment Thesis & Free Text Description */}
      <div className="rounded-3xl border border-hairline bg-surface p-6 sm:p-7 shadow-2xs space-y-5">
        <div className="border-b border-hairline/60 pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink tracking-tight flex items-center gap-2">
              <Sparkles className="size-4 text-brand" />
              <span>{tForm("investmentThesis")}</span>
            </h2>
            <Badge variant="outline" className="text-[10px] uppercase font-semibold">
              Feeds AI Scorer
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Describe your acquisition criteria in detail. This powers deterministic scoring and semantic embeddings.
          </p>
        </div>

        <div className="space-y-1.5">
          <Textarea
            id="thesis"
            name="thesis"
            defaultValue={initialProfile?.thesis || ""}
            placeholder="e.g. Seeking operational EMI institutions with direct SEPA connectivity, SWIFT BIC, and established correspondent banking relationships to expand cross-border corporate payments..."
            className="min-h-[120px] rounded-xl border-hairline text-sm leading-relaxed"
          />
          {state?.errors?.thesis && (
            <p className="text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="size-3" />
              <span>{state.errors.thesis[0]}</span>
            </p>
          )}
        </div>
      </div>

      {/* Ticket Range & Horizon */}
      <div className="rounded-3xl border border-hairline bg-surface p-6 sm:p-7 shadow-2xs space-y-5">
        <div className="border-b border-hairline/60 pb-3">
          <h2 className="text-base font-semibold text-ink tracking-tight flex items-center gap-2">
            <Target className="size-4 text-brand" />
            <span>{tForm("budgetHorizon")}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Specify check size envelope to filter non-fitting listings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="currency" className="text-xs font-medium text-ink">
              {tForm("currency")}
            </Label>
            <select
              id="currency"
              name="currency"
              defaultValue={initialProfile?.currency || "USD"}
              className="w-full h-10 rounded-xl border border-hairline bg-surface px-3 text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CHF">CHF (Fr)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ticketMin" className="text-xs font-medium text-ink">
              {tForm("ticketMin")}
            </Label>
            <Input
              id="ticketMin"
              name="ticketMin"
              type="number"
              step="10000"
              defaultValue={initialProfile?.ticketMin ? String(initialProfile.ticketMin) : ""}
              placeholder={tForm("phTicketMin")}
              className="h-10 rounded-xl border-hairline text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ticketMax" className="text-xs font-medium text-ink">
              {tForm("ticketMax")}
            </Label>
            <Input
              id="ticketMax"
              name="ticketMax"
              type="number"
              step="10000"
              defaultValue={initialProfile?.ticketMax ? String(initialProfile.ticketMax) : ""}
              placeholder={tForm("phTicketMax")}
              className="h-10 rounded-xl border-hairline text-sm"
            />
            {state?.errors?.ticketMax && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="size-3" />
                <span>{state.errors.ticketMax[0]}</span>
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="horizon" className="text-xs font-medium text-ink">
            {tForm("executionHorizon")}
          </Label>
          <select
            id="horizon"
            name="horizon"
            defaultValue={initialProfile?.horizon || "FLEXIBLE"}
            className="w-full sm:w-1/2 h-10 rounded-xl border border-hairline bg-surface px-3 text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="SHORT_TERM">{tForm("horizonShort")}</option>
            <option value="MEDIUM_TERM">{tForm("horizonMedium")}</option>
            <option value="LONG_TERM">{tForm("horizonLong")}</option>
            <option value="FLEXIBLE">{tForm("horizonFlexible")}</option>
          </select>
        </div>
      </div>

      {/* Structured Multi-selects: Target Countries, Licenses, Business Types */}
      <div className="rounded-3xl border border-hairline bg-surface p-6 sm:p-7 shadow-2xs space-y-6">
        <div className="border-b border-hairline/60 pb-3">
          <h2 className="text-base font-semibold text-ink tracking-tight flex items-center gap-2">
            <Globe2 className="size-4 text-brand" />
            <span>{tForm("geographiesCharters")}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select specific licenses and business structures within your scope.
          </p>
        </div>

        {/* Target Countries */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-ink">
            {tForm("targetJurisdictions")}
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {COMMON_COUNTRIES.map((c) => {
              const isChecked = initialProfile?.targetCountries?.includes(c) ?? false;
              return (
                <label
                  key={c}
                  className="flex items-center gap-2 text-xs text-ink cursor-pointer rounded-xl border border-hairline/80 bg-canvas/30 p-2.5 hover:bg-canvas transition-colors"
                >
                  <input
                    type="checkbox"
                    name="targetCountries"
                    value={c}
                    defaultChecked={isChecked}
                    className="size-3.5 rounded text-brand focus:ring-brand accent-[currentColor]"
                  />
                  <span className="truncate">{c}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Target License Types */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-ink">
            {tForm("targetCharters")}
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {LICENSE_TYPES.map((value) => {
              const isChecked =
                initialProfile?.targetLicenseTypes?.includes(value as never) ?? false;
              return (
                <label
                  key={value}
                  className="flex items-center gap-2 text-xs text-ink cursor-pointer rounded-xl border border-hairline/80 bg-canvas/30 p-2.5 hover:bg-canvas transition-colors"
                >
                  <input
                    type="checkbox"
                    name="targetLicenseTypes"
                    value={value}
                    defaultChecked={isChecked}
                    className="size-3.5 rounded text-brand focus:ring-brand accent-[currentColor]"
                  />
                  <span>{enumLabel("licenseType", value)}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Target Business Types */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-ink">
            {tForm("targetStructure")}
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {BUSINESS_TYPES.map((value) => {
              const isChecked =
                initialProfile?.targetBusinessTypes?.includes(value as never) ?? false;
              return (
                <label
                  key={value}
                  className="flex items-center gap-2 text-xs text-ink cursor-pointer rounded-xl border border-hairline/80 bg-canvas/30 p-2.5 hover:bg-canvas transition-colors"
                >
                  <input
                    type="checkbox"
                    name="targetBusinessTypes"
                    value={value}
                    defaultChecked={isChecked}
                    className="size-3.5 rounded text-brand focus:ring-brand accent-[currentColor]"
                  />
                  <span>{enumLabel("businessType", value)}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="h-11 px-6 rounded-xl bg-brand hover:bg-brand/90 text-white font-medium shadow-xs"
          data-testid="save-buyer-profile-button"
        >
          {isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          <span>{isPending ? "Saving Profile..." : "Save Mandate Profile"}</span>
        </Button>
      </div>
    </form>
  );
}
