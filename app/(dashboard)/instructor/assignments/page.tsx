"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { instructorApi } from "@/lib/api";

export default function InstructorAssignmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (courseId) {
      loadAssignments();
    }
  }, [courseId]);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const data = await instructorApi.getCourseAssignments(courseId);
      setAssignments(data);
    } catch (err) {
      console.error("Failed to load assignments:", err);
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  if (!courseId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Course Not Selected</h2>
          <p className="text-gray-600">Please select a course to view its assignments.</p>
          <Link 
            href="/(dashboard)/instructor/courses" 
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">Course Assignments</h1>
          <div className="flex space-x-3">
            <Link 
              href={`/(dashboard)/instructor/course-builder?id=${courseId}`} 
              className="text-blue-600 hover:text-blue-800"
            >
              Edit Course
            </Link>
            <Link 
              href="/(dashboard)/instructor/courses" 
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Courses
            </Link>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <Link 
          href={`/(dashboard)/instructor/assignment-builder?courseId=${courseId}`} 
          className="mb-6 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create New Assignment
        </Link>
        
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <p className="text-gray-500">No assignments found for this course.</p>
          ) : (
            <div className="grid gap-4">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold">{assignment.title}</h2>
                      <p className="text-gray-600 mt-1">{assignment.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {assignment.maxGrade} points
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                        {assignment.status === "published" && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Published
                          </span>
                        )}
                        {assignment.status === "draft" && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Draft
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-x-2">
                      <Link 
                        href={`/(dashboard)/instructor/assignment-builder?courseId=${courseId}&assignmentId=${assignment.id}`} 
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => deleteAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

async function deleteAssignment(assignmentId: string) {
  if (window.confirm("Are you sure you want to delete this assignment?")) {
    try {
      // This would require implementing deleteAssignment in instructorApi
      // For now, we'll just show a message
      alert("Delete functionality would be implemented here");
      // Refetch assignments
      window.location.reload();
    } catch (err) {
      console.error("Failed to delete assignment:", err);
      alert("Failed to delete assignment");
    }
  }
}