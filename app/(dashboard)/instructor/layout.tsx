"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function InstructorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute allowedRoles={["Instructor", "Admin"]}>{children}</ProtectedRoute>;
}