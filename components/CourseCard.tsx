"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Course } from "@/lib/api/courses";
import { Button } from "@/components/ui/Button";
import { courseApi } from "@/lib/api/courses";
import { useToast } from "@/context/ToastContext";

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => Promise<void>;
  showEnrollButton?: boolean;
}

export function CourseCard({ course, onEnroll, showEnrollButton = false }: CourseCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const isEnrolled = course.isEnrolled || course.progress !== undefined;

  const handleEnroll = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onEnroll) return;
    
    setIsEnrolling(true);
    try {
      await onEnroll(course.id);
    } catch (error) {
      showToast("Failed to enroll in course", "error");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isEnrolled) {
      router.push(`/student/player?courseId=${course.id}`);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${isEnrolled ? '' : 'hover:border-blue-300'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
          <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs text-white font-medium">
            {course.category}
          </span>
          {course.price !== undefined && (
            <span className="inline-block px-2 py-1 bg-green-500/80 backdrop-blur-sm rounded text-xs text-white font-semibold">
              ${course.price}
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          {course.instructor?.name || "Instructor"}
        </p>
        
        {isEnrolled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-blue-600">{course.progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${course.progress || 0}%` }}
              />
            </div>
          </div>
        )}
        
        {course.nextLesson && isEnrolled && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Next: {course.nextLesson}</p>
          </div>
        )}
        
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>{course.totalLessons || 0} lessons</span>
          <span>{course.duration}</span>
        </div>

        {showEnrollButton && !isEnrolled && onEnroll && (
          <div className="mt-4">
            <Button
              onClick={handleEnroll}
              isLoading={isEnrolling}
              className="w-full"
            >
              Enroll Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-200" />
      <div className="p-4">
        <div className="h-5 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded" />
          <div className="h-2 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}