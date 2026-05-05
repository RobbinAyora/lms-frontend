"use client";

import { useEffect, useState, useRef } from "react";
import { supportApi } from "@/lib/support";

export default function SupportPage({ role }: { role: "ADMIN" | "INSTRUCTOR" | "STUDENT" }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data =
        role === "ADMIN"
          ? await supportApi.getAllTickets()
          : await supportApi.getMyTickets();

      setTickets(data || []);
      if (data?.length) selectTicket(data[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const selectTicket = async (ticket: any) => {
    setActiveTicket(ticket);
    const msgs = await supportApi.getMessages(ticket.id);
    setMessages(msgs || []);
  };

  const sendMessage = async () => {
    if (!activeTicket || !message.trim()) return;

    const newMsg = await supportApi.sendMessage(activeTicket.id, message);

    setMessages((prev) => [...prev, newMsg]);
    setMessage("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-white text-black">

      {/* SIDEBAR */}
      <div className="w-80 border-r border-gray-200 flex flex-col">

        <div className="p-4 border-b bg-blue-50">
          <h1 className="font-bold text-blue-700">
            Support ({role})
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => selectTicket(t)}
              className={`p-4 cursor-pointer border-b hover:bg-blue-50 ${
                activeTicket?.id === t.id ? "bg-blue-100" : ""
              }`}
            >
              <p className="font-semibold text-sm">{t.subject}</p>
              <p className="text-xs text-gray-500">{t.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <div className="p-4 border-b bg-blue-50">
          <h2 className="font-semibold text-blue-700">
            {activeTicket?.subject || "Select a ticket"}
          </h2>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-md p-3 rounded-lg text-sm ${
                m.senderRole === role
                  ? "ml-auto bg-blue-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              {m.message}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="p-4 border-t flex gap-2 bg-white">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-black"
            placeholder="Type message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}