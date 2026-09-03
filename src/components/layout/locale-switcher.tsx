"use client";

import { useState } from "react";
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
  const [currentLocale, setCurrentLocale] = useState<string>("en");

  const activeLocale = LOCALES.find((l) => l.code === currentLocale) || LOCALES[0];

  const handleSelect = (code: string) => {
    setCurrentLocale(code);
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; SameSite=Lax`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
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
              locale.code === currentLocale ? "bg-tint text-brand font-semibold" : "text-ink"
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
