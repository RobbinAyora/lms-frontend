'use client'
import { useState, useEffect, useRef } from "react";
import { supportApi } from "@/lib/support";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function StudentSupport() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", description: "", category: "TECHNICAL" });
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const userId = localStorage.getItem("userId") || "student-1";

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await supportApi.getMyTickets();
      setTickets(data || []);
      if (data?.length) selectTicket(data[0]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    try {
      const msgs = await supportApi.getMessages(ticket.id);
      setMessages(msgs || []);
    } catch (err) {
      console.error(err);
    }
    setSidebarOpen(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket || selectedTicket.status === "CLOSED") return;
    setSending(true);
    try {
      const msg = await supportApi.sendMessage(selectedTicket.id, newMessage);
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const createTicket = async () => {
    if (!newTicket.subject.trim()) return;
    try {
      const ticket = await supportApi.createTicket(newTicket.subject);
      const firstMsg = await supportApi.sendMessage(ticket.id, newTicket.description);
      setTickets((prev) => [ticket, ...prev]);
      setSelectedTicket(ticket);
      setMessages([firstMsg]);
      setShowNewTicket(false);
      setNewTicket({ subject: "", description: "", category: "TECHNICAL" });
    } catch (err) {
      console.error(err);
    }
  };

  const categoryColors = {
    TECHNICAL: { bg: "#EFF6FF", text: "#2563EB" },
    BILLING: { bg: "#F0FDF4", text: "#16A34A" },
    GENERAL: { bg: "#FFF7ED", text: "#EA580C" },
    COURSE: { bg: "#FDF4FF", text: "#9333EA" },
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", background: "#F8FAFF", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 2px; }
        textarea:focus, input:focus, select:focus { outline: none; }
        .ticket-item:hover { background: #EFF6FF !important; }
        .send-btn:hover { background: #1D4ED8 !important; transform: scale(1.03); }
        .send-btn:active { transform: scale(0.97); }
        .new-ticket-btn:hover { background: #1D4ED8 !important; }
        .close-btn:hover { background: #F1F5F9 !important; }
        @media (max-width: 768px) {
          .sidebar { position: fixed !important; left: ${sidebarOpen ? "0" : "-100%"} !important; z-index: 100; transition: left 0.3s ease; height: 100vh; }
          .overlay { display: ${sidebarOpen ? "block" : "none"} !important; }
        }
      `}</style>

      {/* Overlay for mobile */}
      <div className="overlay" onClick={() => setSidebarOpen(false)} style={{ display: "none", position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 99 }} />

      {/* Sidebar */}
      <div className="sidebar" style={{ width: 320, background: "#fff", borderRight: "1px solid #E2E8F0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Header */}
        <div style={{ padding: "20px 20px 0", borderBottom: "1px solid #F1F5F9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #2563EB, #60A5FA)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>S</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>My Support</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>Student Portal</div>
            </div>
          </div>
          <button className="new-ticket-btn" onClick={() => setShowNewTicket(true)} style={{ width: "100%", padding: "10px", background: "#2563EB", color: "#fff", border: "none", borderRadius: 10, fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 16, transition: "background 0.2s" }}>
            + New Ticket
          </button>
        </div>

        {/* Ticket List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", padding: "8px 8px 4px" }}>Your Tickets</div>
          {tickets.map((t) => (
            <div key={t.id} className="ticket-item" onClick={() => selectTicket(t)} style={{ padding: "12px", borderRadius: 10, cursor: "pointer", marginBottom: 4, background: selectedTicket?.id === t.id ? "#EFF6FF" : "transparent", borderLeft: selectedTicket?.id === t.id ? "3px solid #2563EB" : "3px solid transparent", transition: "all 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#0F172A", lineHeight: 1.4, flex: 1 }}>{t.subject}</div>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: t.status === "OPEN" ? "#DCFCE7" : "#F1F5F9", color: t.status === "OPEN" ? "#16A34A" : "#64748B", flexShrink: 0 }}>{t.status}</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 4, background: categoryColors[t.category]?.bg || "#F1F5F9", color: categoryColors[t.category]?.text || "#64748B", fontWeight: 500 }}>{t.category}</span>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>{timeAgo(t.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {selectedTicket ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: "16px 24px", background: "#fff", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setSidebarOpen(true)} style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6 }} className="menu-btn">
                <svg width="20" height="20" fill="none" stroke="#64748B" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedTicket.subject}</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 1 }}>Ticket #{selectedTicket.id} · {selectedTicket.category}</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: selectedTicket.status === "OPEN" ? "#DCFCE7" : "#F1F5F9", color: selectedTicket.status === "OPEN" ? "#16A34A" : "#64748B" }}>{selectedTicket.status}</span>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {messages.map((msg) => {
                const isMe = msg.senderId === userId;
                return (
                  <div key={msg.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 10, alignItems: "flex-end" }}>
                    {!isMe && (
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #2563EB, #93C5FD)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>A</span>
                      </div>
                    )}
                    <div style={{ maxWidth: "68%" }}>
                      {!isMe && <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4, fontWeight: 500 }}>Support Agent</div>}
                      <div style={{ padding: "12px 16px", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: isMe ? "linear-gradient(135deg, #2563EB, #3B82F6)" : "#fff", color: isMe ? "#fff" : "#0F172A", fontSize: 14, lineHeight: 1.5, boxShadow: isMe ? "0 2px 8px rgba(37,99,235,0.3)" : "0 1px 4px rgba(0,0,0,0.06)", border: isMe ? "none" : "1px solid #E2E8F0" }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4, textAlign: isMe ? "right" : "left" }}>{formatTime(msg.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {selectedTicket.status === "OPEN" ? (
              <div style={{ padding: "16px 24px", background: "#fff", borderTop: "1px solid #E2E8F0" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-end", background: "#F8FAFF", borderRadius: 16, padding: "12px 16px", border: "1.5px solid #E2E8F0" }}>
                  <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Type your message..." rows={1} style={{ flex: 1, background: "none", border: "none", resize: "none", fontFamily: "inherit", fontSize: 14, color: "#0F172A", lineHeight: 1.5, maxHeight: 120, overflowY: "auto" }} />
                  <button className="send-btn" onClick={sendMessage} disabled={sending || !newMessage.trim()} style={{ width: 40, height: 40, borderRadius: 12, background: newMessage.trim() ? "#2563EB" : "#CBD5E1", border: "none", cursor: newMessage.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 8, textAlign: "center" }}>Press Enter to send · Shift+Enter for new line</div>
              </div>
            ) : (
              <div style={{ padding: "20px 24px", background: "#F8FAFF", borderTop: "1px solid #E2E8F0", textAlign: "center" }}>
                <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>🔒 This ticket is closed. Open a new ticket if you need further assistance.</span>
              </div>
            )}
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
            <div style={{ fontWeight: 600, fontSize: 16, color: "#64748B" }}>Select a ticket to view messages</div>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#0F172A" }}>New Support Ticket</div>
              <button className="close-btn" onClick={() => setShowNewTicket(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 8px", borderRadius: 8, color: "#64748B", fontSize: 18 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Category</label>
                <select value={newTicket.category} onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontFamily: "inherit", fontSize: 14, color: "#0F172A", background: "#F8FAFF", cursor: "pointer" }}>
                  <option value="TECHNICAL">Technical Issue</option>
                  <option value="BILLING">Billing</option>
                  <option value="COURSE">Course Related</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Subject</label>
                <input value={newTicket.subject} onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })} placeholder="Brief description of your issue" style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontFamily: "inherit", fontSize: 14, color: "#0F172A" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Description</label>
                <textarea value={newTicket.description} onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })} placeholder="Describe your issue in detail..." rows={4} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontFamily: "inherit", fontSize: 14, color: "#0F172A", resize: "vertical" }} />
              </div>
              <button onClick={createTicket} disabled={!newTicket.subject.trim()} style={{ padding: "12px", background: newTicket.subject.trim() ? "#2563EB" : "#CBD5E1", color: "#fff", border: "none", borderRadius: 12, fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: newTicket.subject.trim() ? "pointer" : "default", transition: "background 0.2s" }}>
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}