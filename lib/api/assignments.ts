import { api } from "./client";

export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded" | "overdue";
  grade?: number;
  maxGrade: number;
  submittedAt?: string;
  attachments?: { name: string; url: string }[];
  instructions?: string;
  feedback?: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  content: string;
  attachments?: File[];
  submittedAt: string;
  grade?: number;
  feedback?: string;
}

export interface AssignmentsResponse {
  data: Assignment[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export const assignmentApi = {
  getAssignments: async (): Promise<Assignment[]> => {
    const response = await api.get<AssignmentsResponse>("/api/assignments");
    const data = response.data;
    return Array.isArray(data) ? data : data ? [data] : [];
  },

  getAssignment: async (id: string): Promise<Assignment> => {
    const response = await api.get<{ data: Assignment }>(`/api/assignments/${id}`);
    return response.data ?? {
      id,
      title: "",
      description: "",
      courseId: "",
      courseName: "",
      dueDate: "",
      status: "pending",
      maxGrade: 100,
    };
  },

  submitAssignment: async (id: string, content: string, attachments?: File[]): Promise<void> => {
    const formData = new FormData();
    formData.append("content", content);
    if (attachments) {
      attachments.forEach((file) => formData.append("attachments", file));
    }
    await api.post(`/api/assignments/${id}/submit`, formData, { skipAuth: false });
  },
};