import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          Learning Management System
        </h1>
        <p className="text-slate-500 mb-8 max-w-md">
          Manage your courses, track progress, and achieve your learning goals.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}