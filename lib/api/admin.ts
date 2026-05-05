import { api } from "./client";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Student" | "Instructor" | "Admin";
  status: "active" | "inactive";
  joinedAt: string;
}

export interface AdminCourse {
  id: string;
  name: string;
  instructor: {
    id: string;
    name: string;
  };
  students: number;
  status: "published" | "draft";
  createdAt: string;
}

export interface UsersResponse {
  data: AdminUser[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface CoursesResponse {
  data: AdminCourse[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export const adminApi = {
  getUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get<UsersResponse>("/api/admin/users");
    return response.data ?? [];
  },

  getAllCourses: async (): Promise<AdminCourse[]> => {
    const response = await api.get<CoursesResponse>("/api/admin/courses");
    return response.data ?? [];
  },

  getAllAssignments: async (): Promise<AdminAssignment[]> => {
    const response = await api.get<AssignmentsResponse>("/api/admin/assignments");
    return response.data ?? [];
  },
};

export interface AdminAssignment {
  id: string;
  title: string;
  description: string;
  course: {
    id: string;
    name: string;
  };
  instructor: {
    id: string;
    name: string;
  };
  dueDate: string;
  status: "draft" | "published";
  maxGrade: number;
  submissions: number;
  createdAt: string;
}

export interface AssignmentsResponse {
  data: AdminAssignment[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}
