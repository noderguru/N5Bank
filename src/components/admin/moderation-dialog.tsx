"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ShieldAlert, RotateCcw, Trash2, CheckCircle2 } from "lucide-react";
import { moderateUserAction, moderateAssetAction } from "@/app/actions/moderation";
import { cn } from "@/lib/utils";

export type ModerationTargetType = "USER" | "ASSET";
export type ModerationActionType = "SUSPEND" | "RESTORE" | "REMOVE" | "VALIDATE";

type ModerationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: ModerationTargetType;
  targetId: string;
  targetTitle: string;
  action: ModerationActionType;
  onSuccess?: () => void;
};

export function ModerationDialog({
  open,
  onOpenChange,
  targetType,
  targetId,
  targetTitle,
  action,
  onSuccess,
}: ModerationDialogProps) {
  const tAdmin = useTranslations("adminFilters");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const minLength = 5;
  const isReasonValid = reason.trim().length >= minLength;

  const actionLabels: Record<ModerationActionType, { title: string; verb: string; description: string }> = {
    SUSPEND: {
      title: `Suspend ${targetType === "USER" ? "Participant" : "Listing"}`,
      verb: "Suspend Entity",
      description:
        targetType === "USER"
          ? "Suspending this participant will immediately hide all their listings from the public catalogue via query filter. All historical data and conversations are preserved, and access can be reinstated at any time."
          : "Suspending this listing will immediately hide it from public search and direct URLs. The seller will be notified with the compliance reason.",
    },
    RESTORE: {
      title: `Reinstate ${targetType === "USER" ? "Participant" : "Listing"}`,
      verb: "Reinstate Entity",
      description:
        targetType === "USER"
          ? "Reinstating this participant restores their active status. All previously published assets will immediately reappear in the catalogue without any loss of data."
          : "Reinstating this listing makes it live and discoverable in the public marketplace catalogue again.",
    },
    REMOVE: {
      title: `Remove ${targetType === "USER" ? "Participant" : "Listing"}`,
      verb: "Remove Entity",
      description:
        "Soft removal keeps full audit and transaction history while preventing any further marketplace participation.",
    },
    VALIDATE: {
      title: "Verify Regulatory Charter",
      verb: "Approve Verification",
      description: "Marks this asset as verified by platform compliance after document review.",
    },
  };

  const currentConfig = actionLabels[action];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReasonValid) {
      setError(`Please provide a justification of at least ${minLength} characters.`);
      return;
    }

    setError(null);
    startTransition(async () => {
      const res =
        targetType === "USER"
          ? await moderateUserAction({
              userId: targetId,
              action: action as "SUSPEND" | "RESTORE" | "REMOVE",
              reason,
            })
          : await moderateAssetAction({
              assetId: targetId,
              action: action as "SUSPEND" | "RESTORE" | "REMOVE" | "VALIDATE",
              reason,
            });

      if (!res.success) {
        setError(res.error || "An error occurred during moderation.");
        toast.error(res.error || "Moderation action failed");
      } else {
        toast.success(res.message || "Action recorded in audit log");
        setReason("");
        onOpenChange(false);
        onSuccess?.();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl",
                  action === "SUSPEND"
                    ? "bg-amber-100 text-amber-700"
                    : action === "REMOVE"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-emerald-100 text-emerald-700"
                )}
              >
                {action === "SUSPEND" ? (
                  <ShieldAlert className="size-5" />
                ) : action === "REMOVE" ? (
                  <Trash2 className="size-5" />
                ) : action === "RESTORE" ? (
                  <RotateCcw className="size-5" />
                ) : (
                  <CheckCircle2 className="size-5" />
                )}
              </span>
              <DialogTitle className="text-lg font-bold text-ink">
                {currentConfig.title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Target: <strong className="text-ink font-semibold">{targetTitle}</strong>
              <br />
              {currentConfig.description}
            </DialogDescription>
          </DialogHeader>

          {/* Mandatory Reason Input - N5B-88 */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="moderation-reason" className="text-xs font-semibold text-ink">
                Mandatory Compliance Justification <span className="text-rose-500">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {reason.trim().length}/{minLength} min
              </span>
            </div>
            <Textarea
              id="moderation-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error && e.target.value.trim().length >= minLength) {
                  setError(null);
                }
              }}
              placeholder={tAdmin("reasonPlaceholder")}
              className="h-24 text-xs rounded-xl border-hairline bg-canvas/50 resize-none"
              autoFocus
            />
            {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="rounded-xl text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isReasonValid || isPending}
              className={cn(
                "rounded-xl text-xs h-9 font-medium text-white shadow-xs",
                action === "REMOVE"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : action === "SUSPEND"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-brand hover:bg-brand/90"
              )}
            >
              {isPending ? "Executing..." : currentConfig.verb}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
