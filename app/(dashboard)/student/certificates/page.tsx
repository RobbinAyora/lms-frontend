"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard";
import { Button } from "@/components/ui/Button";

const studentNavItems = [
  {
    label: "Dashboard",
    href: "/student",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    label: "Certificates",
    href: "/student/certificates",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

const mockCertificates = [
  {
    id: "1",
    courseName: "Complete Web Development Bootcamp",
    issueDate: "2024-03-15",
    status: "issued",
    credentialId: "WEB-2024-001",
  },
  {
    id: "2",
    courseName: "Advanced React Patterns",
    issueDate: "2024-02-28",
    status: "issued",
    credentialId: "REACT-2024-015",
  },
];

export default function StudentCertificatesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DashboardLayout
      navItems={studentNavItems}
      title="Certificates"
      onSearch={setSearchQuery}
    >
      <div className="space-y-6">

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-600 text-white p-6 rounded-xl">
            <p>Total Certificates</p>
            <h2 className="text-3xl font-bold">{mockCertificates.length}</h2>
          </div>
        </div>

        {/* LIST */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="font-semibold text-gray-900">Your Certificates</h2>
          </div>

          <div className="divide-y">
            {mockCertificates.map((cert) => (
              <div key={cert.id} className="p-6 flex justify-between items-center">

                <div>
                  <h3 className="font-semibold">{cert.courseName}</h3>
                  <p className="text-sm text-gray-500">
                    Issued: {cert.issueDate}
                  </p>
                  <p className="text-xs text-gray-400">
                    ID: {cert.credentialId}
                  </p>
                </div>

                <div className="flex gap-3 items-center">

                  <Button variant="outline" size="sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download
                  </Button>

                  <Button size="sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    Verify
                  </Button>

                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}