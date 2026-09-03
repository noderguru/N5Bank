"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  Clock,
  Loader2,
  MessageSquare,
  RefreshCw,
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
  pending?: boolean;
  error?: boolean;
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
  unreadCount?: number;
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
  const [optimisticMessages, setOptimisticMessages] = useState<InboxMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation =
    conversations.find((c) => c.id === selectedConversationId) ||
    conversations[0] ||
    null;

  // Clear optimistic messages when active conversation changes
  useEffect(() => {
    setOptimisticMessages([]);
  }, [selectedConversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages.length, optimisticMessages.length]);

  const handleSelect = (convId: string) => {
    router.push(`/inbox?conversationId=${convId}`);
  };

  const handleSendMessage = (retryText?: string, failedId?: string) => {
    if (!selectedConversation) return;

    const textToSend = (retryText || messageText).trim();
    if (!textToSend) return;

    const tempId = failedId || `opt_${Date.now()}`;

    if (failedId) {
      setOptimisticMessages((prev) =>
        prev.map((m) => (m.id === failedId ? { ...m, pending: true, error: false } : m))
      );
    } else {
      const optimisticMsg: InboxMessage = {
        id: tempId,
        senderId: currentUserId,
        body: textToSend,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      setOptimisticMessages((prev) => [...prev, optimisticMsg]);
      setMessageText("");
    }

    startTransition(async () => {
      try {
        const result = await sendMessageAction(
          selectedConversation.id,
          textToSend
        );
        if (!result.success) {
          toast.error(result.error || "Failed to send message");
          setOptimisticMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, pending: false, error: true } : m))
          );
          return;
        }

        // Remove optimistic placeholder once server persists and revalidates
        setOptimisticMessages((prev) => prev.filter((m) => m.id !== tempId));
        router.refresh();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error sending message");
        setOptimisticMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, pending: false, error: true } : m))
        );
      }
    });
  };

  const isCounterpartySuspended =
    selectedConversation?.counterpartyStatus === "SUSPENDED" ||
    selectedConversation?.counterpartyStatus === "REMOVED";

  const displayMessages = selectedConversation
    ? [...selectedConversation.messages, ...optimisticMessages]
    : [];

  return (
    <div
      className="flex flex-col md:flex-row rounded-[24px] border border-hairline bg-surface overflow-hidden min-h-[600px] shadow-sm"
      data-testid="inbox-view"
    >
      {/* Threads Sidebar */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-hairline bg-canvas/40 flex flex-col">
        <div className="p-4 border-b border-hairline bg-surface flex items-center justify-between">
          <h2 className="text-base font-bold text-ink tracking-tight flex items-center gap-2">
            <MessageSquare className="size-4 text-brand" />
            <span>Deal Conversations ({conversations.length})</span>
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-hairline/60">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No conversations yet. Reach out to buyers or sellers to begin.
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = selectedConversation?.id === conv.id;
              const lastMsg = conv.messages[conv.messages.length - 1];
              const unread = conv.unreadCount ?? 0;

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => handleSelect(conv.id)}
                  data-testid={`thread-item-${conv.id}`}
                  className={`w-full p-4 text-left transition-colors flex flex-col gap-1.5 ${
                    isSelected
                      ? "bg-surface border-l-4 border-l-brand shadow-2xs"
                      : "hover:bg-canvas/70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-ink truncate">
                      {conv.counterpartyName}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {unread > 0 && (
                        <span
                          className="size-5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center shadow-xs"
                          data-testid="thread-unread-badge"
                        >
                          {unread}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(conv.updatedAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {conv.assetTitle && (
                    <span className="text-xs text-brand font-medium truncate flex items-center gap-1">
                      <Building2 className="size-3 shrink-0" />
                      <span>{conv.assetTitle}</span>
                    </span>
                  )}

                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {lastMsg ? lastMsg.body : "Thread opened"}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Active Conversation Thread */}
      <div className="flex-1 flex flex-col bg-surface">
        {selectedConversation ? (
          <>
            {/* Thread Header */}
            <div className="p-4 sm:px-6 border-b border-hairline flex items-center justify-between bg-surface">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm border border-brand/20">
                  {selectedConversation.counterpartyName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-ink">
                      {selectedConversation.counterpartyName}
                    </h3>
                    <span className="rounded-full bg-canvas px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-hairline">
                      {selectedConversation.counterpartyRole}
                    </span>
                  </div>
                  {selectedConversation.assetTitle && (
                    <p className="text-xs text-muted-foreground">
                      Regarding:{" "}
                      <span className="font-medium text-ink">
                        {selectedConversation.assetTitle}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Stream */}
            <div
              className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-canvas/30"
              data-testid="messages-stream"
            >
              {displayMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                  <div className="size-10 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                    <MessageSquare className="size-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-ink">
                    Bilateral Deal Channel Initialized
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Introduce your opportunity, share initial deal criteria, or request bilateral confidentiality agreements.
                  </p>
                </div>
              ) : (
                displayMessages.map((msg) => {
                  const isOwn = msg.senderId === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isOwn ? "items-end" : "items-start"
                      }`}
                      data-testid="chat-message"
                    >
                      <div
                        className={`max-w-md rounded-2xl p-3.5 text-sm leading-relaxed ${
                          isOwn
                            ? "bg-brand text-white rounded-br-xs shadow-xs"
                            : "bg-surface text-ink rounded-bl-xs border border-hairline shadow-2xs"
                        } ${msg.pending ? "opacity-75" : ""} ${
                          msg.error ? "border-2 border-rose-500 bg-rose-50 text-rose-900" : ""
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.body}</p>
                      </div>

                      <div className="mt-1 flex items-center gap-1.5 px-1 text-[10px] text-muted-foreground">
                        {msg.pending ? (
                          <span className="flex items-center gap-1 text-brand font-medium">
                            <Clock className="size-3 animate-spin" />
                            <span>Sending...</span>
                          </span>
                        ) : msg.error ? (
                          <div className="flex items-center gap-1.5 text-rose-600 font-medium">
                            <span>Failed to send</span>
                            <button
                              type="button"
                              onClick={() => handleSendMessage(msg.body, msg.id)}
                              className="inline-flex items-center gap-0.5 underline hover:text-rose-800 font-bold"
                            >
                              <RefreshCw className="size-2.5" />
                              <span>Retry</span>
                            </button>
                          </div>
                        ) : (
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer */}
            <div className="p-4 border-t border-hairline bg-surface">
              {isCounterpartySuspended ? (
                <div
                  className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 flex items-center gap-2"
                  data-testid="suspended-participant-notice"
                >
                  <AlertTriangle className="size-4 shrink-0 text-amber-600" />
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
                    className="min-h-[80px] rounded-xl resize-none text-sm border-hairline"
                    disabled={isPending}
                    data-testid="message-input"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted-foreground">
                      Encrypted bilateral communication channel
                    </span>

                    <Button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={isPending || !messageText.trim()}
                      className="h-9 px-4 rounded-xl bg-brand hover:bg-brand/90 text-white text-xs font-semibold shadow-xs"
                      data-testid="send-message-button"
                    >
                      {isPending ? (
                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                      ) : (
                        <Send className="mr-1.5 size-3.5" />
                      )}
                      <span>Send Message</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground text-sm">
            Select a conversation to view deal history
          </div>
        )}
      </div>
    </div>
  );
}
