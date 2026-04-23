"use client";

import { useState, useEffect } from "react";
import { DashboardLayout, StatCard } from "@/components/dashboard";
import { Button } from "@/components/ui/Button";
import type { SupportTicket, SupportMessage } from "@/lib/api";
import { supportApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { TicketList, ChatUI } from "@/components/support/ChatUI";

const instructorNavItems = [
  {
    label: "Dashboard",
    href: "/instructor",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "My Courses",
    href: "/instructor/courses",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    label: "Course Builder",
    href: "/instructor/builder",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    label: "Students",
    href: "/instructor/students",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    label: "Assignments",
    href: "/instructor/assignments",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Earnings",
    href: "/instructor/earnings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Support",
    href: "/instructor/support",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/instructor/profile",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function InstructorSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");
  const [messagesSent, setMessagesSent] = useState(0);

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    loadTickets();
  }, [filter, messagesSent]);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await supportApi.getAllTickets();
      setTickets(filter === "all" ? data : data.filter(t => t.status === filter));
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (ticketId: string) => {
    setMessagesLoading(true);
    try {
      const data = await supportApi.getMessages(ticketId);
      console.log('Instructor loaded messages:', data);
      // If no messages from API but ticket has initial message, use that
      if (data.length === 0 && selectedTicket?.message) {
        const initialMessage: SupportMessage = {
          id: 'initial-' + ticketId,
          message: selectedTicket.message,
          senderRole: 'student',
          senderId: selectedTicket.userId || '',
          createdAt: selectedTicket.createdAt,
        };
        setMessages([initialMessage]);
      } else {
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedTicket) return;
    try {
      await supportApi.sendMessage(selectedTicket.id, message);
      setMessagesSent(prev => prev + 1);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    try {
      await supportApi.closeTicket(selectedTicket.id);
      setSelectedTicket({ ...selectedTicket, status: "closed" });
      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicket.id ? { ...t, status: "closed" } : t))
      );
    } catch (error) {
      console.error('Failed to close ticket:', error);
    }
  };

  const filteredTickets = filter === "all" ? tickets : tickets.filter(t => t.status === filter);
  const openCount = tickets.filter(t => t.status === "open").length;
  const closedCount = tickets.filter(t => t.status === "closed").length;

  return (
    <DashboardLayout navItems={instructorNavItems} title="Support Tickets">
      <div className="flex h-[calc(100vh-140px)] bg-gray-50 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* TICKET LIST SIDEBAR */}
        <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">All Tickets</h2>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {tickets.length}
              </span>
            </div>
            <div className="flex gap-1.5">
              {(["all", "open", "closed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    filter === f
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === "open" && openCount > 0 && (
                    <span className="ml-1.5 px-1 py-0.5 text-[10px] bg-blue-500 text-white rounded-full">{openCount}</span>
                  )}
                  {f === "closed" && closedCount > 0 && (
                    <span className="ml-1.5 px-1 py-0.5 text-[10px] bg-gray-500 text-white rounded-full">{closedCount}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <TicketList
              tickets={filteredTickets}
              selectedId={selectedTicket?.id}
              onSelect={(ticket) => {
                console.log('Instructor selected ticket:', ticket);
                setSelectedTicket(ticket);
              }}
              loading={loading}
              emptyMessage={
                filter === "all"
                  ? "No tickets received yet"
                  : `No ${filter} tickets`
              }
            />
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedTicket ? (
            <>
              {/* HEADER */}
              <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {selectedTicket.subject}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        selectedTicket.status === "open"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {selectedTicket.status === "open" ? "Active" : "Closed"}
                      </span>
                    </div>
                    {selectedTicket.user && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {selectedTicket.user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedTicket.user.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            Ticket #{selectedTicket.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>Created: {new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {selectedTicket.status === "open" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCloseTicket}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Close Ticket
                    </Button>
                  )}
                </div>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                <ChatUI
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  loading={messagesLoading}
                  ticketStatus={selectedTicket.status}
                  canCloseTicket={true}
                />
              </div>
            </>
          ) : (
            /* EMPTY STATE */
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center p-8 max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Ticket</h3>
                <p className="text-gray-500">
                  Choose a support ticket from the sidebar to view the conversation and respond.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
  }, [selectedTicket]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await supportApi.getAllTickets();
      setTickets(filter === "all" ? data : data.filter(t => t.status === filter));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (ticketId: string) => {
    setMessagesLoading(true);
    try {
      const data = await supportApi.getMessages(ticketId);
      setMessages(data);
    } catch {
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedTicket) return;
    try {
      await supportApi.sendMessage(selectedTicket.id, message);
      await loadMessages(selectedTicket.id);
      setMessagesSent((prev) => prev + 1);
    } catch {
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    try {
      await supportApi.closeTicket(selectedTicket.id);
      setSelectedTicket({ ...selectedTicket, status: "closed" });
    } catch {
    }
  };

  const filteredTickets = filter === "all" ? tickets : tickets.filter(t => t.status === filter);
  const openCount = tickets.filter(t => t.status === "open").length;
  const closedCount = tickets.filter(t => t.status === "closed").length;

  return (
    <DashboardLayout navItems={instructorNavItems} title="Support Tickets">
      <div className="flex h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="w-full md:w-96 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">All Tickets</h2>
            </div>
            <div className="flex gap-2">
              {(["all", "open", "closed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                    filter === f
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === "open" && openCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">{openCount}</span>
                  )}
                  {f === "closed" && closedCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-gray-500 text-white rounded-full">{closedCount}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <TicketList
            tickets={filteredTickets}
            selectedId={selectedTicket?.id}
            onSelect={setSelectedTicket}
            loading={loading}
            emptyMessage="No tickets found"
          />
        </div>

        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedTicket ? (
            <>
              <div className="p-4 bg-white border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedTicket.subject}</h3>
                    {selectedTicket.user && (
                      <p className="text-sm text-gray-500 mt-1">
                        From: {selectedTicket.user.email}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedTicket.status === "open"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {selectedTicket.status}
                      </span>
                    </div>
                  </div>
                  {selectedTicket.status === "open" && (
                    <Button variant="outline" size="sm" onClick={handleCloseTicket}>
                      Close Ticket
                    </Button>
                  )}
                </div>
              </div>

              <ChatUI
                messages={messages}
                onSendMessage={handleSendMessage}
                loading={messagesLoading}
                ticketStatus={selectedTicket.status}
                canCloseTicket={true}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p>Select a ticket to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}