"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { instructorApi } from "@/lib/api/instructor";
import { Lesson } from "@/lib/api/courses";

export function useUploadLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => instructorApi.uploadLessonWithFile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
    },
  });
}
