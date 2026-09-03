"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getOrCreateConversationAction } from "@/app/actions/conversations";

type ContactBuyerButtonProps = {
  buyerId: string;
  isSuspended?: boolean;
  buyerName?: string;
};

export function ContactBuyerButton({
  buyerId,
  isSuspended = false,
  buyerName = "counterparty",
}: ContactBuyerButtonProps) {
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
          <AlertCircle className="mr-2 h-4 w-4 text-amber-600" />
          Contact Unavailable (Suspended Account)
        </Button>
        <p className="text-xs text-amber-700">
          This buyer has been suspended by platform compliance. Deal outreach is disabled.
        </p>
      </div>
    );
  }

  const handleContact = () => {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        const result = await getOrCreateConversationAction(buyerId);
        if (!result.success || !result.conversationId) {
          const err = result.error || "Failed to initiate conversation";
          setErrorMsg(err);
          toast.error(err);
          return;
        }

        toast.success(`Direct thread with ${buyerName} ready`);
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
        className="h-11 w-full sm:w-auto px-6 rounded-xl bg-[#383BFE] hover:bg-[#2d30e0] text-white font-medium shadow-xs"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        <span>{isPending ? "Connecting..." : "Initiate Deal Discussion"}</span>
      </Button>

      {errorMsg && (
        <p className="text-xs text-rose-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {errorMsg}
        </p>
      )}
    </div>
  );
}
