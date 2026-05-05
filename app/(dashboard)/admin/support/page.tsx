'use client';

import { useState, useEffect, useRef } from "react";
import { supportApi } from "@/lib/support";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const categoryConfig: any = {
  TECHNICAL: { bg: "#EFF6FF", text: "#2563EB", label: "Technical" },
  BILLING: { bg: "#F0FDF4", text: "#16A34A", label: "Billing" },
  GENERAL: { bg: "#FFF7ED", text: "#EA580C", label: "General" },
  COURSE: { bg: "#FDF4FF", text: "#9333EA", label: "Course" },
};

const roleConfig: any = {
  STUDENT: { bg: "#EFF6FF", text: "#2563EB" },
  INSTRUCTOR: { bg: "#FFF7ED", text: "#EA580C" },
  ADMIN: { bg: "#F0FDF4", text: "#16A34A" },
};

export default function AdminSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await supportApi.getAllTickets();
      setTickets(data || []);

      if (data?.length) {
        selectTicket(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectTicket = async (ticket: any) => {
    setSelectedTicket(ticket);
    try {
      const msgs = await supportApi.getMessages(ticket.id);
      setMessages(msgs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setSending(true);
    try {
      const msg = await supportApi.sendMessage(
        selectedTicket.id,
        newMessage
      );

      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const closeTicket = async (ticketId: string) => {
    try {
      await supportApi.closeTicket(ticketId);

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status: "CLOSED" } : t
        )
      );

      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((t: any) => ({ ...t, status: "CLOSED" }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchFilter = filter === "ALL" || t.status === filter;

    const matchSearch =
      !search ||
      t.subject?.toLowerCase().includes(search.toLowerCase());

    return matchFilter && matchSearch;
  });

  return (
    <div style={{ display: "flex", height: "100vh", background: "#F8FAFF" }}>

      {/* SIDEBAR */}
      <div style={{ width: 340, background: "#fff", borderRight: "1px solid #E2E8F0" }}>
        <div style={{ padding: 16 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            style={{ width: "100%", padding: 10, border: "1px solid #E2E8F0", borderRadius: 8 }}
          />
        </div>

        {filteredTickets.map((ticket) => {
          const userInitial = (ticket.user?.name?.[0] || "U").toUpperCase();
          const userName = ticket.user?.name || "Unknown User";

          return (
            <div
              key={ticket.id}
              onClick={() => selectTicket(ticket)}
              style={{
                padding: 12,
                cursor: "pointer",
                borderBottom: "1px solid #F1F5F9",
                background: selectedTicket?.id === ticket.id ? "#EFF6FF" : "#fff",
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {ticket.subject}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                
                {/* SAFE USER ICON */}
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "#2563EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {userInitial}
                </div>

                <span style={{ fontSize: 12, color: "#64748B" }}>
                  {userName}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* MESSAGES */}
        <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#64748B" }}>
                {msg.senderRole}
              </div>

              <div
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: "#fff",
                  border: "1px solid #E2E8F0",
                  display: "inline-block",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div style={{ padding: 16, borderTop: "1px solid #E2E8F0", background: "#fff" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type message..."
              style={{
                flex: 1,
                padding: 10,
                border: "1px solid #E2E8F0",
                borderRadius: 8,
              }}
            />

            <button
              onClick={sendMessage}
              style={{
                padding: "10px 16px",
                background: "#2563EB",
                color: "#fff",
                border: "none",
                borderRadius: 8,
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}