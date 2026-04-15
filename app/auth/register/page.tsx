"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi, RegisterData } from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    role: "STUDENT", // ✅ FIXED
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      role: e.target.value as RegisterData["role"],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      await authApi.register(formData);

      router.push(
        `/auth/verify-otp?email=${encodeURIComponent(formData.email)}`
      );
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };

      setError(
        error.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join our learning platform"
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
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-black"
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
            minLength={8}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-black"
            placeholder="Minimum 8 characters"
          />
        </div>

        {/* ROLE */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Role
          </label>

          <div className="flex gap-4">
            {(["STUDENT", "INSTRUCTOR", "ADMIN"] as const).map((role) => (
              <label
                key={role}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={formData.role === role}
                  onChange={handleRoleChange}
                  className="w-4 h-4 text-blue-500"
                />

                <span className="text-sm text-slate-600">
                  {role.replace("_", " ").toLowerCase()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        {/* LOGIN LINK */}
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}