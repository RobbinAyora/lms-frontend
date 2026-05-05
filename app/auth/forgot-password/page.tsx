"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      console.log("Forgot password response:", res);

      setSuccess(true);
    } catch (err: any) {
      console.log("Forgot password error:", err);

      setError(
        err?.message || "Failed to send reset email"
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="Reset instructions sent"
      >
        <div className="text-center space-y-5">
          <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg">
            If the email exists, reset instructions have been sent.
          </div>

          <Link
            href="/auth/login"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
          >
            Back to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg text-black"
          placeholder="you@example.com"
          required
        />

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p className="text-center text-sm text-slate-500">
          Remember password?{" "}
          <Link href="/auth/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}