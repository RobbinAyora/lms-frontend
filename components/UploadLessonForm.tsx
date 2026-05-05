"use client";

import { useState } from "react";
import { useInstructorCourses } from "@/lib/hooks/useCourses";
import { useUploadLesson } from "@/lib/hooks/useLessons";
import { Input, Textarea, Select, Button } from "@/components/ui";
import { useToast } from "@/context/ToastContext";

interface UploadLessonFormProps {
  courseId?: string;
  onSuccess?: () => void;
}

export function UploadLessonForm({ courseId: initialCourseId, onSuccess }: UploadLessonFormProps) {
  const { data: courses = [] } = useInstructorCourses();
  const uploadLesson = useUploadLesson();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId || "");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !title.trim() || !selectedCourseId) {
      showToast("Please fill all required fields and select a video", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("title", title.trim());
    formData.append("type", "video");
    formData.append("duration", "0:00"); // Default duration, can be updated later
    formData.append("courseId", selectedCourseId);
    formData.append("order", "0"); // Will be reordered by backend if needed
    if (description.trim()) {
      formData.append("description", description.trim());
    }

    try {
      await uploadLesson.mutateAsync(formData);
      showToast("Lesson uploaded successfully!", "success");
      setTitle("");
      setDescription("");
      setVideoFile(null);
      if (!initialCourseId) setSelectedCourseId("");
      onSuccess?.();
    } catch (error: any) {
      showToast(error.message || "Upload failed", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
        <Select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          options={[
            { value: "", label: "Select a course" },
            ...courses.map((course) => ({
              value: course.id,
              label: course.title,
            })),
          ]}
          required
          disabled={!!initialCourseId}
        />
      </div>

      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Lesson title"
        required
      />

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Lesson description"
        rows={3}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Video</label>
        <Input
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          required
        />
      </div>

      <Button type="submit" isLoading={uploadLesson.isPending}>
        {uploadLesson.isPending ? "Uploading..." : "Upload Lesson"}
      </Button>
    </form>
  );
}

