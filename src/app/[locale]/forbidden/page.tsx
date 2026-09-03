import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export default async function ForbiddenPage() {
  const t = await getTranslations("forbidden");

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-4 sm:p-8">
      <div className="w-full max-w-md space-y-6 border border-hairline bg-surface p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center bg-destructive-tint text-destructive">
          <ShieldAlert className="size-7" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center border border-destructive/40 px-3 py-1 eyebrow text-destructive">
            {t("badge")}
          </div>
          <h1 className="display-lg text-ink">{t("title")}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            asChild
            className="h-11 w-full rounded-none border border-ink bg-ink caps text-canvas transition-colors hover:bg-transparent hover:text-ink"
          >
            <Link href="/login">{t("backToLogin")}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 w-full rounded-none border-hairline caps hover:border-ink"
          >
            <Link href="/">{t("backToMarketplace")}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
