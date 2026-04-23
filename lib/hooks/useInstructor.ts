import { useQuery } from "@tanstack/react-query";
import { instructorApi, type InstructorCourse, type Submission } from "@/lib/api/instructor";

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
  });
}

export function useRecentSubmissions() {
  return useQuery({
    queryKey: ["recent-submissions"],
    queryFn: instructorApi.getRecentSubmissions,
  });
}
