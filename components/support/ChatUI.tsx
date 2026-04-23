"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import type { SupportMessage } from "@/lib/api";
import { formatTicketTime } from "@/lib/api";

interface ChatUIProps {
  messages: SupportMessage[];
  onSendMessage: (message: string) => Promise<void>;
  onCloseTicket?: () => void;
  canCloseTicket?: boolean;
  ticketStatus?: "open" | "closed";
  loading?: boolean;
}

export function ChatUI({
  messages,
  onSendMessage,
  onCloseTicket,
  canCloseTicket = false,
  ticketStatus = "open",
  loading = false,
}: ChatUIProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || sending || ticketStatus === "closed") return;

    setSending(true);
    try {
      await onSendMessage(message.trim());
      setMessage("");
      textareaRef.current?.focus();
    } catch {
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getMessageStyle = (msg: SupportMessage) => {
    const isOwn = msg.senderRole === user?.role?.toLowerCase();
    if (msg.senderRole === "admin") {
      return isOwn
        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 shadow-md"
        : "bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-md";
    }
    if (isOwn) {
      return "bg-blue-600 text-white";
    }
    return "bg-white text-gray-900 border border-gray-200";
  };

  const getAlignment = (msg: SupportMessage) => {
    const isOwn = msg.senderRole === user?.role?.toLowerCase();
    if (msg.senderRole === "admin") {
      return isOwn ? "items-end" : "items-start";
    }
    return isOwn ? "items-end" : "items-start";
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              ticketStatus === "open"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {ticketStatus}
          </span>
        </div>
        {canCloseTicket && ticketStatus === "open" && (
          <Button variant="outline" size="sm" onClick={onCloseTicket}>
            Close Ticket
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex animate-pulse">
                <div className="w-3/4 space-y-2">
                  <div className="h-16 bg-gray-200 rounded-lg" />
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No messages yet</p>
            <p className="text-sm text-gray-400 mt-1">Be the first to respond!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            console.log('Rendering message:', msg);
            return (
              <div
                key={msg.id || `msg-${idx}`}
                className={`flex flex-col ${getAlignment(msg)}`}
              >
              <div className={`max-w-[75%] rounded-lg px-4 py-3 ${getMessageStyle(msg)}`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
              </div>
              <div className="flex items-center gap-2 mt-1.5 px-1">
                <span className={`text-xs font-medium capitalize ${
                  msg.senderRole === 'admin'
                    ? 'text-purple-600'
                    : msg.senderRole === 'instructor'
                    ? 'text-emerald-600'
                    : 'text-blue-600'
                }`}>
                  {msg.senderRole}
                  {msg.senderId === user?.id && ' (you)'}
                </span>
                <span className="text-xs text-gray-400">
                  {formatTicketTime(msg.createdAt)}
                </span>
              </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {ticketStatus === "open" && (
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-end gap-3">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Enter to send)"
              rows={1}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <Button onClick={handleSend} disabled={!message.trim() || sending}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </Button>
          </div>
        </div>
      )}

      {ticketStatus === "closed" && (
        <div className="p-4 bg-gray-100 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">This ticket is closed</p>
        </div>
      )}
    </div>
  );
}

interface TicketListProps {
  tickets: SupportTicket[];
  selectedId?: string;
  onSelect: (ticket: SupportTicket) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function TicketList({
  tickets,
  selectedId,
  onSelect,
  loading = false,
  emptyMessage = "No tickets yet",
}: TicketListProps) {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 p-4 text-center">
        <div className="w-12 h-12 mb-2 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586l-2.707-2.707a1 1 0 00-1.414 0L8.586 13H6m2 0h2.586l2.707 2.707a1 1 0 001.414 0L17.414 15H20m-2 0v-3a2 2 0 00-2-2h-3.172M10 3v3" />
          </svg>
        </div>
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {tickets.map((ticket, idx) => (
        <button
          key={ticket.id || `ticket-${idx}`}
          onClick={() => onSelect(ticket)}
          className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
            selectedId === ticket.id ? "bg-blue-50" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{ticket.subject}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatTicketTime(ticket.updatedAt)}
              </p>
            </div>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                ticket.status === "open"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {ticket.status}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}