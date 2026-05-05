import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instructorApi, type InstructorCourse, type Submission, type Assignment } from "@/lib/api/instructor";

export function useInstructorCourses() {
  return useQuery({
    queryKey: ["instructor-courses"],
    queryFn: instructorApi.getMyCourses,
  });
}

export function usePendingSubmissions() {
  return useQuery({
    queryKey: ["pending-submissions"],
    queryFn: instructorApi.getPendingSubmissions,
    retry: false,
    staleTime: 30000,
    onError: () => {
      console.warn("⚠️ Pending submissions endpoint not available - using fallback empty data");
    },
  });
}

export function useRecentSubmissions() {
  return useQuery({
    queryKey: ["recent-submissions"],
    queryFn: instructorApi.getRecentSubmissions,
    retry: false,
    staleTime: 30000,
    onError: () => {
      console.warn("⚠️ Recent submissions endpoint not available - using fallback empty data");
    },
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: instructorApi.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
    },
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: Omit<Assignment, "id" | "courseId" | "courseName"> }) =>
      instructorApi.createAssignment(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}
