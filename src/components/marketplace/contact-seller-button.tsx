"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getOrCreateConversationAction } from "@/app/actions/conversations";

export type ContactSellerButtonProps = {
  sellerId: string;
  assetId: string;
  isSuspended?: boolean;
  sellerName?: string;
};

export function ContactSellerButton({
  sellerId,
  assetId,
  isSuspended = false,
  sellerName = "the seller",
}: ContactSellerButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (isSuspended) {
    return (
      <div className="space-y-2">
        <Button
          type="button"
          disabled
          variant="outline"
          className="h-11 w-full sm:w-auto px-6 rounded-xl border-amber-300 bg-amber-50 text-amber-800 cursor-not-allowed opacity-80"
        >
          <AlertCircle className="mr-2 size-4 text-amber-600" />
          <span>Contact Unavailable (Suspended Seller)</span>
        </Button>
        <p className="text-xs text-amber-700">
          This seller account has been temporarily suspended by compliance. Inquiries are closed.
        </p>
      </div>
    );
  }

  const handleContact = () => {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        const result = await getOrCreateConversationAction(sellerId, assetId);
        if (!result.success || !result.conversationId) {
          const err = result.error || "Failed to initiate discussion thread";
          setErrorMsg(err);
          toast.error(err);
          return;
        }

        toast.success(`Deal thread with ${sellerName} opened`);
        router.push(`/inbox?conversationId=${result.conversationId}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "An error occurred";
        setErrorMsg(msg);
        toast.error(msg);
      }
    });
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={handleContact}
        disabled={isPending}
        className="h-11 w-full sm:w-auto px-6 rounded-xl bg-brand text-surface hover:bg-brand/90 font-medium shadow-xs"
        data-testid="contact-seller-button"
      >
        {isPending ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <MessageSquare className="mr-2 size-4" />
        )}
        <span>{isPending ? "Connecting..." : "Contact Seller"}</span>
      </Button>

      {errorMsg && (
        <p className="text-xs text-rose-600 flex items-center gap-1">
          <AlertCircle className="size-3" />
          <span>{errorMsg}</span>
        </p>
      )}
    </div>
  );
}
