import { api } from "./api/client";

export interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  login: (data: LoginData) =>
    api.post("/api/auth/login", data),

  register: (data: any) =>
    api.post("/api/auth/register", data),

  verifyOTP: (data: any) =>
    api.post("/api/auth/verify-otp", data),

  forgotPassword: (data: any) =>
    api.post("/api/auth/forgot-password", data),

  resetPassword: (data: any) =>
    api.post("/api/auth/reset-password", data),
};