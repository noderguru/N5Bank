"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseSearchQueryAction } from "@/app/actions/ai";
import type { ParsedSearchFilters } from "@/lib/ai/query-parser";

export function NaturalSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [parseNotice, setParseNotice] = useState<{
    type: "success" | "error";
    message: string;
    engine?: "ai" | "rule";
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isPending) return;

    startTransition(async () => {
      try {
        const result: ParsedSearchFilters = await parseSearchQueryAction(query);

        if (result.confidence === "none") {
          setParseNotice({
            type: "error",
            message:
              result.explanation ||
              "Could not interpret query into marketplace filters. Try specifying a country, license charter, or budget range.",
            engine: result.engine,
          });
          return;
        }

        // Apply parsed filters to URL
        const params = new URLSearchParams(searchParams.toString());

        if (result.country) params.set("country", result.country);
        if (result.licenseType) params.set("licenseType", result.licenseType);
        if (result.businessType) params.set("businessType", result.businessType);
        if (result.businessStatus) params.set("businessStatus", result.businessStatus);
        if (result.price) params.set("price", result.price);
        if (result.q) params.set("q", result.q);

        setParseNotice({
          type: "success",
          message: result.explanation,
          engine: result.engine,
        });

        router.push(`/assets?${params.toString()}`);
      } catch (err) {
        console.error("Failed to parse search query:", err);
        setParseNotice({
          type: "error",
          message: "Failed to process search query. Please try standard keyword filters.",
        });
      }
    });
  };

  return (
    <div className="space-y-2">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center gap-2 rounded-2xl border border-brand/20 bg-brand/5 p-1.5 shadow-2xs focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/10 transition-all"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-2xs">
          <Sparkles className="size-4" />
        </div>

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Natural Search: e.g. "payment licence in Brazil under 5M" or "operating bank in Germany"'
          disabled={isPending}
          className="h-9 border-none bg-transparent shadow-none text-xs sm:text-sm text-ink placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        <Button
          type="submit"
          disabled={isPending || !query.trim()}
          size="sm"
          className="h-9 shrink-0 gap-1.5 rounded-xl bg-brand text-xs font-medium text-white hover:bg-brand/90 shadow-2xs disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span className="hidden sm:inline">Interpreting...</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Interpret Filter</span>
              <ArrowRight className="size-3.5" />
            </>
          )}
        </Button>
      </form>

      {parseNotice && (
        <div
          role="status"
          className={`flex items-start justify-between gap-2 rounded-xl px-3 py-2 text-xs transition-all ${
            parseNotice.type === "success"
              ? "bg-purple-500/10 text-purple-800 border border-purple-500/20"
              : "bg-amber-500/10 text-amber-800 border border-amber-500/20"
          }`}
        >
          <div className="flex items-start gap-1.5">
            {parseNotice.type === "success" ? (
              <Sparkles className="size-3.5 shrink-0 mt-0.5 text-purple-700" />
            ) : (
              <AlertCircle className="size-3.5 shrink-0 mt-0.5 text-amber-600" />
            )}
            <span>
              <strong>
                {parseNotice.engine === "ai"
                  ? "AI Parser: "
                  : parseNotice.engine === "rule"
                  ? "Rule Parser: "
                  : ""}
              </strong>
              {parseNotice.message}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setParseNotice(null)}
            className="text-muted-foreground hover:text-ink shrink-0 ml-2"
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
