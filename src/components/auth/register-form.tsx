"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Briefcase, Building2, Check, Loader2 } from "lucide-react";
import { registerAction, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const [selectedRole, setSelectedRole] = useState<"BUYER" | "SELLER">("BUYER");

  const formError = state?.errors?._form?.[0];
  const nameError = state?.errors?.name?.[0];
  const emailError = state?.errors?.email?.[0];
  const passwordError = state?.errors?.password?.[0];
  const roleError = state?.errors?.role?.[0];
  const companyError = state?.errors?.company?.[0];
  const countryError = state?.errors?.country?.[0];

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground">
          <span className="size-2 rounded-full bg-brand" />
          Join N5Deal
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Create your marketplace account</h1>
        <p className="text-sm text-muted-foreground">
          Connect with European and global counterparties across regulated financial M&A
        </p>
      </div>

      <div className="rounded-2xl border border-hairline bg-surface p-6 shadow-xs space-y-6">
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-xs text-destructive"
          >
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to register</p>
              <p className="mt-0.5 text-destructive/90">{formError}</p>
            </div>
          </div>
        )}

        <form action={formAction} className="space-y-5">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-ink">Choose your role</Label>
            <input type="hidden" name="role" value={selectedRole} />
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSelectedRole("BUYER")}
                className={cn(
                  "relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all",
                  selectedRole === "BUYER"
                    ? "border-brand bg-tint/40 shadow-xs"
                    : "border-hairline bg-surface hover:border-hairline/80"
                )}
              >
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-lg",
                        selectedRole === "BUYER"
                          ? "bg-brand text-surface"
                          : "bg-canvas text-muted-foreground"
                      )}
                    >
                      <Briefcase className="size-4" />
                    </span>
                    {selectedRole === "BUYER" && (
                      <span className="flex size-4 items-center justify-center rounded-full bg-brand text-surface">
                        <Check className="size-3" />
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-ink">Buyer Account</div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Acquire regulated institutions, filter by license type and ticket, and reach sellers directly.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("SELLER")}
                className={cn(
                  "relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all",
                  selectedRole === "SELLER"
                    ? "border-brand bg-tint/40 shadow-xs"
                    : "border-hairline bg-surface hover:border-hairline/80"
                )}
              >
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-lg",
                        selectedRole === "SELLER"
                          ? "bg-brand text-surface"
                          : "bg-canvas text-muted-foreground"
                      )}
                    >
                      <Building2 className="size-4" />
                    </span>
                    {selectedRole === "SELLER" && (
                      <span className="flex size-4 items-center justify-center rounded-full bg-brand text-surface">
                        <Check className="size-3" />
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-ink">Seller Account</div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    List financial licenses or operating entities, configure LOI/NDA pricing, and review buyer inquiries.
                  </p>
                </div>
              </button>
            </div>
            {roleError && <p className="text-xs text-destructive">{roleError}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium text-ink">
                Full name
              </Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Alex Morgan"
                aria-invalid={!!nameError}
                aria-describedby={nameError ? "name-error" : undefined}
                className="h-10 rounded-xl"
              />
              {nameError && (
                <p id="name-error" className="text-xs text-destructive">
                  {nameError}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-ink">
                Work email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="alex@northstar.com"
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
                className="h-10 rounded-xl"
              />
              {emailError && (
                <p id="email-error" className="text-xs text-destructive">
                  {emailError}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-ink">
              Password (min. 6 characters)
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? "password-error" : undefined}
              className="h-10 rounded-xl"
            />
            {passwordError && (
              <p id="password-error" className="text-xs text-destructive">
                {passwordError}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="company" className="text-xs font-medium text-ink">
                Company / Organization
              </Label>
              <Input
                id="company"
                name="company"
                required
                placeholder="Northstar Capital LLC"
                aria-invalid={!!companyError}
                aria-describedby={companyError ? "company-error" : undefined}
                className="h-10 rounded-xl"
              />
              {companyError && (
                <p id="company-error" className="text-xs text-destructive">
                  {companyError}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="country" className="text-xs font-medium text-ink">
                Country
              </Label>
              <Input
                id="country"
                name="country"
                required
                placeholder="United Kingdom"
                aria-invalid={!!countryError}
                aria-describedby={countryError ? "country-error" : undefined}
                className="h-10 rounded-xl"
              />
              {countryError && (
                <p id="country-error" className="text-xs text-destructive">
                  {countryError}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="h-10 w-full rounded-xl bg-brand text-surface hover:bg-brand/90 font-medium"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
