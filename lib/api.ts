import axios from "axios";

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach JWT token as Bearer
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface RegisterData {
  email: string;
  password: string;
  role: "Student" | "Instructor" | "Admin";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  resetToken: string;
  newPassword: string;
}

export const authApi = {
  register: (data: RegisterData) => api.post("/api/auth/register", data),
  login: (data: LoginData) => api.post("/api/auth/login", data),
  verifyOTP: (data: VerifyOTPData) => api.post("/api/auth/verify-otp", data),
  forgotPassword: (data: ForgotPasswordData) => api.post("/api/auth/forgot-password", data),
  resetPassword: (data: ResetPasswordData) => api.post("/api/auth/reset-password", data),
};

export interface SupportTicket {
  id: string;
  subject: string;
  status: "open" | "closed";
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
  };
}

export interface SupportMessage {
  id: string;
  message: string;
  senderRole: "student" | "instructor" | "admin";
  senderId?: string;
  createdAt: string;
}

export interface TicketsResponse {
  data: SupportTicket[];
}

export interface MessagesResponse {
  data: SupportMessage[];
}

export interface CreateTicketData {
  subject: string;
  message: string;
}

export const supportApi = {
  getTickets: async (): Promise<SupportTicket[]> => {
    const response = await api.get<TicketsResponse>("/api/support/my-tickets");
    return response.data || [];
  },

  getAllTickets: async (): Promise<SupportTicket[]> => {
    const response = await api.get<TicketsResponse>("/api/support");
    return response.data || [];
  },

  createTicket: async (data: CreateTicketData): Promise<SupportTicket> => {
    return api.post<SupportTicket>("/api/support", data);
  },

  closeTicket: async (id: string): Promise<void> => {
    await api.patch<void>(`/api/support/${id}/close`);
  },

  getMessages: async (ticketId: string): Promise<SupportMessage[]> => {
    const response = await api.get<MessagesResponse>(`/api/support/${ticketId}/messages`);
    console.log('getMessages response:', response);
    return Array.isArray(response) ? response : (response.data || []);
  },

  sendMessage: async (ticketId: string, message: string): Promise<SupportMessage> => {
    return api.post<SupportMessage>(`/api/support/${ticketId}/messages`, { message });
  },
};

export function formatTicketTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default api;