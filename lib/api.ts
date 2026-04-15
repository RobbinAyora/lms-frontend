import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
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
  register: (data: RegisterData) => api.post("/auth/register", data),
  login: (data: LoginData) => api.post("/auth/login", data),
  verifyOTP: (data: VerifyOTPData) => api.post("/auth/verify-otp", data),
  forgotPassword: (data: ForgotPasswordData) => api.post("/auth/forgot-password", data),
  resetPassword: (data: ResetPasswordData) => api.post("/auth/reset-password", data),
};

export default api;