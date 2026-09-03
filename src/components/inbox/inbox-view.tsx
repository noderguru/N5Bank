"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  Loader2,
  MessageSquare,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessageAction } from "@/app/actions/conversations";

export type InboxMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string | Date;
};

export type InboxConversation = {
  id: string;
  assetId?: string | null;
  assetTitle?: string | null;
  counterpartyId: string;
  counterpartyName: string;
  counterpartyRole: string;
  counterpartyStatus: string;
  updatedAt: string | Date;
  messages: InboxMessage[];
};

type InboxViewProps = {
  currentUserId: string;
  conversations: InboxConversation[];
  selectedConversationId?: string;
};

export function InboxView({
  currentUserId,
  conversations,
  selectedConversationId,
}: InboxViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation =
    conversations.find((c) => c.id === selectedConversationId) ||
    conversations[0] ||
    null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages.length]);

  const handleSelect = (convId: string) => {
    router.push(`/inbox?conversationId=${convId}`);
  };

  const handleSendMessage = () => {
    if (!selectedConversation || !messageText.trim()) return;

    const textToSend = messageText.trim();
    setMessageText("");

    startTransition(async () => {
      try {
        const result = await sendMessageAction(
          selectedConversation.id,
          textToSend
        );
        if (!result.success) {
          toast.error(result.error || "Failed to send message");
          setMessageText(textToSend);
          return;
        }
        router.refresh();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error sending message");
        setMessageText(textToSend);
      }
    });
  };

  const isCounterpartySuspended =
    selectedConversation?.counterpartyStatus === "SUSPENDED" ||
    selectedConversation?.counterpartyStatus === "REMOVED";

  return (
    <div className="flex flex-col md:flex-row rounded-[24px] border border-[#D9D9D9] bg-white overflow-hidden min-h-[600px] shadow-sm">
      {/* Threads Sidebar */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[#D9D9D9] bg-[#F7F9FB] flex flex-col">
        <div className="p-4 border-b border-[#D9D9D9] bg-white">
          <h2 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[#383BFE]" />
            Deal Conversations ({conversations.length})
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#D9D9D9]/60">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-500">
              No conversations yet. Reach out to buyers or sellers to begin.
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = selectedConversation?.id === conv.id;
              const lastMsg = conv.messages[conv.messages.length - 1];

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => handleSelect(conv.id)}
                  className={`w-full p-4 text-left transition-colors flex flex-col gap-1.5 ${
                    isSelected
                      ? "bg-white border-l-4 border-l-[#383BFE] shadow-2xs"
                      : "hover:bg-neutral-100/70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-neutral-900 truncate">
                      {conv.counterpartyName}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(conv.updatedAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {conv.assetTitle && (
                    <span className="text-xs text-[#383BFE] font-medium truncate flex items-center gap-1">
                      <Building2 className="h-3 w-3 shrink-0" />
                      {conv.assetTitle}
                    </span>
                  )}

                  <p className="text-xs text-neutral-500 line-clamp-1">
                    {lastMsg ? lastMsg.body : "Thread opened"}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Active Conversation Thread */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            {/* Thread Header */}
            <div className="p-4 sm:px-6 border-b border-[#D9D9D9] flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#F4F9FF] text-[#383BFE] flex items-center justify-center font-bold text-sm border border-[#E7F3FF]">
                  {selectedConversation.counterpartyName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-neutral-900">
                      {selectedConversation.counterpartyName}
                    </h3>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                      {selectedConversation.counterpartyRole}
                    </span>
                  </div>
                  {selectedConversation.assetTitle && (
                    <p className="text-xs text-neutral-500">
                      Regarding: <span className="font-medium text-neutral-800">{selectedConversation.assetTitle}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#F7F9FB]/40">
              {selectedConversation.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                  <div className="h-10 w-10 rounded-full bg-[#F4F9FF] text-[#383BFE] flex items-center justify-center">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-neutral-900">
                    Bilateral Deal Channel Initialized
                  </h4>
                  <p className="text-xs text-neutral-500 max-w-sm">
                    Introduce your opportunity, share initial deal criteria, or request bilateral confidentiality agreements.
                  </p>
                </div>
              ) : (
                selectedConversation.messages.map((msg) => {
                  const isOwn = msg.senderId === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isOwn ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-md rounded-2xl p-3.5 text-sm leading-relaxed ${
                          isOwn
                            ? "bg-[#383BFE] text-white rounded-br-xs shadow-xs"
                            : "bg-white text-neutral-900 rounded-bl-xs border border-[#D9D9D9] shadow-2xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.body}</p>
                      </div>
                      <span className="mt-1 text-[10px] text-neutral-400 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer */}
            <div className="p-4 border-t border-[#D9D9D9] bg-white">
              {isCounterpartySuspended ? (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>
                    This counterparty is currently suspended by compliance. Outgoing messages are disabled.
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message... (Press Enter to send, Shift+Enter for newline)"
                    className="min-h-[80px] rounded-xl resize-none text-sm"
                    disabled={isPending}
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-neutral-400">
                      Encrypted bilateral communication channel
                    </span>

                    <Button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={isPending || !messageText.trim()}
                      className="h-9 px-4 rounded-xl bg-[#383BFE] hover:bg-[#2d30e0] text-white text-xs font-semibold shadow-xs"
                    >
                      {isPending ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Send Message
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-neutral-400 text-sm">
            Select a conversation to view deal history
          </div>
        )}
      </div>
    </div>
  );
}
