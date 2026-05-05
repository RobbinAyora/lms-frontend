import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseApi, Course, Module } from "@/lib/api/courses";

export function useEnrolledCourses() {
  return useQuery({
    queryKey: ["enrolled-courses"],
    queryFn: courseApi.getEnrolledCourses,
  });
}

export function useInstructorCourses() {
  return useQuery({
    queryKey: ["instructor-courses"],
    queryFn: courseApi.getInstructorCourses,
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

export function useCourseProgress(courseId: string) {
  return useQuery({
    queryKey: ["course-progress", courseId],
    queryFn: () => courseApi.getCourseProgress(courseId),
    enabled: !!courseId,
  });
}

export function useEnrollInCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseApi.enrollInCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrolled-courses"] });
      queryClient.invalidateQueries({ queryKey: ["all-courses"] });
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
    },
  });
}

export function useMarkLessonComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: string; lessonId: string }) =>
      courseApi.markLessonComplete(courseId, lessonId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["course", variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ["course-lessons", variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ["enrolled-courses"] });
      queryClient.invalidateQueries({ queryKey: ["course-progress", variables.courseId] });
    },
  });
}

export function useSaveWatchTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, seconds }: { lessonId: string; seconds: number }) =>
      courseApi.saveWatchTime(lessonId, seconds),
    onSuccess: () => {
      // Progress queries will be invalidated when needed
    },
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseApi.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
      queryClient.invalidateQueries({ queryKey: ["all-courses"] });
    },
  });
}

export function useMyCourses() {
  return useQuery({
    queryKey: ["my-courses"],
    queryFn: courseApi.getMyCourses,
  });
}
