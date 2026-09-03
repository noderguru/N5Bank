"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LOCALES = [
  { code: "en", label: "English", short: "EN" },
  { code: "uk", label: "Українська", short: "UK" },
  { code: "ru", label: "Русский", short: "RU" },
] as const;

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const segments = (pathname || "").split("/").filter(Boolean);
  const currentLocaleCode =
    LOCALES.find((l) => l.code === segments[0])?.code || "en";
  const activeLocale =
    LOCALES.find((l) => l.code === currentLocaleCode) || LOCALES[0];

  const handleSelect = (code: string) => {
    if (code === currentLocaleCode) return;
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; SameSite=Lax`;

    const newSegments = [...segments];
    if (LOCALES.some((l) => l.code === newSegments[0])) {
      newSegments[0] = code;
    } else {
      newSegments.unshift(code);
    }
    const newPath = "/" + newSegments.join("/");
    const search = searchParams?.toString() ? `?${searchParams.toString()}` : "";

    startTransition(() => {
      router.push(`${newPath}${search}`);
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          className="h-8 gap-1 rounded-full px-2.5 text-xs font-semibold text-muted-foreground hover:bg-canvas hover:text-ink focus-visible:ring-2 focus-visible:ring-brand"
          aria-label="Select Language"
        >
          <Globe className="size-3.5" />
          <span>{activeLocale.short}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 rounded-xl border-hairline p-1 shadow-floating">
        {LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => handleSelect(locale.code)}
            className={`cursor-pointer rounded-lg text-xs font-medium ${
              locale.code === currentLocaleCode ? "bg-tint text-brand font-semibold" : "text-ink"
            }`}
          >
            <span className="w-6 font-mono text-[11px] text-muted-foreground">{locale.short}</span>
            <span>{locale.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
