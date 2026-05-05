"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";

type Role = "STUDENT" | "ADMIN" | "INSTRUCTOR";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    role: Role;
  }>({
    email: "",
    password: "",
    role: "STUDENT",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      role: e.target.value.toUpperCase() as Role, // 🔥 FORCE UPPERCASE
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/api/auth/register", {
        email: formData.email,
        password: formData.password,
        role: formData.role, // ✅ always uppercase
      });

      router.push(
        `/auth/verify-otp?email=${encodeURIComponent(formData.email)}`
      );
    } catch (err: any) {
      console.log("Register error:", err);

      const message =
        err?.response?.data?.message || "Registration failed";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join our platform">
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
            className="w-full px-4 py-3 border rounded-lg text-black"
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
            className="w-full px-4 py-3 border rounded-lg text-black"
          />
        </div>

        {/* ROLE */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Role
          </label>

          <div className="flex gap-4">
            {(["STUDENT", "ADMIN", "INSTRUCTOR"] as Role[]).map((role) => (
              <label key={role} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={formData.role === role}
                  onChange={handleRoleChange}
                />
                <span className="text-sm capitalize">
                  {role.toLowerCase()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}