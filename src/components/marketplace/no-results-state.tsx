import { FilterX, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";

export type NoResultsStateProps = {
  title?: string;
  description?: string;
  query?: string;
  onReset?: () => void;
  resetLabel?: string;
};

export function NoResultsState({
  title = "No matching opportunities found",
  description = "No marketplace listings match the selected criteria. Try adjusting your ticket range, licence filters, or resetting all parameters.",
  query,
  onReset,
  resetLabel = "Clear active filters",
}: NoResultsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-hairline bg-surface/60 px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-canvas text-muted-foreground">
        <FilterX className="size-6" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-ink tracking-tight">{title}</h3>
      {query && (
        <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-canvas px-2.5 py-0.5 text-xs text-muted-foreground">
          <span>Search query:</span>
          <span className="font-semibold text-ink">&ldquo;{query}&rdquo;</span>
        </div>
      )}
      <p className="mt-1.5 max-w-md text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>

      {onReset && (
        <div className="mt-6">
          <Button
            onClick={onReset}
            variant="outline"
            className="h-9 gap-1.5 rounded-xl border-hairline font-medium text-xs hover:border-brand hover:text-brand"
          >
            <RotateCcw className="size-3.5" />
            {resetLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
