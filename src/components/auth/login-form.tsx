"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { loginAction, type AuthFormState } from "@/app/actions/auth";
import { DemoLoginButtons } from "@/components/auth/demo-login-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthFormState = {};

export function LoginForm({ returnTo }: { returnTo?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  const formError = state?.errors?._form?.[0];
  const emailError = state?.errors?.email?.[0];
  const passwordError = state?.errors?.password?.[0];

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground">
          <span className="size-2 rounded-full bg-brand" />
          N5Deal Marketplace
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Sign in to your account</h1>
        <p className="text-sm text-muted-foreground">
          Access your buyer interests, asset listings, or manager console
        </p>
      </div>

      <div className="rounded-2xl border border-hairline bg-surface p-6 shadow-xs space-y-6">
        <DemoLoginButtons returnTo={returnTo} />

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-hairline" />
          <span className="relative bg-surface px-3 text-xs uppercase tracking-wider text-muted-foreground">
            Or continue with email
          </span>
        </div>

        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-xs text-destructive"
          >
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to sign in</p>
              <p className="mt-0.5 text-destructive/90">{formError}</p>
            </div>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-ink">
              Email address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@company.com"
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium text-ink">
                Password
              </Label>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
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

          <Button
            type="submit"
            disabled={isPending}
            className="h-10 w-full rounded-xl bg-brand text-surface hover:bg-brand/90 font-medium"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Do not have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-brand underline-offset-4 hover:underline"
        >
          Create one now
        </Link>
      </p>
    </div>
  );
}
