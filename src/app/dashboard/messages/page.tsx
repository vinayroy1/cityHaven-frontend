"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Send,
  UserCircle2,
  Building2,
  RefreshCw,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  Phone,
  Inbox,
  Image as ImageIcon,
} from "lucide-react";
import { HeaderNav } from "@/app/homePage/components/HeaderNav";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatPill } from "../components/StatPill";
import { useMeQuery } from "@/features/auth/api";
import {
  useGetMyConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  type ApiConversation,
  type ApiMessage,
} from "@/features/messaging/api";
import { toast } from "sonner";

function formatMessageTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "";
  try {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  } catch {
    return "";
  }
}

export default function MessagesPage() {
  const { data: me } = useMeQuery();
  const currentUserId = me?.id;

  const {
    data: conversations = [],
    isLoading: isLoadingConvs,
    isFetching: isFetchingConvs,
    refetch: refetchConvs,
  } = useGetMyConversationsQuery();

  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);

  // Auto-select first conversation once loaded if none selected
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId),
    [conversations, selectedConversationId]
  );

  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    isFetching: isFetchingMessages,
  } = useGetMessagesQuery(selectedConversationId ?? 0, {
    skip: !selectedConversationId,
    pollingInterval: 5000, // Poll every 5s for new incoming messages
  });

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || !selectedConversationId || isSending) return;

    try {
      setInputText("");
      await sendMessage({
        conversationId: selectedConversationId,
        content: trimmed,
        type: "TEXT",
      }).unwrap();
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  };

  const otherParticipant = useMemo(() => {
    if (!activeConversation?.participants) return null;
    return (
      activeConversation.participants.find((p) => p.userId !== currentUserId)?.user ||
      activeConversation.participants[0]?.user
    );
  }, [activeConversation, currentUserId]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50 text-slate-900 transition-colors duration-150 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <HeaderNav />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <PageHeader
          tag="Direct Messages"
          title="Inbox & Enquiries"
          subtitle="Real-time buyer inquiries, property chats, and tenant negotiations."
          backHref="/dashboard"
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => refetchConvs()}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetchingConvs ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>
          }
        />

        {/* Dynamic Matrix */}
        <SectionCard>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatPill
              label="Active Conversations"
              value={String(conversations.length)}
              hint="All chat threads"
              tone="rose"
            />
            <StatPill
              label="Current Thread Messages"
              value={String(messages.length)}
              hint="In active conversation"
              tone="amber"
            />
            <StatPill
              label="Assigned Leads"
              value="CRM Sync"
              hint="Phone numbers unlocked"
              tone="emerald"
              href="/dashboard/leads"
            />
            <StatPill
              label="Direct Chat Status"
              value="Encrypted"
              hint="Private direct messages"
              tone="slate"
            />
          </div>
        </SectionCard>

        {/* Main Messenger Workspace */}
        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr] min-h-[580px]">
          {/* Threads Sidebar */}
          <SectionCard title="Conversations" subtitle="Sorted by latest message">
            {isLoadingConvs ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <RefreshCw className="h-6 w-6 animate-spin text-rose-500" />
                <p className="mt-2 text-xs font-medium">Loading conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center dark:border-slate-800">
                <Inbox className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No conversations yet
                </p>
                <p className="mt-1 max-w-xs text-xs text-slate-500">
                  When prospective buyers or tenants send inquiries on your listings, chats will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {conversations.map((c) => {
                  const partner =
                    c.participants?.find((p) => p.userId !== currentUserId)?.user ||
                    c.participants?.[0]?.user;
                  const partnerName = partner?.name || partner?.email || `User #${partner?.id || "Member"}`;
                  const isSelected = c.id === selectedConversationId;
                  const latestMsg = c.messages?.[0];

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedConversationId(c.id)}
                      className={`flex items-start justify-between gap-3 rounded-2xl border p-3.5 transition cursor-pointer ${
                        isSelected
                          ? "border-rose-400 bg-rose-50/60 shadow-xs dark:border-rose-700 dark:bg-rose-950/40"
                          : "border-slate-100 bg-white/90 hover:border-slate-200 dark:border-slate-800 dark:bg-slate-900/80"
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-bold text-sm">
                          {partnerName.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                              {partnerName}
                            </p>
                          </div>

                          {c.property && (
                            <p className="truncate text-[11px] font-medium text-rose-600 dark:text-rose-400">
                              🏠 {c.property.title}
                            </p>
                          )}

                          <p className="truncate text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {latestMsg ? latestMsg.content : "No messages yet"}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                        {formatRelativeTime(c.updatedAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* Chat Window */}
          <div className="flex flex-col rounded-3xl border border-white/70 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 overflow-hidden">
            {/* Header */}
            {activeConversation ? (
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 font-bold text-white text-sm">
                    {(otherParticipant?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {otherParticipant?.name || otherParticipant?.email || "Participant"}
                    </h3>
                    {otherParticipant?.mobileNumber && (
                      <p className="text-xs text-slate-500">📞 {otherParticipant.mobileNumber}</p>
                    )}
                  </div>
                </div>

                {activeConversation.property && (
                  <Link
                    href={`/properties/${activeConversation.property.id}`}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <span>{activeConversation.property.title}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="border-b border-slate-100 p-4 text-center text-xs font-semibold text-slate-500 dark:border-slate-800">
                Select a conversation
              </div>
            )}

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[360px] max-h-[420px] bg-slate-50/40 dark:bg-slate-950/20">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center py-20 text-slate-400">
                  <RefreshCw className="h-5 w-5 animate-spin text-rose-500" />
                </div>
              ) : !activeConversation ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                  <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                  <p className="mt-2 text-xs">Choose a thread from the left to start chatting</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                  <Sparkles className="h-6 w-6 text-amber-500 mb-1" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No messages in this conversation yet
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Send a greeting or query below to begin.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderId === currentUserId;

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 shadow-xs text-sm ${
                          isMine
                            ? "bg-slate-900 text-white rounded-br-xs dark:bg-white dark:text-slate-950"
                            : "bg-white text-slate-900 border border-slate-200/80 rounded-bl-xs dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                      </div>

                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {formatMessageTime(m.sentAt)}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer */}
            {activeConversation && (
              <form
                onSubmit={handleSend}
                className="flex items-center gap-2 border-t border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-900 outline-none transition focus:border-rose-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-rose-400"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-white shadow-xs transition hover:bg-rose-500 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
