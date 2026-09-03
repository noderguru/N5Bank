import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-8 bg-canvas">
      <div className="w-full max-w-md rounded-2xl border border-hairline bg-surface p-8 text-center shadow-xs space-y-6">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="size-7" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
            403 Forbidden
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Access Restricted
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your account does not have permission to access this workspace. Marketplace roles (Buyer, Seller, Manager) are isolated to preserve deal confidentiality.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button asChild className="h-10 w-full rounded-xl bg-brand text-surface hover:bg-brand/90 font-medium">
            <Link href="/login">Return to Sign in</Link>
          </Button>
          <Button asChild variant="outline" className="h-10 w-full rounded-xl border-hairline font-medium">
            <Link href="/">Back to Marketplace</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
