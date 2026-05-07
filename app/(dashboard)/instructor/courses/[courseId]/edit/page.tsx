"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import { StatCard, DashboardLayout } from "@/components/dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { useToast } from "@/context/ToastContext";
import { instructorApi } from "@/lib/api/instructor";
import { api } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
  {
    label: "Profile",
    href: "/instructor/profile",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    label: "Support",
    href: "/instructor/support",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
];

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: string;
  order: number;
  isCompleted: boolean;
  resources?: { name: string; url: string }[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  thumbnail?: string;
}

function CourseDetailSkeleton() {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton variant="text" height={32} width="40%" />
          <Skeleton variant="text" height={20} width="60%" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton variant="text" height={20} width="80%" />
            <Skeleton variant="text" height={20} width="60%" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LessonItemSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="aspect-video bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" height={20} width="60%" />
        <Skeleton variant="text" height={16} width="40%" />
      </div>
    </div>
  );
}

export default function CourseEditPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const { showToast } = useToast();

  const { 
    data: course, 
    isLoading: isCourseLoading, 
    error: courseError 
  } = useQuery({
    queryKey: ["course-details", courseId],
    queryFn: () => instructorApi.getCourseDetails(courseId),
    enabled: !!courseId,
  });

  const {
    data: lessonsData,
    isLoading: isLessonsLoading,
    error: lessonsError,
  } = useQuery({
    queryKey: ["course-lessons", courseId],
    queryFn: async () => {
      const response = await api.get<{ data: { courseId: string; lessons: Lesson[] } }>(`/api/courses/${courseId}/lessons`);
      return response.data;
    },
    enabled: !!courseId,
  });

  const lessons = lessonsData?.lessons;

  if (courseError || lessonsError) {
    return (
      <DashboardLayout navItems={instructorNavItems} title="Edit Course">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load course</h3>
          <p className="text-gray-500 mb-6">Please try again or check your connection.</p>
          <button
            onClick={() => router.refresh()}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (isCourseLoading || isLessonsLoading) {
    return (
      <DashboardLayout navItems={instructorNavItems} title="Edit Course">
        <div className="space-y-6">
          <CourseDetailSkeleton />
          
          <Card>
            <CardContent className="p-6">
              <div className="mb-6">
                <Skeleton variant="text" height={24} width="30%" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <LessonItemSkeleton key={i} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={instructorNavItems} title="Edit Course">
      <div className="space-y-6">
        {/* Course Details Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl">Course Details</CardTitle>
              <CardDescription>View and manage course information</CardDescription>
            </CardHeader>
            
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Course Title</label>
                <p className="text-lg font-semibold text-gray-900">{course?.title || "-"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                <p className="text-gray-700 leading-relaxed">{course?.description || "-"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                  <p className="text-gray-900">{course?.category || "-"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Level</label>
                  <p className="text-gray-900">{course?.level || "-"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Price</label>
                  <p className="text-lg font-semibold text-blue-600">
                    ${typeof course?.price === "number" ? course.price.toFixed(2) : "0.00"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Total Lessons</label>
                  <p className="text-gray-900">{lessons?.length || 0} lessons</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons List */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <CardTitle className="text-lg">Course Lessons</CardTitle>
              <CardDescription className="mt-1">
                {lessons?.length || 0} lesson{lessons?.length !== 1 ? "s" : ""} in this course
              </CardDescription>
            </div>

            {(!lessons || lessons.length === 0) ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">No lessons found</p>
                <p className="text-gray-400 text-sm mt-1">This course doesn&apos;t have any lessons yet</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lessons?.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {lesson.videoUrl ? (
                      <div className="aspect-video relative bg-gray-900">
                        <video
                          src={lesson.videoUrl}
                          controls
                          className="w-full rounded-xl"
                          poster={course?.thumbnail}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-medium">No video uploaded</span>
                        </div>
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                        {lesson.title}
                      </h4>
                      <p className="text-sm text-gray-500 mb-2">{lesson.description || "No description"}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Duration: {lesson.duration}</span>
                        <span className="capitalize">{lesson.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
