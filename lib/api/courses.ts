import { api } from "./client";

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  price?: number;
  totalLessons: number;
  completedLessons?: number;
  progress?: number;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  enrolledAt?: string;
  lastAccessedAt?: string;
  nextLesson?: string;
  isEnrolled?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: string;
  order: number;
  isCompleted: boolean;
  resources?: { name: string; url: string }[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
}

export interface CourseResponse {
  data: Course | Course[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface LessonResponse {
  data: Module[];
}

export const courseApi = {
  getAllCourses: async (): Promise<Course[]> => {
    const response = await api.get<CourseResponse>("/api/courses", { skipAuth: true });
    const data = response.data;
    return Array.isArray(data) ? data : data ? [data] : [];
  },

  getEnrolledCourses: async (): Promise<Course[]> => {
    const response = await api.get<CourseResponse>("/api/courses/enrolled");
    const data = response.data;
    return Array.isArray(data) ? data : data ? [data] : [];
  },

  getMyCourses: async (): Promise<Course[]> => {
    const response = await api.get<CourseResponse>("/api/me/courses");
    const data = response.data;
    return Array.isArray(data) ? data : data ? [data] : [];
  },

  enrollInCourse: async (courseId: string): Promise<void> => {
    await api.post(`/api/courses/${courseId}/enroll`);
  },

  getCourseDetails: async (courseId: string): Promise<Course> => {
    const response = await api.get<CourseResponse>(`/api/courses/${courseId}`);
    const data = response.data;
    if (Array.isArray(data)) {
      return data[0] ?? {
        id: courseId,
        title: "",
        description: "",
        instructor: { id: "", name: "" },
        category: "",
        totalLessons: 0,
        duration: "",
        level: "Beginner" as const,
      };
    }
    return data ?? {
      id: courseId,
      title: "",
      description: "",
      instructor: { id: "", name: "" },
      category: "",
      totalLessons: 0,
      duration: "",
      level: "Beginner" as const,
    };
  },

  getCourseLessons: async (courseId: string): Promise<Module[]> => {
    const response = await api.get<LessonResponse>(`/api/courses/${courseId}/lessons`);
    return response.data ?? [];
  },

  markLessonComplete: async (courseId: string, lessonId: string): Promise<void> => {
    await api.patch(`/api/courses/${courseId}/lessons/${lessonId}/complete`);
  },
};