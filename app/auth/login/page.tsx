"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ FIX: api.post returns data directly
      const data = await api.post<any>(
        "/api/auth/login",
        formData
      );

      console.log("LOGIN RESPONSE:", data);

      const access_token =
        data?.access_token || data?.token || data?.data?.access_token;

      const role =
        data?.role || data?.data?.role;

      const user =
        data?.user || data?.data?.user;

      if (!access_token) {
        throw new Error(
          data?.message || "Invalid login response from server"
        );
      }

      // Save auth
      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role || "");

      const userData = user || {
        id: "",
        email: formData.email,
        role:
          role === "ADMIN"
            ? "Admin"
            : role === "INSTRUCTOR"
            ? "Instructor"
            : "Student",
      };

      localStorage.setItem("user", JSON.stringify(userData));

      // cookies
      document.cookie = `token=${access_token}; path=/; max-age=${
        7 * 24 * 60 * 60
      }`;

      document.cookie = `user=${JSON.stringify(
        userData
      )}; path=/; max-age=${7 * 24 * 60 * 60}`;

      // Redirect
      const normalizedRole = role?.toUpperCase();

      if (normalizedRole === "ADMIN") {
        window.location.href = "/admin";
      } else if (normalizedRole === "INSTRUCTOR") {
        window.location.href = "/instructor";
      } else {
        window.location.href = "/student";
      }
    } catch (err: any) {
      console.log("Login error:", err);

      const message =
        err?.message ||
        err?.response?.data?.message ||
        "Login failed";

      if (message.toLowerCase().includes("verify")) {
        router.push(
          `/auth/verify-otp?email=${encodeURIComponent(
            formData.email
          )}`
        );
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account"
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* EMAIL */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-200 rounded-lg text-black"
            placeholder="you@example.com"
          />
        </div>

        {/* PASSWORD */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-200 rounded-lg text-black"
            placeholder="Enter your password"
          />
        </div>

        {/* FORGOT PASSWORD */}
        <div className="text-right">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* REGISTER */}
        <p className="text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link
            href="/auth/register"
            className="text-blue-600 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}