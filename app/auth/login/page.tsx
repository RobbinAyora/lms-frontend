"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi, LoginData } from "@/lib/api";
import AuthLayout from "@/components/AuthLayout";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login(formData);

      // ✅ MATCHING YOUR BACKEND RESPONSE
      const { access_token, role, dashboardUrl, user } = response.data;

      // Save auth data
      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role);
      
      // Store user info if available, otherwise use login email
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.setItem("user", JSON.stringify({ 
          id: "", 
          email: formData.email, 
          role: role === "ADMIN" ? "Admin" : role === "INSTRUCTOR" ? "Instructor" : "Student" 
        }));
      }

      // Also set cookies for consistency
      document.cookie = `token=${access_token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      const userData = user || { id: "", email: formData.email, role: role === "ADMIN" ? "Admin" : role === "INSTRUCTOR" ? "Instructor" : "Student" };
      document.cookie = `user=${JSON.stringify(userData)}; path=/; max-age=${7 * 24 * 60 * 60}`;

      // Redirect logic based on role - use window.location for full page reload
      if (role === "ADMIN") {
        window.location.href = "/admin";
      } else if (role === "INSTRUCTOR") {
        window.location.href = "/instructor";
      } else {
        window.location.href = "/student";
      }

      // OPTIONAL (alternative: use backend redirect)
      // window.location.href = dashboardUrl;

    } catch (err: unknown) {
      console.log("Login error:", err);

      const error = err as {
        response?: { data?: { message?: string } };
      };

      const message =
        error.response?.data?.message || "Login failed";

      // If OTP verification required
      if (message.toLowerCase().includes("verify")) {
        router.push(
          `/auth/verify-otp?email=${encodeURIComponent(formData.email)}`
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

        {/* Email */}
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

        {/* Password */}
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
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-black"
            placeholder="Enter your password"
          />
        </div>

        {/* Forgot password */}
        <div className="text-right">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Register link */}
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