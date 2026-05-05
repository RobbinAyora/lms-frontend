import { api } from "./client";

export const supportApi = {
  // Student + Instructor (same endpoint in backend)
  getMyTickets: () => api.get("/api/support/my-tickets"),

  // Admin only
  getAllTickets: () => api.get("/api/support"),

  getMessages: (ticketId: string) =>
    api.get(`/api/support/${ticketId}/messages`),

  createTicket: (subject: string) =>
    api.post("/api/support", { subject }),

  sendMessage: (ticketId: string, message: string) =>
    api.post(`/api/support/${ticketId}/messages`, { message }),

  closeTicket: (ticketId: string) =>
    api.patch(`/api/support/${ticketId}/close`),
};