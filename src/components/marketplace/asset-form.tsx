"use client";

import { useState, useTransition } from "react";
import { useEnumLabel } from "@/lib/i18n-format";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Check, Info, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAssetAction, updateAssetAction } from "@/app/actions/assets";
import { generateAssetSummaryAction } from "@/app/actions/ai";
import { auditAssetCompleteness } from "@/lib/ai/summary";

export type AssetFormData = {
  id?: string;
  title: string;
  summary: string;
  description: string;
  country: string;
  licenseType: string;
  businessType: string;
  businessStatus: string;
  priceMode: "FIXED" | "ON_LOI" | "NDA";
  askingPrice?: number | string | null;
  currency: string;
  yearOfIssue?: number | string | null;
  employees?: number | string | null;
  regulator?: string | null;
  features?: string[] | string;
  status?: "DRAFT" | "PUBLISHED";
};

type AssetFormProps = {
  initialData?: Partial<AssetFormData>;
  isEdit?: boolean;
  canUseAi?: boolean;
};

const LICENSE_TYPES = [
  "BANKING",
  "E_MONEY",
  "PAYMENT",
  "CRYPTO",
  "BROKERAGE",
  "INSURANCE",
  "OTHER",
];

const BUSINESS_TYPES = [
  "BANK",
  "FINTECH",
  "PAYMENT_INSTITUTION",
  "CRYPTO_BUSINESS",
  "BROKERAGE",
  "INSURANCE_COMPANY",
  "OTHER",
];

const BUSINESS_STATUSES = ["OPERATING", "PRE_LAUNCH", "DORMANT", "DISTRESSED"];

const PRICE_MODES = [
  { value: "FIXED", labelKey: "priceFixed", descKey: "priceFixedDesc" },
  { value: "ON_LOI", labelKey: "priceLoi", descKey: "priceLoiDesc" },
  { value: "NDA", labelKey: "priceNda", descKey: "priceNdaDesc" },
] as const;

export function AssetForm({
  initialData,
  isEdit = false,
  canUseAi = false,
}: AssetFormProps) {
  const tForm = useTranslations("assetForm");
  const enumLabel = useEnumLabel();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [proposedSummary, setProposedSummary] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [summary, setSummary] = useState(initialData?.summary ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [country, setCountry] = useState(initialData?.country ?? "");
  const [licenseType, setLicenseType] = useState(initialData?.licenseType ?? "E_MONEY");
  const [businessType, setBusinessType] = useState(initialData?.businessType ?? "FINTECH");
  const [businessStatus, setBusinessStatus] = useState(
    initialData?.businessStatus ?? "OPERATING"
  );
  const [priceMode, setPriceMode] = useState<"FIXED" | "ON_LOI" | "NDA">(
    initialData?.priceMode ?? "FIXED"
  );
  const [askingPrice, setAskingPrice] = useState(
    initialData?.askingPrice !== null && initialData?.askingPrice !== undefined
      ? String(initialData.askingPrice)
      : ""
  );
  const [currency, setCurrency] = useState(initialData?.currency ?? "USD");
  const [yearOfIssue, setYearOfIssue] = useState(
    initialData?.yearOfIssue !== null && initialData?.yearOfIssue !== undefined
      ? String(initialData.yearOfIssue)
      : ""
  );
  const [employees, setEmployees] = useState(
    initialData?.employees !== null && initialData?.employees !== undefined
      ? String(initialData.employees)
      : ""
  );
  const [regulator, setRegulator] = useState(initialData?.regulator ?? "");
  const [features, setFeatures] = useState(
    Array.isArray(initialData?.features)
      ? initialData.features.join(", ")
      : typeof initialData?.features === "string"
      ? initialData.features
      : ""
  );

  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const completenessWarnings = auditAssetCompleteness({
    regulator,
    yearOfIssue,
    description,
    features,
  });

  const handleGenerateSummary = async () => {
    if (!title.trim() && !country.trim()) {
      toast.error("Please fill in at least the Title or Country before generating a summary.");
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const res = await generateAssetSummaryAction({
        title,
        country,
        licenseType,
        businessType,
        description,
        features,
        regulator,
        yearOfIssue,
      });

      if (res.summary) {
        setProposedSummary(res.summary);
        toast.info(
          res.engine === "ai"
            ? "AI summary draft generated. Review the proposal below."
            : "Summary template generated. Review the proposal below."
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate summary");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSubmit = (targetStatus: "DRAFT" | "PUBLISHED") => {
    if (isPending) return;
    setErrors({});

    const formData = new FormData();
    formData.set("title", title);
    formData.set("summary", summary);
    formData.set("description", description);
    formData.set("country", country);
    formData.set("licenseType", licenseType);
    formData.set("businessType", businessType);
    formData.set("businessStatus", businessStatus);
    formData.set("priceMode", priceMode);
    if (priceMode === "FIXED") {
      formData.set("askingPrice", askingPrice);
      formData.set("currency", currency);
    } else {
      formData.set("askingPrice", "");
      formData.set("currency", currency || "USD");
    }
    formData.set("yearOfIssue", yearOfIssue);
    formData.set("employees", employees);
    formData.set("regulator", regulator);
    formData.set("features", features);
    formData.set("status", targetStatus);

    startTransition(async () => {
      try {
        const result = isEdit && initialData?.id
          ? await updateAssetAction(initialData.id, null, formData)
          : await createAssetAction(null, formData);

        if (!result.success) {
          if (result.errors) {
            setErrors(result.errors);
            toast.error("Please resolve the validation errors below.");
          } else {
            toast.error(result.message || "Failed to save listing");
          }
          return;
        }

        toast.success(
          result.message ||
            (targetStatus === "PUBLISHED"
              ? "Listing published successfully"
              : "Draft saved successfully")
        );
        router.push("/seller/assets");
        router.refresh();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit("PUBLISHED");
      }}
      className="space-y-8"
      noValidate
    >
      {errors._form && errors._form.length > 0 && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800"
        >
          {errors._form.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      )}

      {/* Section 1: Overview */}
      <div className="rounded-[24px] border border-hairline bg-surface p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-ink tracking-tight">
            Listing Overview
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Specify the core asset proposition and regulatory classification.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-neutral-800">
              {tForm("listingTitle")} <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={tForm("phTitle")}
              className="mt-1.5 h-11 rounded-xl"
              disabled={isPending}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p id="title-error" className="mt-1 text-xs text-rose-600">
                {errors.title[0]}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country" className="text-sm font-medium text-neutral-800">
                {tForm("jurisdictionCountry")} <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder={tForm("phCountry")}
                className="mt-1.5 h-11 rounded-xl"
                disabled={isPending}
                aria-invalid={Boolean(errors.country)}
                aria-describedby={errors.country ? "country-error" : undefined}
              />
              {errors.country && (
                <p id="country-error" className="mt-1 text-xs text-rose-600">
                  {errors.country[0]}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="licenseType" className="text-sm font-medium text-neutral-800">
                {tForm("licenseType")} <span className="text-rose-500">*</span>
              </Label>
              <select
                id="licenseType"
                value={licenseType}
                onChange={(e) => setLicenseType(e.target.value)}
                className="mt-1.5 flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isPending}
              >
                {LICENSE_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {enumLabel("licenseType", value)}
                  </option>
                ))}
              </select>
              {errors.licenseType && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.licenseType[0]}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessType" className="text-sm font-medium text-neutral-800">
                {tForm("businessType")} <span className="text-rose-500">*</span>
              </Label>
              <select
                id="businessType"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="mt-1.5 flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isPending}
              >
                {BUSINESS_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {enumLabel("businessType", value)}
                  </option>
                ))}
              </select>
              {errors.businessType && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.businessType[0]}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="businessStatus" className="text-sm font-medium text-neutral-800">
                {tForm("operationalStatus")} <span className="text-rose-500">*</span>
              </Label>
              <select
                id="businessStatus"
                value={businessStatus}
                onChange={(e) => setBusinessStatus(e.target.value)}
                className="mt-1.5 flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isPending}
              >
                {BUSINESS_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {enumLabel("businessStatus", value)}
                  </option>
                ))}
              </select>
              {errors.businessStatus && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.businessStatus[0]}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Valuation & Price Structure */}
      <div className="rounded-[24px] border border-hairline bg-surface p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-ink tracking-tight">
            Valuation & Price Structure
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose whether to publish a transparent asking price or protect valuation behind NDA/LOI.
          </p>
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-medium text-ink">
            {tForm("priceDisclosureMode")} <span className="text-rose-500">*</span>
          </Label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRICE_MODES.map((pm) => {
              const isSelected = priceMode === pm.value;
              return (
                <button
                  key={pm.value}
                  type="button"
                  onClick={() => {
                    setPriceMode(pm.value);
                    if (pm.value !== "FIXED") {
                      setAskingPrice("");
                    }
                  }}
                  disabled={isPending}
                  className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-brand bg-tint ring-2 ring-brand/20"
                      : "border-hairline hover:border-brand/40 bg-surface"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${
                        isSelected ? "text-brand" : "text-ink"
                      }`}
                    >
                      {tForm(pm.labelKey)}
                    </span>
                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#383BFE] text-white">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <span className="mt-1 text-xs text-neutral-500">
                    {tForm(pm.descKey)}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.priceMode && (
            <p className="mt-1 text-xs text-rose-600">{errors.priceMode[0]}</p>
          )}

          {priceMode === "FIXED" ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="sm:col-span-2">
                <Label htmlFor="askingPrice" className="text-sm font-medium text-neutral-800">
                  {tForm("askingPrice")} <span className="text-rose-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="askingPrice"
                    type="number"
                    min="1"
                    step="any"
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(e.target.value)}
                    placeholder={tForm("phPrice")}
                    className="h-11 rounded-xl pr-14"
                    disabled={isPending}
                    aria-invalid={Boolean(errors.askingPrice)}
                    aria-describedby={errors.askingPrice ? "price-error" : undefined}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-xs font-semibold text-neutral-400">
                    {currency}
                  </div>
                </div>
                {errors.askingPrice && (
                  <p id="price-error" className="mt-1 text-xs text-rose-600">
                    {errors.askingPrice[0]}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="currency" className="text-sm font-medium text-neutral-800">
                  {tForm("currency")} <span className="text-rose-500">*</span>
                </Label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  className="mt-1.5 flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isPending}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CHF">CHF (Fr)</option>
                  <option value="SGD">SGD (S$)</option>
                </select>
                {errors.currency && (
                  <p className="mt-1 text-xs text-rose-600">{errors.currency[0]}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-[#F4F9FF] p-4 text-xs text-neutral-700 border border-[#E7F3FF]">
              <Info className="h-4 w-4 text-[#383BFE] shrink-0" />
              <span>
                Valuation will be shown as <strong>{priceMode === "ON_LOI" ? "Upon LOI" : "Under NDA"}</strong> in the marketplace catalogue. Counterparties can inquire or submit indicative proposals directly.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Summary and Description */}
      <div className="rounded-[24px] border border-hairline bg-surface p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-ink tracking-tight">
            Detailed Presentation
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Provide succinct pitch details for catalogue cards and deep technical context for detail views.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="summary" className="text-sm font-medium text-ink">
                  {tForm("shortSummary")} <span className="text-rose-500">*</span>
                </Label>
                {canUseAi && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateSummary}
                    disabled={isPending || isGeneratingSummary || (!title.trim() && !country.trim())}
                    className="h-7 px-2.5 text-xs gap-1.5 rounded-lg border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-900"
                  >
                    <Sparkles className="size-3" />
                    <span>{isGeneratingSummary ? "Drafting with AI..." : "Draft Summary with AI"}</span>
                  </Button>
                )}
              </div>
              <span className="text-xs text-neutral-400">
                {summary.length}/300
              </span>
            </div>

            {proposedSummary && (
              <div
                data-testid="ai-summary-proposal"
                className="mb-2 rounded-xl border border-purple-200 bg-purple-50/70 p-3 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between font-semibold text-purple-900">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-purple-600" />
                    <span>{tForm("aiSummaryProposal")}</span>
                  </div>
                  <span className="text-[11px] font-normal text-muted-foreground">{tForm("editableBeforeSaving")}</span>
                </div>
                <p className="text-ink italic bg-surface/90 p-2.5 rounded-lg border border-hairline">
                  &ldquo;{proposedSummary}&rdquo;
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setSummary(proposedSummary);
                      setProposedSummary(null);
                      toast.success("Draft inserted into summary. You can further edit it.");
                    }}
                    className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                  >
                    Use Draft Proposal
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setProposedSummary(null)}
                    className="h-7 text-xs text-neutral-600 hover:text-neutral-900"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            )}

            <Input
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={tForm("phSummary")}
              maxLength={300}
              className="h-11 rounded-xl"
              disabled={isPending}
              aria-invalid={Boolean(errors.summary)}
              aria-describedby={errors.summary ? "summary-error" : undefined}
            />
            {errors.summary && (
              <p id="summary-error" className="mt-1 text-xs text-rose-600">
                {errors.summary[0]}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-neutral-800">
              {tForm("fullDescription")} <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={tForm("phDescription")}
              rows={5}
              className="mt-1.5 rounded-xl resize-y"
              disabled={isPending}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? "desc-error" : undefined}
            />
            {errors.description && (
              <p id="desc-error" className="mt-1 text-xs text-rose-600">
                {errors.description[0]}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="features" className="text-sm font-medium text-neutral-800">
              {tForm("keyFeatures")}
            </Label>
            <Input
              id="features"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder={tForm("phFeatures")}
              className="mt-1.5 h-11 rounded-xl"
              disabled={isPending}
            />
            <p className="mt-1 text-xs text-neutral-400">
              Separated by commas. Displayed as highlights on the listing spec grid.
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: Operational Metrics */}
      <div className="rounded-[24px] border border-hairline bg-surface p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-ink tracking-tight">
            Operational Metrics
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Structured data points that feed institutional buyer filter criteria.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="yearOfIssue" className="text-sm font-medium text-ink">
              {tForm("yearOfIssue")}
            </Label>
            <Input
              id="yearOfIssue"
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              value={yearOfIssue}
              onChange={(e) => setYearOfIssue(e.target.value)}
              placeholder={tForm("phYear")}
              className="mt-1.5 h-11 rounded-xl"
              disabled={isPending}
            />
            {errors.yearOfIssue && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.yearOfIssue[0]}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="employees" className="text-sm font-medium text-neutral-800">
              {tForm("employees")}
            </Label>
            <Input
              id="employees"
              type="number"
              min="0"
              value={employees}
              onChange={(e) => setEmployees(e.target.value)}
              placeholder={tForm("phEmployees")}
              className="mt-1.5 h-11 rounded-xl"
              disabled={isPending}
            />
            {errors.employees && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.employees[0]}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="regulator" className="text-sm font-medium text-neutral-800">
              {tForm("regulator")}
            </Label>
            <Input
              id="regulator"
              value={regulator}
              onChange={(e) => setRegulator(e.target.value)}
              placeholder={tForm("phRegulator")}
              className="mt-1.5 h-11 rounded-xl"
              disabled={isPending}
            />
            {errors.regulator && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.regulator[0]}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Smart Listing Completeness Warnings */}
      <div
        data-testid="smart-listing-advisory"
        className="rounded-[24px] border border-hairline bg-surface p-5 sm:p-6 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="size-4 text-brand" />
            <h3 className="text-sm font-semibold text-ink">{tForm("smartAdvisory")}</h3>
          </div>
          <span className="text-xs text-muted-foreground">{tForm("diligenceCheck")}</span>
        </div>

        {completenessWarnings.length > 0 ? (
          <ul className="space-y-2 text-xs">
            {completenessWarnings.map((w, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 rounded-xl bg-amber-500/10 p-2.5 text-amber-900 border border-amber-500/20"
              >
                <AlertCircle className="size-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{w.message}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5">
            <Check className="size-3.5 text-emerald-600 shrink-0" />
            <span>
              All institutional completeness criteria satisfied! Your listing meets Tier 1 due diligence standards.
            </span>
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="sticky bottom-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-hairline bg-surface/95 p-4 shadow-lg backdrop-blur-md">
        <Link
          href="/seller/assets"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-ink transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Cancel and return
        </Link>

        <div className="flex w-full sm:w-auto items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit("DRAFT")}
            disabled={isPending}
            className="flex-1 sm:flex-initial h-11 px-5 rounded-xl border-hairline hover:bg-canvas font-medium text-ink"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Draft
          </Button>

          <Button
            type="button"
            onClick={() => handleSubmit("PUBLISHED")}
            disabled={isPending}
            className="flex-1 sm:flex-initial h-11 px-6 rounded-xl bg-[#383BFE] hover:bg-[#2d30e0] text-white font-medium shadow-sm transition-all"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Listing" : "Publish Listing"}
          </Button>
        </div>
      </div>
    </form>
  );
}
