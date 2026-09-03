import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";

export type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorState({
  title = "Failed to load data",
  message = "An unexpected error occurred while communicating with the platform servers. Please verify your connection or retry the request.",
  onRetry,
  retryLabel = "Try again",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center"
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-ink tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-md text-xs text-muted-foreground leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <div className="mt-6">
          <Button
            onClick={onRetry}
            variant="outline"
            className="h-9 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 font-medium text-xs"
          >
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
