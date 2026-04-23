"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute allowedRoles={["Admin"]}>{children}</ProtectedRoute>;
}