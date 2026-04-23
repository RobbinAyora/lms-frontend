import { api } from "./client";

export interface InstructorCourse {
  id: string;
  title: string;
  description: string;
  students: number;
  lessons: number;
  rating?: number;
  status: "published" | "draft";
  createdAt?: string;
}

export interface InstructorCourseResponse {
  data: InstructorCourse[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
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

export const instructorApi = {
  getMyCourses: async (): Promise<InstructorCourse[]> => {
    const response = await api.get<InstructorCourseResponse>("/api/instructor/courses");
    return response.data ?? [];
  },

  getPendingSubmissions: async (): Promise<Submission[]> => {
    const response = await api.get<SubmissionsResponse>("/api/instructor/submissions");
    return response.data ?? [];
  },

  getRecentSubmissions: async (): Promise<Submission[]> => {
    const response = await api.get<SubmissionsResponse>("/api/instructor/submissions/recent");
    return response.data ?? [];
  },
};
