"use client";

import Link from "next/link";
import { DashboardLayout, StatCard } from "@/components/dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useEnrolledCourses } from "@/lib/hooks/useCourses";
import { usePendingAssignments } from "@/lib/hooks/useAssignments";
import type { Course } from "@/lib/api/courses";
import type { Assignment } from "@/lib/api/assignments";

const studentNavItems = [
  {
    label: "Dashboard",
    href: "/student",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "My Courses",
    href: "/student/courses",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    label: "Course Player",
    href: "/student/player",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Assignments",
    href: "/student/assignments",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Certificates",
    href: "/student/certificates",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    label: "Payments",
    href: "/student/payments",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: enrolledCourses = [], isLoading: coursesLoading } = useEnrolledCourses();
  const { data: pendingAssignments = [], isLoading: assignmentsLoading } = usePendingAssignments();

  const validCourses = enrolledCourses.filter((c): c is Course => c != null);

  const completedCoursesCount = validCourses.filter(
    (c) => (c.progress || 0) === 100
  ).length;

  const avgProgress =
    validCourses.length > 0
      ? Math.round(
          validCourses.reduce((acc, c) => acc + (c.progress || 0), 0) /
            validCourses.length
        )
      : 0;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Frontend: "from-blue-500 to-blue-600",
      JavaScript: "from-yellow-400 to-yellow-500",
      CSS: "from-pink-500 to-purple-500",
      Backend: "from-green-500 to-green-600",
      React: "from-blue-500 to-blue-600",
      "Node.js": "from-green-500 to-green-600",
    };
    return colors[category] || "from-gray-500 to-gray-600";
  };

  const isLoading = coursesLoading || assignmentsLoading;

  return (
    <DashboardLayout navItems={studentNavItems} title="Student Dashboard">
      <div className="space-y-8">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
          <div className="absolute inset-0 opacity-30" />
          <div className="relative px-6 py-10 sm:px-10 sm:py-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  Welcome back, {user?.email?.split("@")[0] || "Learner"}!
                </h1>
                <p className="text-indigo-100 text-sm sm:text-base max-w-xl">
                  Continue your learning journey. You have {validCourses.length} courses in progress and{" "}
                  {pendingAssignments.length} assignments due soon.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Enrolled Courses"
            value={isLoading ? "..." : validCourses.length}
            change={isLoading ? undefined : "+2 this month"}
            changeType="positive"
            icon={<span />}
          />
          <StatCard
            title="Completed"
            value={isLoading ? "..." : completedCoursesCount}
            change={isLoading ? undefined : "+1 this month"}
            changeType="positive"
            icon={<span />}
          />
          <StatCard
            title="Avg. Progress"
            value={isLoading ? "..." : `${avgProgress}%`}
            change={isLoading ? undefined : "+5% this week"}
            changeType="positive"
            icon={<span />}
          />
          <StatCard
            title="Pending Tasks"
            value={isLoading ? "..." : pendingAssignments.length}
            change="2 due this week"
            changeType="negative"
            icon={<span />}
          />
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* COURSES */}
          <Card>
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading...</div>
              ) : validCourses.length === 0 ? (
                <p>No courses yet</p>
              ) : (
                validCourses.slice(0, 3).map((course) => (
                  <Link
                    key={course.id}
                    href={`/student/player?courseId=${course.id}`}
                  >
                    <div className="p-3 hover:bg-gray-50 rounded-xl">
                      {course.title}
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* ASSIGNMENTS */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading...</div>
              ) : pendingAssignments.length === 0 ? (
                <p>No assignments</p>
              ) : (
                pendingAssignments.slice(0, 3).map((a) => (
                  <div key={a.id} className="p-3">
                    {a.title}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}