import { Link } from "@/i18n/routing";
import { FolderOpen, type LucideIcon } from "lucide-react";
import { Button } from "../ui/button";

export type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
};

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-hairline bg-surface px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-canvas text-muted-foreground">
        <Icon className="size-6" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-ink tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-md text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action && (
            action.href ? (
              <Button asChild className="h-9 rounded-xl bg-brand text-surface hover:bg-brand/90 font-medium text-xs">
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ) : (
              <Button
                onClick={action.onClick}
                className="h-9 rounded-xl bg-brand text-surface hover:bg-brand/90 font-medium text-xs"
              >
                {action.label}
              </Button>
            )
          )}

          {secondaryAction && (
            secondaryAction.href ? (
              <Button asChild variant="outline" className="h-9 rounded-xl border-hairline font-medium text-xs">
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={secondaryAction.onClick}
                className="h-9 rounded-xl border-hairline font-medium text-xs"
              >
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
