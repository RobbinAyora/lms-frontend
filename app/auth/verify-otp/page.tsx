"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";

function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailParam = searchParams.get("email") || "";

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // ✅ Sync email safely
  useEffect(() => {
    if (emailParam) {
      setFormData((prev) => ({
        ...prev,
        email: emailParam.trim().toLowerCase(),
      }));
    }
  }, [emailParam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, otp: value }));
  };

  // ✅ VERIFY OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.email) {
        throw new Error("Email missing. Please restart registration.");
      }

      if (formData.otp.length !== 6) {
        throw new Error("Enter a valid 6-digit OTP");
      }

      const payload = {
        email: formData.email.trim().toLowerCase(),
        otp: formData.otp.trim(),
      };

      console.log("VERIFY OTP PAYLOAD:", payload);

      await api.post("/api/auth/verify-otp", payload);

      router.push("/auth/login");
    } catch (err: any) {
      console.log("OTP ERROR:", err);

      const message =
        err?.message ||
        err?.response?.data?.message ||
        "Invalid or expired OTP";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ⚠️ RESEND OTP (backend dependent)
  const handleResend = async () => {
    setResending(true);
    setError("");

    try {
      if (!formData.email) {
        throw new Error("Email missing for resend OTP");
      }

      const payload = {
        email: formData.email.trim().toLowerCase(),
      };

      console.log("RESEND OTP PAYLOAD:", payload);

      await api.post("/api/auth/resend-otp", payload);

      alert("OTP resent successfully");
    } catch (err: any) {
      console.log("RESEND ERROR:", err);

      const message =
        err?.message ||
        err?.response?.data?.message ||
        "Failed to resend OTP (check backend route)";

      setError(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify OTP"
      subtitle={`Enter code sent to ${formData.email || "your email"}`}
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
            value={formData.email}
            disabled
            className="w-full px-4 py-3 border rounded-lg bg-slate-50 text-slate-500"
          />
        </div>

        {/* OTP */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Verification Code
          </label>

          <input
            type="text"
            value={formData.otp}
            onChange={handleChange}
            maxLength={6}
            inputMode="numeric"
            placeholder="000000"
            className="w-full px-4 py-3 border rounded-lg text-center text-2xl tracking-widest text-black focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* VERIFY BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {/* RESEND */}
        <p className="text-center text-sm text-slate-500">
          Didn't receive code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-blue-600 hover:underline"
          >
            {resending ? "Resending..." : "Resend"}
          </button>
        </p>

        {/* BACK */}
        <p className="text-center text-sm text-slate-500">
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            Back to Register
          </Link>
        </p>

      </form>
    </AuthLayout>
  );
}

function Loading() {
  return (
    <AuthLayout title="Verify OTP" subtitle="Loading...">
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    </AuthLayout>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<Loading />}>
      <VerifyOTPForm />
    </Suspense>
  );
}