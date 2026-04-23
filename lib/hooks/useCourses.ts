import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseApi, Course, Module } from "@/lib/api/courses";

export function useEnrolledCourses() {
  return useQuery({
    queryKey: ["enrolled-courses"],
    queryFn: courseApi.getEnrolledCourses,
  });
}

export function useAllCourses() {
  return useQuery({
    queryKey: ["all-courses"],
    queryFn: courseApi.getAllCourses,
  });
}

export function useCourseDetails(courseId: string) {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: () => courseApi.getCourseDetails(courseId),
    enabled: !!courseId,
  });
}

export function useCourseLessons(courseId: string) {
  return useQuery({
    queryKey: ["course-lessons", courseId],
    queryFn: () => courseApi.getCourseLessons(courseId),
    enabled: !!courseId,
  });
}

export function useEnrollInCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseApi.enrollInCourse,
    onSuccess: () => {
      // Invalidate both enrolled and all courses to refresh UI
      queryClient.invalidateQueries({ queryKey: ["enrolled-courses"] });
      queryClient.invalidateQueries({ queryKey: ["all-courses"] });
    },
  });
}

export function useMarkLessonComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: string; lessonId: string }) =>
      courseApi.markLessonComplete(courseId, lessonId),
    onSuccess: (_, variables) => {
      // Invalidate course details and lessons to refresh progress
      queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ["course-lessons", variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ["enrolled-courses"] });
    },
  });
}

export function useMyCourses() {
  return useQuery({
    queryKey: ["my-courses"],
    queryFn: courseApi.getMyCourses,
  });
}
