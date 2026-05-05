"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { instructorApi } from "@/lib/api";

export default function AssignmentBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const assignmentId = searchParams.get("assignmentId");
  const isEditMode = !!assignmentId;

  const [assignmentData, setAssignmentData] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxGrade: 100,
    instructions: "",
    status: "draft",
  });

  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (courseId) {
      loadCourseDetails();
    }
    if (isEditMode && assignmentId) {
      loadAssignmentDetails();
    }
  }, [courseId, isEditMode, assignmentId]);

  const loadCourseDetails = async () => {
    try {
      const data = await instructorApi.getCourseDetails(courseId);
      setCourseName(data.title);
    } catch (err) {
      console.error("Failed to load course details:", err);
      setError("Failed to load course details");
    }
  };

  const loadAssignmentDetails = async () => {
    setLoading(true);
    try {
      const data = await instructorApi.getAssignment(courseId, assignmentId);
      setAssignmentData(data);
    } catch (err) {
      console.error("Failed to load assignment details:", err);
      setError("Failed to load assignment details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setAssignmentData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isEditMode) {
        await instructorApi.updateAssignment(courseId, assignmentId, assignmentData);
        setSuccess("Assignment updated successfully!");
      } else {
        await instructorApi.createAssignment(courseId, assignmentData);
        setSuccess("Assignment created successfully!");
        // Reset form
        setAssignmentData({
          title: "",
          description: "",
          dueDate: "",
          maxGrade: 100,
          instructions: "",
          status: "draft",
        });
      }
    } catch (err) {
      console.error("Failed to save assignment:", err);
      setError("Failed to save assignment");
    } finally {
      setLoading(false);
    }
  };

  if (!courseId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Course Not Selected</h2>
          <p className="text-gray-600">Please select a course to manage its assignments.</p>
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
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit Assignment" : "Create New Assignment"}
          </h1>
          <div className="flex space-x-3">
            <p className="mt-2 text-sm text-gray-600">
              Course: <span className="font-medium">{courseName}</span>
            </p>
            <Link 
              href={`/(dashboard)/instructor/assignments?courseId=${courseId}`} 
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Assignments
            </Link>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <p className="text-green-700">{success}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Title
            </label>
            <input
              type="text"
              name="title"
              value={assignmentData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={assignmentData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={assignmentData.dueDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Grade
              </label>
              <input
                type="number"
                name="maxGrade"
                value={assignmentData.maxGrade}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions (Optional)
            </label>
            <textarea
              name="instructions"
              value={assignmentData.instructions}
              onChange={handleChange}
              rows="6"
              placeholder="Provide detailed instructions for students..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="status"
              checked={assignmentData.status === "published"}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700 cursor-pointer">
              Publish Assignment
            </label>
          </div>
        </form>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button 
            type="button"
            onClick={() => router.push(`/(dashboard)/instructor/assignments?courseId=${courseId}`)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : isEditMode ? "Update Assignment" : "Create Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}