"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard";
import { useCourseDetails, useCourseLessons, useMarkLessonComplete } from "@/lib/hooks/useCourses";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui";
import type { Module, Course } from "@/lib/api/courses";

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

function CoursePlayerContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") || "";
  const { showToast } = useToast();

  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
    error: courseErrorMsg,
  } = useCourseDetails(courseId);

  const {
    data: modules = [],
    isLoading: lessonsLoading,
    isError: lessonsError,
  } = useCourseLessons(courseId);

  const markCompleteMutation = useMarkLessonComplete();
  const markingComplete = markCompleteMutation.isPending;

  const isLoading = courseLoading || lessonsLoading;
  const error = courseError ? (courseErrorMsg as Error)?.message || "Failed to load course" : null;

  // Auto-expand modules when lessons load
  useEffect(() => {
    if (modules.length > 0) {
      setExpandedModules(new Set(modules.map((m) => m.id)));
    }
  }, [modules]);

  // Auto-select first incomplete lesson
  useEffect(() => {
    if (modules.length > 0 && activeLesson) return;
    const firstIncomplete = modules.flatMap((m) => m.lessons).find((l) => !l.isCompleted);
    if (firstIncomplete) {
      setActiveLesson(firstIncomplete.id);
    } else if (modules[0]?.lessons[0]) {
      setActiveLesson(modules[0].lessons[0].id);
    }
  }, [modules, activeLesson]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const currentLesson = modules.flatMap((m) => m.lessons).find((l) => l.id === activeLesson);
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.isCompleted).length,
    0
  );

  const handleMarkComplete = async () => {
    if (!courseId || !activeLesson) return;
    try {
      await markCompleteMutation.mutateAsync({ courseId, lessonId: activeLesson });
      showToast("Lesson marked as complete!", "success");
      // React Query automatically updates cached data
      // Auto-advance to next lesson
      const allLessons = modules.flatMap((m) => m.lessons);
      const currentIndex = allLessons.findIndex((l) => l.id === activeLesson);
      const nextLesson = allLessons[currentIndex + 1];
      if (nextLesson) {
        setActiveLesson(nextLesson.id);
      }
    } catch {
      showToast("Failed to mark lesson complete", "error");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout navItems={studentNavItems}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading course...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (lessonsError || !course) {
    return (
      <DashboardLayout navItems={studentNavItems}>
        <div className="flex flex-col items-center justify-center h-screen">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Course Not Found</h3>
          <p className="text-gray-500 mb-4">
            {courseErrorMsg?.message || error || "You may need to enroll in this course first."}
          </p>
          <Link href="/student/browse">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={studentNavItems}>
      <div className="flex h-[calc(100vh-80px)]">
        <div className={`flex-1 flex flex-col ${sidebarOpen ? "lg:mr-80" : ""} transition-all`}>
          {currentLesson ? (
            <>
              <div className="relative bg-black aspect-video">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                    <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h1 className="text-white font-semibold text-lg">{currentLesson.title}</h1>
                  <p className="text-white/70 text-sm">{currentLesson.duration}</p>
                </div>
              </div>

              <div className="flex-1 bg-white p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{currentLesson.title}</h2>
                      <p className="text-gray-500 mt-1">{currentLesson.description}</p>
                    </div>
                    <Button
                      onClick={handleMarkComplete}
                      disabled={currentLesson.isCompleted || markingComplete}
                      isLoading={markingComplete}
                    >
                      {currentLesson.isCompleted ? "Completed" : "Mark Complete"}
                    </Button>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
                    <div className="space-y-2">
                      <a href="#" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-gray-700">Lesson Slides</span>
                      </a>
                      <a href="#" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <span className="text-gray-700">Code Examples</span>
                      </a>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6">
                    <button
                      disabled={!currentLesson.order || currentLesson.order === 1}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    <button
                      onClick={() => {
                        const allLessons = modules.flatMap((m) => m.lessons);
                        const currentIndex = allLessons.findIndex((l) => l.id === activeLesson);
                        const nextLesson = allLessons[currentIndex + 1];
                        if (nextLesson) {
                          setActiveLesson(nextLesson.id);
                        }
                      }}
                      disabled={!currentLesson.order || currentLesson.order === totalLessons}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next Lesson
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">Select a lesson to start</h3>
                <p className="text-gray-500 mt-1">Choose from the course content on the right</p>
              </div>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <div className="fixed right-0 top-[80px] w-80 h-[calc(100vh-80px)] bg-white border-l border-gray-200 overflow-y-auto lg:relative lg:top-0 lg:w-80 lg:h-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{course?.title}</h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-1 text-gray-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{completedLessons}/{totalLessons} completed</span>
                <span className="text-blue-600 font-medium">{Math.round((completedLessons / totalLessons) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(completedLessons / totalLessons) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-2">
              {modules.map((module) => (
                <div key={module.id} className="mb-2">
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <span className="font-medium text-gray-900 text-sm">{module.title}</span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${expandedModules.has(module.id) ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expandedModules.has(module.id) && (
                    <div className="ml-2 space-y-1">
                      {module.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                            activeLesson === lesson.id
                              ? "bg-blue-50 text-blue-600"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            lesson.isCompleted ? "bg-green-500" : "border-2 border-gray-300"
                          }`}>
                            {lesson.isCompleted && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{lesson.title}</p>
                            <p className="text-xs text-gray-400">{lesson.duration}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed right-4 bottom-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 lg:hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function CoursePlayerPage() {
  return (
    <Suspense fallback={
      <DashboardLayout navItems={studentNavItems}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    }>
      <CoursePlayerContent />
    </Suspense>
  );
}