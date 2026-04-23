"use client";

import { useState, useEffect, useRef } from "react";

interface Ticket {
  id: string;
  subject: string;
  status: "open" | "closed";
  createdAt: string;
  latestMessage?: string;
  user?: {
    name: string;
    email: string;
  };
}

interface Message {
  id: string;
  message: string;
  senderId: string;
  senderRole: "admin" | "user";
  createdAt: string;
}

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [closingTicket, setClosingTicket] = useState(false);
  const [ticketsError, setTicketsError] = useState("");
  const [messagesError, setMessagesError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load tickets on mount
  useEffect(() => {
    loadTickets();
  }, []);

  // Filter tickets when search or statusFilter changes
  useEffect(() => {
    let result = tickets;
    if (search.trim()) {
      result = result.filter((t) =>
        t.subject.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }
    setFilteredTickets(result);
  }, [tickets, search, statusFilter]);

  // Load messages when selected ticket changes
  useEffect(() => {
    if (!selectedTicket) return;
    loadMessages(selectedTicket.id);
  }, [selectedTicket]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadTickets = async () => {
    setLoadingTickets(true);
    setTicketsError("");
    try {
      const res = await fetch("/api/support", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`Failed to load tickets (${res.status})`);
      const data = await res.json();
      setTickets(data);
    } catch (err: any) {
      setTicketsError(err.message || "Failed to load tickets");
    } finally {
      setLoadingTickets(false);
    }
  };

  const loadMessages = async (ticketId: string) => {
    setLoadingMessages(true);
    setMessagesError("");
    try {
      const res = await fetch(`/api/support/${ticketId}/messages`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`Failed to load messages (${res.status})`);
      const data = await res.json();
      setMessages(data);
    } catch (err: any) {
      setMessagesError(err.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    setSendingMessage(true);
    try {
      const res = await fetch(`/api/support/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      const data = await res.json();
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
    } catch (err: any) {
      alert(err.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    setClosingTicket(true);
    try {
      const res = await fetch(`/api/support/${selectedTicket.id}/close`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to close ticket");
      const updated = { ...selectedTicket, status: "closed" as const };
      setSelectedTicket(updated);
      setTickets((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    } catch (err: any) {
      alert(err.message || "Failed to close ticket");
    } finally {
      setClosingTicket(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* ── LEFT PANEL ── */}
      <aside className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                Support
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {tickets.filter((t) => t.status === "open").length} open tickets
              </p>
            </div>
            <button
              onClick={loadTickets}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-700"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(["all", "open", "closed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                  statusFilter === f
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket list */}
        <div className="flex-1 overflow-y-auto">
          {loadingTickets ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : ticketsError ? (
            <div className="p-5 text-center">
              <p className="text-sm text-red-500 mb-3">{ticketsError}</p>
              <button
                onClick={loadTickets}
                className="text-xs text-blue-600 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-5 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No tickets found</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full text-left px-4 py-4 border-b border-gray-50 hover:bg-blue-50 transition-colors relative ${
                  selectedTicket?.id === ticket.id
                    ? "bg-blue-50 border-l-4 border-l-blue-600"
                    : "border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-800 leading-tight line-clamp-1">
                    {ticket.subject}
                  </span>
                  <span
                    className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                      ticket.status === "open"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
                {ticket.latestMessage && (
                  <p className="text-xs text-gray-400 line-clamp-1 mb-1">
                    {ticket.latestMessage}
                  </p>
                )}
                {ticket.user && (
                  <p className="text-xs text-gray-400">{ticket.user.name}</p>
                )}
                <p className="text-xs text-gray-300 mt-1">
                  {formatDate(ticket.createdAt)}
                </p>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {!selectedTicket ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Select a ticket
            </h2>
            <p className="text-sm text-gray-400 max-w-xs">
              Choose a support ticket from the left panel to view the conversation and respond.
            </p>
          </div>
        ) : (
          <>
            {/* Ticket header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">
                    {selectedTicket.user?.name?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-gray-900 truncate">
                    {selectedTicket.subject}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {selectedTicket.user && (
                      <span className="text-xs text-gray-400">
                        {selectedTicket.user.name}
                      </span>
                    )}
                    <span className="text-gray-200">·</span>
                    <span className="text-xs text-gray-400">
                      {formatDate(selectedTicket.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                    selectedTicket.status === "open"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {selectedTicket.status === "open" ? "● Open" : "● Closed"}
                </span>

                {selectedTicket.status === "open" && (
                  <button
                    onClick={handleCloseTicket}
                    disabled={closingTicket}
                    className="text-xs px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {closingTicket ? "Closing..." : "Close Ticket"}
                  </button>
                )}
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {loadingMessages ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                    >
                      <div className="animate-pulse">
                        <div
                          className={`h-10 rounded-2xl ${
                            i % 2 === 0 ? "bg-gray-100 w-48" : "bg-blue-100 w-36"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messagesError ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-sm text-red-500 mb-2">{messagesError}</p>
                  <button
                    onClick={() => loadMessages(selectedTicket.id)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-sm text-gray-400">No messages yet. Start the conversation.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdmin = msg.senderRole === "admin";
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-sm lg:max-w-md ${isAdmin ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        <div
                          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                            isAdmin
                              ? "bg-blue-600 text-white rounded-br-sm"
                              : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm"
                          }`}
                        >
                          {msg.message}
                        </div>
                        <span className="text-xs text-gray-400 px-1">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0">
              {selectedTicket.status === "closed" ? (
                <div className="flex items-center justify-center py-2">
                  <span className="text-sm text-gray-400 bg-gray-50 px-4 py-2 rounded-lg">
                    This ticket is closed and cannot receive new messages.
                  </span>
                </div>
              ) : (
                <div className="flex items-end gap-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a reply... (Enter to send)"
                    rows={2}
                    className="flex-1 px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-400 text-gray-800"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="flex-shrink-0 w-11 h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors"
                  >
                    {sendingMessage ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}