"use client";

import { useEffect, useRef, useState } from "react";

/* ================= CONFIG ================= */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ================= TYPES ================= */

interface SupportTicket {
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

interface SupportMessage {
  id: string;
  message: string;
  senderRole: "admin" | "user" | "student";
  senderId: string;
  createdAt: string;
}

/* ================= TOKEN ================= */

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

/* ================= PAGE ================= */

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selected, setSelected] = useState<SupportTicket | null>(null);

  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [message, setMessage] = useState("");

  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  /* ================= LOAD TICKETS ================= */

  const loadTickets = async () => {
    setLoadingTickets(true);

    try {
      const res = await fetch(`${API_URL}/api/support`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed: ${res.status} ${text}`);
      }

      const data = await res.json();
      setTickets(data || []);
    } catch (err) {
      console.error("Error loading tickets:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  /* ================= LOAD MESSAGES ================= */

  const loadMessages = async (ticketId: string) => {
    setLoadingMessages(true);

    try {
      const res = await fetch(
        `${API_URL}/api/support/${ticketId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed: ${res.status} ${text}`);
      }

      const data = await res.json();
      setMessages(data || []);
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  /* ================= SEND MESSAGE ================= */

  const sendMessage = async () => {
    if (!selected || !message.trim()) return;

    setSending(true);

    try {
      const res = await fetch(
        `${API_URL}/api/support/${selected.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ message }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed: ${res.status} ${text}`);
      }

      const data = await res.json();

      setMessages((prev) => [...prev, data]);
      setMessage("");
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setSending(false);
    }
  };

  /* ================= CLOSE TICKET ================= */

  const closeTicket = async () => {
    if (!selected) return;

    setClosing(true);

    try {
      const res = await fetch(
        `${API_URL}/api/support/${selected.id}/close`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed: ${res.status} ${text}`);
      }

      const updated = { ...selected, status: "closed" as const };

      setSelected(updated);
      setTickets((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    } catch (err) {
      console.error("Close ticket error:", err);
    } finally {
      setClosing(false);
    }
  };

  /* ================= EFFECTS ================= */

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (selected) loadMessages(selected.id);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= UI ================= */

  return (
    <div className="flex h-screen bg-gray-100">

      {/* LEFT SIDEBAR */}
      <aside className="w-80 bg-white border-r flex flex-col">

        <div className="p-4 border-b">
          <h1 className="font-bold text-lg">Support Tickets</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingTickets ? (
            <p className="p-4">Loading...</p>
          ) : (
            tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                className={`w-full text-left p-4 border-b hover:bg-gray-100 ${
                  selected?.id === t.id ? "bg-gray-200" : ""
                }`}
              >
                <p className="font-semibold">{t.subject}</p>
                <p className="text-xs text-gray-500">{t.user?.name}</p>
                <p className="text-xs text-gray-400">{t.status}</p>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* CHAT AREA */}
      <main className="flex-1 flex flex-col">

        {!selected ? (
          <div className="flex-1 flex items-center justify-center">
            Select a ticket
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="p-4 bg-white border-b flex justify-between">
              <div>
                <h2 className="font-bold">{selected.subject}</h2>
                <p className="text-xs text-gray-500">
                  {selected.user?.name}
                </p>
              </div>

              {selected.status === "open" && (
                <button
                  onClick={closeTicket}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  {closing ? "Closing..." : "Close"}
                </button>
              )}
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                <p>Loading messages...</p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.senderRole === "admin"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-3 py-2 rounded max-w-xs ${
                        m.senderRole === "admin"
                          ? "bg-blue-600 text-white"
                          : "bg-white border"
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                ))
              )}

              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            {selected.status === "open" && (
              <div className="p-4 border-t flex gap-2 bg-white">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 border p-2 rounded"
                />

                <button
                  onClick={sendMessage}
                  disabled={sending}
                  className="bg-blue-600 text-white px-4 rounded"
                >
                  Send
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}