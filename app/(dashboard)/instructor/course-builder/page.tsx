"use client";

import { useState } from "react";
import Link from "next/link";
import { StatCard, DashboardLayout } from "@/components/dashboard";
import { Card, CardContent } from "@/components/ui";
import { useToast } from "@/context/ToastContext";
import { instructorApi } from "@/lib/api/instructor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VideoUpload } from "@/components/VideoUpload";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "quiz" | "text";
  videoUrl?: string;
  videoFile?: File;
  _localId?: string;
}

interface LocalModule {
  id: number;
  title: string;
  lessons: Lesson[];
}

interface CourseData {
  title: string;
  description: string;
  category: string;
  level: string;
  language: string;
  price: number;
  thumbnail: string;
  objectives: string;
  targetAudience: string;
  prerequisites: string;
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

export default function CourseBuilderPage() {
  const [activeTab, setActiveTab] = useState<"details" | "curriculum" | "settings">("details");
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([1]));
  const [courseData, setCourseData] = useState<CourseData>({
    title: "",
    description: "",
    category: "Programming",
    level: "Intermediate",
    language: "English",
    price: 0,
    thumbnail: "",
    objectives: "",
    targetAudience: "",
    prerequisites: "",
  });
  const [modules, setModules] = useState<LocalModule[]>([]);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const toggleModule = (id: number) => {
    const newSet = new Set(expandedModules);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedModules(newSet);
  };

  const handleFileSelect = (lessonId: string, file: File | null) => {
    setModules((prev) =>
      prev.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) =>
          lesson._localId === lessonId
            ? { ...lesson, videoFile: file || undefined }
            : lesson
        ),
      }))
    );
  };

  const addLesson = (moduleId: number) => {
    const newLesson: Lesson & { _localId: string } = {
      id: "temp-" + Date.now(),
      title: "New Lesson",
      duration: "0:00",
      type: "video",
      _localId: Date.now().toString(),
    };
    setModules((prev) =>
      prev.map((module) =>
        module.id === moduleId
          ? { ...module, lessons: [...module.lessons, newLesson] }
          : module
      )
    );
  };

  const removeLesson = (moduleId: number, lessonLocalId: string) => {
    setModules((prev) =>
      prev.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.filter((l) => (l._localId || l.id) !== lessonLocalId),
            }
          : module
      )
    );
  };

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalDuration = modules.reduce((acc, m) => {
    return acc + m.lessons.reduce((lessonAcc, l) => {
      const [min, sec] = l.duration.split(":").map(Number);
      return lessonAcc + min + sec / 60;
    }, 0);
  }, 0);

  const hours = Math.floor(totalDuration / 60);
  const minutes = Math.round(totalDuration % 60);
  const durationString = `${hours}h ${minutes}m`;

  const isFormValid = courseData.title.trim().length > 0;
  const allVideoLessons = modules.flatMap((m) => m.lessons).filter((l) => l.type === "video");
  const allVideosUploaded = allVideoLessons.every((l) => l.videoFile);
  const canPublish = isFormValid && allVideosUploaded;

      const createCourseMutation = useMutation({
        mutationFn: async (_courseData: CourseData) => {
          console.log("🔥 MUTATION FIRED");
          console.log("📦 Modules state:", JSON.stringify(modules.map(m => ({
            id: m.id,
            title: m.title,
            lessons: m.lessons.map(l => ({
              title: l.title,
              type: l.type,
              hasFile: !!l.videoFile,
              localId: l._localId
            }))
          }))));
      const payload = {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        price: courseData.price,
        thumbnail: courseData.thumbnail || "",
        totalLessons,
        duration: durationString,
        isPublished: true,
      };

      if (JSON.stringify(payload).length > 100 * 1024) {
        throw new Error("Course payload is too large. Please reduce thumbnail size.");
      }

      const courseResponse = await instructorApi.createCourse(payload);
      const courseId = courseResponse.id;

      const lessonPromises = modules.map(async (module, moduleIndex) => {
              return Promise.all(
                module.lessons.map(async (lesson, lessonIndex) => {
                  const order = moduleIndex * 100 + lessonIndex;
                  console.log("Lesson videoFile:", lesson.videoFile, "type:", lesson.type);
                  if (lesson.type === "video" && lesson.videoFile) {
  const formData = new FormData();
  formData.append("video", lesson.videoFile);
  formData.append("title", lesson.title);
  formData.append("description", lesson.title);
  formData.append("courseId", courseId);
  await instructorApi.uploadLessonWithFile(formData);
}
          })
        );
      });

      await Promise.all(lessonPromises);
      return courseResponse;
    },
    onSuccess: () => {
      showToast("Course created successfully with all lessons!", "success");
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
      setCourseData({
        title: "",
        description: "",
        category: "Programming",
        level: "Intermediate",
        language: "English",
        price: 0,
        thumbnail: "",
        objectives: "",
        targetAudience: "",
        prerequisites: "",
      });
      setModules([]);
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to create course", "error");
    },
  });

  const handlePublish = () => {
    if (!courseData.title.trim()) {
      showToast("Course title is required", "error");
      return;
    }
    const missingVideos = modules
      .flatMap((m) => m.lessons)
      .filter((l) => l.type === "video" && !l.videoFile);
    if (missingVideos.length > 0) {
      showToast(`Please select video files for all lessons (${missingVideos.length} missing)`, "error");
      return;
    }
    createCourseMutation.mutate(courseData);
  };

  return (
    <DashboardLayout navItems={instructorNavItems} title="Course Builder">
      <div className="space-y-8">
        {/* HERO SECTION */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 text-white shadow-lg">
          <div className="relative px-6 py-12 sm:px-10 sm:py-14">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Course Builder</h1>
                <p className="text-white/80 text-sm sm:text-base max-w-xl leading-relaxed">
                  Build and organize your course content. Add modules, lessons, and configure settings.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/instructor/courses"
                  className="inline-flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-white hover:bg-white/20 hover:scale-[1.02] transition-all duration-200"
                >
                  Save Draft
                </Link>
                <button
                  onClick={handlePublish}
                  disabled={createCourseMutation.isPending || !canPublish}
                  className={`inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-white shadow-md hover:shadow-lg ${canPublish ? "text-emerald-700 hover:scale-[1.02]" : "text-gray-400"}`}
                >
                  {createCourseMutation.isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-700" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Publishing...
                    </>
                  ) : (
                    "Publish Course"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard title="Total Modules" value={modules.length} icon={<div className="w-5 h-5" />} />
          <StatCard title="Total Lessons" value={totalLessons} icon={<div className="w-5 h-5" />} />
          <StatCard title="Duration" value={`${Math.round(totalDuration)} min`} icon={<div className="w-5 h-5" />} />
          <StatCard title="Price" value={`$${courseData.price}`} icon={<div className="w-5 h-5" />} />
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-gray-100/80 backdrop-blur-sm rounded-2xl">
          {(["details", "curriculum", "settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-0 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        {activeTab === "details" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="space-y-6 xl:col-span-2">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-900 mb-5 text-lg">Course Information</h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                      <input
                        type="text"
                        value={courseData.title}
                        onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                        className="w-full rounded-xl border border-gray-100 px-4 py-3 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
                        placeholder="Enter course title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        rows={4}
                        value={courseData.description}
                        onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                        className="w-full rounded-xl border border-gray-100 px-4 py-3 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm resize-none"
                        placeholder="Describe what students will learn"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          value={courseData.category}
                          onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                          className="w-full rounded-xl border border-gray-100 px-4 py-3 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm bg-white"
                        >
                          <option>Programming</option>
                          <option>Design</option>
                          <option>Business</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                        <select
                          value={courseData.level}
                          onChange={(e) => setCourseData({ ...courseData, level: e.target.value })}
                          className="w-full rounded-xl border border-gray-100 px-4 py-3 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm bg-white"
                        >
                          <option>Beginner</option>
                          <option>Intermediate</option>
                          <option>Advanced</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-900 mb-5 text-lg">Course Objectives</h3>
                  <textarea
                    rows={3}
                    value={courseData.objectives}
                    onChange={(e) => setCourseData({ ...courseData, objectives: e.target.value })}
                    className="w-full rounded-xl border border-gray-100 px-4 py-3 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm resize-none"
                    placeholder="What will students achieve after completing this course?"
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-900 mb-5 text-lg">Course Thumbnail</h3>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-4 relative group">
                    {courseData.thumbnail ? (
                      <img
                        src={courseData.thumbnail}
                        alt="Course thumbnail"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                        <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm drop-shadow-sm">No image uploaded</span>
                      </div>
                    )}
                  </div>
                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="Image URL (recommended)"
                      value={courseData.thumbnail}
                      onChange={(e) => setCourseData({ ...courseData, thumbnail: e.target.value })}
                      className="w-full rounded-xl border border-gray-100 px-4 py-3 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
                    />
                    <svg className="absolute right-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-400 text-center">Paste an image URL above (base64 images will be rejected)</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-900 mb-5 text-lg">Target Audience</h3>
                  <textarea
                    rows={3}
                    value={courseData.targetAudience}
                    onChange={(e) => setCourseData({ ...courseData, targetAudience: e.target.value })}
                    className="w-full rounded-xl border border-gray-100 px-4 py-3 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm resize-none"
                    placeholder="Who is this course for?"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "curriculum" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 text-lg">Curriculum</h3>
              <button
                onClick={() => {
                  const newModule: LocalModule = { id: Date.now(), title: "New Module", lessons: [] };
                  setModules([...modules, newModule]);
                }}
                className="group flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-200 hover:text-gray-900 transition-all duration-200 shadow-sm active:scale-[0.98]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Module
              </button>
            </div>

            {modules.length === 0 ? (
              <Card>
                <CardContent className="py-16">
                  <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">No modules yet</p>
                      <p className="text-gray-400 text-sm mt-1">Add your first module to start building your curriculum</p>
                    </div>
                    <button
                      onClick={() => {
                        const newModule: LocalModule = { id: Date.now(), title: "New Module", lessons: [] };
                        setModules([...modules, newModule]);
                      }}
                      className="group flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 hover:scale-[1.02] transition-all duration-200 shadow-md active:scale-[0.98] w-full"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Your First Module
                    </button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {modules.map((module) => (
                  <Card key={module.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gray-100 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-gray-200 transition-colors">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <input
                              type="text"
                              value={module.title}
                              onChange={(e) => {
                                setModules((prev) =>
                                  prev.map((m) => (m.id === module.id ? { ...m, title: e.target.value } : m))
                                );
                              }}
                              className="font-medium text-gray-900 text-base bg-transparent border-none outline-none focus:ring-0 px-0 py-0 w-full truncate"
                              placeholder="Module title"
                            />
                            <p className="text-sm text-gray-500">
                              {module.lessons.length} lesson{module.lessons.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedModules.has(module.id) ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setModules((prev) => prev.filter((m) => m.id !== module.id));
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </div>
                        </div>
                      </button>

                      {expandedModules.has(module.id) && (
                        <div className="border-t border-gray-100 bg-gray-50/30">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson._localId || lesson.id}
                              className="p-4 pl-16 hover:bg-white hover:shadow-sm transition-all duration-200 border-b border-gray-100 last:border-0 group"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                  <div className="flex-shrink-0">
                                    <select
                                      value={lesson.type}
                                      onChange={(e) => {
                                        setModules((prev) =>
                                          prev.map((m) => ({
                                            ...m,
                                            lessons: m.lessons.map((l) =>
                                              (l._localId || l.id) === (lesson._localId || lesson.id)
                                                ? { ...l, type: e.target.value as "video" | "quiz" | "text" }
                                                : l
                                            ),
                                          }))
                                        );
                                      }}
                                      className="text-xs font-medium text-gray-600 bg-gray-100 border-0 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-100 outline-none"
                                    >
                                      <option value="video">Video</option>
                                      <option value="quiz">Quiz</option>
                                      <option value="text">Text</option>
                                    </select>
                                  </div>
                                  <input
                                    type="text"
                                    value={lesson.title}
                                    onChange={(e) => {
                                      setModules((prev) =>
                                        prev.map((m) => ({
                                          ...m,
                                          lessons: m.lessons.map((l) =>
                                            (l._localId || l.id) === (lesson._localId || lesson.id)
                                              ? { ...l, title: e.target.value }
                                              : l
                                          ),
                                        }))
                                      );
                                    }}
                                    className="text-sm text-gray-900 font-medium bg-transparent border-none outline-none focus:ring-0 px-0 py-0 flex-1"
                                    placeholder="Lesson title"
                                  />
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <input
                                    type="text"
                                    value={lesson.duration}
                                    onChange={(e) => {
                                      setModules((prev) =>
                                        prev.map((m) => ({
                                          ...m,
                                          lessons: m.lessons.map((l) =>
                                            (l._localId || l.id) === (lesson._localId || lesson.id)
                                              ? { ...l, duration: e.target.value }
                                              : l
                                          ),
                                        }))
                                      );
                                    }}
                                    className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 w-16 text-center focus:ring-2 focus:ring-blue-100 outline-none"
                                    placeholder="0:00"
                                  />
                                  {lesson.type === "video" && (
                                    <div className="w-32 sm:w-64 flex-shrink-0">
                                      <VideoUpload
                                        lessonId={lesson._localId || lesson.id}
                                        selectedFile={lesson.videoFile}
                                        onFileSelect={handleFileSelect}
                                        existingVideoUrl={lesson.videoUrl}
                                        disabled={createCourseMutation.isPending}
                                      />
                                    </div>
                                  )}
                                  {lesson.type !== "video" && (
                                    <div className="w-20 sm:w-32 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                                      <span className="text-xs text-gray-400">
                                        {lesson.type === "quiz" ? "Quiz settings" : "Text content"}
                                      </span>
                                    </div>
                                  )}
                                  <button
                                    onClick={() => removeLesson(module.id, lesson._localId || lesson.id)}
                                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => addLesson(module.id)}
                            className="w-full p-3.5 text-center text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Lesson
                          </button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-8">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">Pricing</h3>
                  <p className="text-sm text-gray-500">Set your course price and enrollment options</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Price ($)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500">$</span>
                      <input
                        type="number"
                        value={courseData.price}
                        onChange={(e) => setCourseData({ ...courseData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-gray-100 pl-8 pr-4 py-3 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">Access & Language</h3>
                  <p className="text-sm text-gray-500">Configure language and prerequisites</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={courseData.language}
                      onChange={(e) => setCourseData({ ...courseData, language: e.target.value })}
                      className="w-full rounded-xl border border-gray-100 px-4 py-3 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm bg-white"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Japanese</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">Advanced</h3>
                  <p className="text-sm text-gray-500">Configure advanced course settings</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prerequisites</label>
                  <textarea
                    rows={3}
                    value={courseData.prerequisites}
                    onChange={(e) => setCourseData({ ...courseData, prerequisites: e.target.value })}
                    className="w-full rounded-xl border border-gray-100 px-4 py-3 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm resize-none"
                    placeholder="What should students know before taking this course?"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}