import { api } from "./client";
import type { Lesson } from "./courses";

export interface InstructorCourse {
  id: string;
  title: string;
  description: string;
  students: number;
  lessons: number;
  rating?: number;
  status: "published" | "draft";
  createdAt?: string;
  // Additional fields for UI
  thumbnail?: string;
  price?: number;
  duration?: string;
  category?: string;
  revenue?: number;
  image?: string;
}

export interface InstructorCourseResponse {
  data: InstructorCourse[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface CourseDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  totalLessons: number;
  duration: string;
  price: number;
  thumbnail?: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Submission {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  assignment: {
    id: string;
    title: string;
  };
  course: {
    id: string;
    name: string;
  };
  submittedAt: string;
  status: "pending" | "graded";
  grade?: number;
  feedback?: string;
}

export interface SubmissionsResponse {
  data: Submission[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  status: "draft" | "published";
  maxGrade: number;
  instructions?: string;
}

export interface AssignmentResponse {
  data: Assignment;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface AssignmentsResponse {
  data: Assignment[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

interface VideoUploadResponse {
  videoUrl: string;
  publicId: string;
}

export const instructorApi = {
  getMyCourses: async (): Promise<InstructorCourse[]> => {
    const response = await api.get<InstructorCourseResponse>("/api/courses");
    return response.data ?? [];
  },

  getCourseDetails: async (courseId: string): Promise<CourseDetails> => {
    const response = await api.get<{ data: CourseDetails }>(`/api/courses/${courseId}`);
    return response.data;
  },

  createCourse: async (courseData: Omit<CourseDetails, "id" | "createdAt" | "updatedAt">): Promise<CourseDetails> => {
    const response = await api.post<{ data: CourseDetails }>("/api/courses", courseData);
    return response.data;
  },

  updateCourse: async (courseId: string, courseData: Partial<CourseDetails>): Promise<CourseDetails> => {
    const response = await api.patch<{ data: CourseDetails }>(`/api/courses/${courseId}`, courseData);
    return response.data;
  },

  deleteCourse: async (courseId: string): Promise<void> => {
    await api.delete(`/api/courses/${courseId}`);
  },

  getCourseAssignments: async (courseId: string): Promise<Assignment[]> => {
    const response = await api.get<AssignmentsResponse>(`/api/assignments/${courseId}`);
    return response.data ?? [];
  },

  getAssignment: async (courseId: string, assignmentId: string): Promise<Assignment> => {
    const response = await api.get<{ data: Assignment }>(`/api/assignments/${assignmentId}?courseId=${courseId}`);
    return response.data;
  },

  createAssignment: async (courseId: string, assignmentData: Omit<Assignment, "id" | "courseId" | "courseName">): Promise<Assignment> => {
    const response = await api.post<{ data: Assignment }>(`/api/assignments`, { ...assignmentData, courseId });
    return response.data;
  },

  updateAssignment: async (courseId: string, assignmentId: string, assignmentData: Partial<Assignment>): Promise<Assignment> => {
    const response = await api.patch<{ data: Assignment }>(`/api/assignments/${assignmentId}`, assignmentData);
    return response.data;
  },

  deleteAssignment: async (courseId: string, assignmentId: string): Promise<void> => {
    await api.delete(`/api/assignments/${assignmentId}`);
  },

  // DEPRECATED: Use uploadLesson (FormData) instead
  // uploadVideo: async (file: File): Promise<VideoUploadResponse> => {
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   const response = await api.post<VideoUploadResponse>("/api/upload/video", formData);
  //   return response;
  // },

  // Creates a lesson without video file (JSON payload)
  createLesson: async (lessonData: {
    title: string;
    duration: string;
    type: "video" | "quiz" | "text";
    videoUrl?: string;
    courseId: string;
    order: number;
  }): Promise<Lesson> => {
    const response = await api.post<{ data: Lesson }>("/api/lessons", lessonData);
    return response.data;
  },

  // Upload lesson with video file via FormData to /api/lessons
  uploadLessonWithFile: async (formData: FormData): Promise<Lesson> => {
    const response = await api.post<{ data: Lesson }>("/api/lessons", formData);
    return response.data;
  },

  getPendingSubmissions: async (): Promise<Submission[]> => {
    const response = await api.get<SubmissionsResponse>("/api/instructor/submissions");
    return response.data ?? [];
  },

  getRecentSubmissions: async (): Promise<Submission[]> => {
    const response = await api.get<SubmissionsResponse>("/api/instructor/submissions");
    const data = response.data ?? [];
    return data
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 5);
  },
};
