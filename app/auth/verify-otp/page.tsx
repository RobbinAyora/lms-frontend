"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi, VerifyOTPData } from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";

function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [formData, setFormData] = useState<VerifyOTPData>({
    email: email,
    otp: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData({ ...formData, otp: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      await authApi.verifyOTP(formData);
      router.push("/auth/login");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Verify OTP" subtitle={`Enter the code sent to ${email}`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Verification Code</label>
          <input
            type="text"
            value={formData.otp}
            onChange={handleChange}
            maxLength={6}
            required
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest text-black"
            placeholder="000000"
            inputMode="numeric"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <p className="text-center text-sm text-slate-500">
          Didn't receive code?{" "}
          <button type="button" className="text-blue-600 hover:underline">
            Resend
          </button>
        </p>

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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