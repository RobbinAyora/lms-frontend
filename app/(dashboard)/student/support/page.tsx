"use client";

import { useEffect, useRef, useState } from "react";

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
  senderRole: "admin" | "user";
  senderId: string;
  createdAt: string;
}

/* ================= API ================= */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ================= TOKEN ================= */

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

/* ================= SAFE FETCH ================= */

async function safeFetch(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);

    const text = await res.text(); // prevent JSON crash

    if (!res.ok) {
      throw new Error(text || `Request failed: ${res.status}`);
    }

    return text ? JSON.parse(text) : null;
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}

/* ================= COMPONENT ================= */

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

  const base = API_URL;

  /* ================= LOAD TICKETS ================= */

  const loadTickets = async () => {
    if (!base) return;

    setLoadingTickets(true);

    try {
      const data = await safeFetch(`${base}/api/support`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      setTickets(data || []);
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  /* ================= LOAD MESSAGES ================= */

  const loadMessages = async (ticketId: string) => {
    if (!base) return;

    setLoadingMessages(true);

    try {
      const data = await safeFetch(
        `${base}/api/support/${ticketId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      setMessages(data || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  /* ================= SEND MESSAGE ================= */

  const sendMessage = async () => {
    if (!selected || !message.trim() || !base) return;

    setSending(true);

    try {
      const data = await safeFetch(
        `${base}/api/support/${selected.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ message }),
        }
      );

      if (data) {
        setMessages((prev) => [...prev, data]);
      }

      setMessage("");
    } catch (err) {
      console.error("Send message failed:", err);
    } finally {
      setSending(false);
    }
  };

  /* ================= CLOSE TICKET ================= */

  const closeTicket = async () => {
    if (!selected || !base) return;

    setClosing(true);

    try {
      await safeFetch(
        `${base}/api/support/${selected.id}/close`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const updated = { ...selected, status: "closed" as const };

      setSelected(updated);

      setTickets((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    } catch (err) {
      console.error("Close ticket failed:", err);
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
    <div className="flex h-screen bg-blue-50 text-gray-900">

      {/* LEFT */}
      <aside className="w-80 bg-white border-r border-blue-100 flex flex-col">

        <div className="p-4 border-b bg-blue-50">
          <h1 className="font-bold text-blue-700">Support Tickets</h1>
        </div>

        <div className="flex-1 overflow-y-auto">

          {loadingTickets ? (
            <p className="p-4 text-blue-600">Loading...</p>
          ) : (
            tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                className={`w-full text-left p-4 border-b hover:bg-blue-50 ${
                  selected?.id === t.id
                    ? "bg-blue-100 border-l-4 border-blue-600"
                    : ""
                }`}
              >
                <p className="font-semibold">{t.subject}</p>
                <p className="text-xs text-gray-500">{t.user?.name}</p>
                <p className="text-xs">
                  {t.status}
                </p>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* RIGHT */}
      <main className="flex-1 flex flex-col bg-white">

        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-blue-600">
            Select a ticket
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="p-4 border-b bg-blue-50 flex justify-between">
              <div>
                <h2 className="font-bold text-blue-800">
                  {selected.subject}
                </h2>
                <p className="text-xs">{selected.user?.name}</p>
              </div>

              {selected.status === "open" && (
                <button
                  onClick={closeTicket}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  {closing ? "Closing..." : "Close"}
                </button>
              )}
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">

              {loadingMessages ? (
                <p className="text-blue-500">Loading...</p>
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
                      className={`px-4 py-2 rounded max-w-xs ${
                        m.senderRole === "admin"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 border"
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
              <div className="p-4 border-t bg-blue-50 flex gap-2">

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 border p-3 rounded"
                  placeholder="Type message..."
                />

                <button
                  onClick={sendMessage}
                  disabled={sending}
                  className="bg-blue-600 text-white px-5 rounded"
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