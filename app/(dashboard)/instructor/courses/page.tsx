"use client";

import { useState } from "react";
import Link from "next/link";
import { StatCard, DashboardLayout } from "@/components/dashboard";
import { Card, CardContent } from "@/components/ui";
import { useToast } from "@/context/ToastContext";
import { instructorApi } from "@/lib/api/instructor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UploadLessonForm } from "@/components/UploadLessonForm";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "published" | "draft" | "archived";
  studentsCount: number;
  lessonsCount: number;
  duration: string;
  price: number;
  rating: number;
  revenue: number;
  updatedAt: string;
  image: string;
}

const instructorNavItems = [
  {
    label: "Dashboard",
    href: "/instructor",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "My Courses",
    href: "/instructor/courses",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    label: "Course Builder",
    href: "/instructor/course-builder",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 1 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    label: "Students",
    href: "/instructor/students",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    label: "Assignments",
    href: "/instructor/assignments",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

function StatusBadge({ status }: { status: Course["status"] }) {
  const styles = {
    published: "bg-green-100 text-green-800",
    draft: "bg-gray-100 text-gray-800",
    archived: "bg-yellow-100 text-yellow-800",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}

function CourseCard({ course, onDelete, onUploadLesson }: { course: Course; onDelete: (id: string) => void; onUploadLesson: (id: string) => void }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative">
        <img src={course.image} alt={course.title} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute top-3 right-3">
          <StatusBadge status={course.status} />
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{course.title}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{course.description}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{course.studentsCount} students</span>
          <span>{course.duration}</span>
          <span>${course.price}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-medium">{course.rating > 0 ? course.rating : "N/A"}</span>
          </div>
          <span className="text-green-600 font-medium">${(course.revenue ?? 0).toLocaleString()}</span>
        </div>

        <div className="flex gap-2 mt-4">
          <Link
            href={`/instructor/courses/${course.id}/edit`}
            className="flex-1 text-center rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(course.id)}
            className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100"
          >
            Delete
          </button>
          <button
            onClick={() => onUploadLesson(course.id)}
            className="flex-1 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-100"
          >
            Upload Lesson
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-200" />
      <div className="p-4">
        <div className="h-5 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded" />
          <div className="h-2 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}

export default function InstructorCoursesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "archived">("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCourseId, setUploadCourseId] = useState<string | null>(null);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: apiCourses = [], isLoading, error } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: async () => {
      const courses = await instructorApi.getMyCourses();
      return courses.map((c): Course => ({
        id: c.id,
        title: c.title,
        description: c.description || "",
        category: c.category || "Programming",
        status: c.status,
        studentsCount: Number(c.students) || 0,
        lessonsCount: Number(c.lessons) || 0,
        duration: c.duration || "0h 0m",
        price: Number(c.price) || 0,
        rating: Number(c.rating) || 0,
        revenue: Number(c.revenue) || 0,
        updatedAt: c.createdAt || new Date().toISOString(),
        image: c.thumbnail || c.image || "",
      }));
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      await instructorApi.deleteCourse(courseId);
    },
    onSuccess: () => {
      showToast("Course deleted successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
      setDeleteTarget(null);
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to delete course", "error");
    },
  });

  const courses = apiCourses;

  const handleDelete = (courseId: string) => {
    setDeleteTarget(courseId);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteCourseMutation.mutate(deleteTarget);
    }
  };

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                         c.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const published = courses.filter((c) => c.status === "published").length;
  const drafts = courses.filter((c) => c.status === "draft").length;
  const totalStudents = courses.reduce((acc, c) => acc + c.studentsCount, 0);
  const totalRevenue = courses.reduce((acc, c) => acc + c.revenue, 0);

  return (
    <DashboardLayout navItems={instructorNavItems} title="My Courses">
      <div className="space-y-6">
        {/* HERO SECTION */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative px-6 py-10 sm:px-10 sm:py-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold">My Courses</h1>
                <p className="text-emerald-100 text-sm sm:text-base max-w-xl">
                  Manage your courses, track revenue, and update content. You have {published} published courses.
                </p>
              </div>
              <Link
                href="/instructor/course-builder"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Course
              </Link>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Courses"
            value={isLoading ? "..." : courses.length}
            change={`+${drafts} drafts`}
            changeType="neutral"
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
          <StatCard
            title="Total Students"
            value={isLoading ? "..." : totalStudents}
            change="+24 this month"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
          <StatCard
            title="Published"
            value={isLoading ? "..." : published}
            change="Active courses"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Total Revenue"
            value={isLoading ? "..." : `$${totalRevenue.toLocaleString()}`}
            change="+$1.2k this month"
            changeType="positive"
            icon={
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* FILTERS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "published" | "draft" | "archived")}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* LIST */}
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-gray-500 mb-4">Failed to load courses. Please try again.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">No courses found. Try adjusting your filters.</p>
            <Link
              href="/instructor/course-builder"
              className="inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Create Course
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onDelete={handleDelete}
                onUploadLesson={(id) => {
                  setUploadCourseId(id);
                  setShowUploadModal(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="rounded-2xl bg-white p-6 shadow-xl w-full max-w-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Delete this course?</h3>
              <p className="text-sm text-gray-500 mb-5">This action cannot be undone. All course data will be permanently removed.</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleteCourseMutation.isPending}
                  className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteCourseMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium disabled:opacity-50"
                >
                  {deleteCourseMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Lesson Modal */}
      {showUploadModal && (
        <Modal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title="Upload Lesson"
          size="md"
        >
          {uploadCourseId && (
            <UploadLessonForm
              key={uploadCourseId}
              courseId={uploadCourseId}
              onSuccess={() => {
                setShowUploadModal(false);
              }}
            />
          )}
        </Modal>
      )}
    </DashboardLayout>
  );
}