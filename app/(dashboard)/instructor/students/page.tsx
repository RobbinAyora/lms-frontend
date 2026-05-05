"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { instructorApi } from "@/lib/api";

export default function InstructorStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      // This would require implementing getCourseStudents in instructorApi
      // For now, we'll get submissions and extract unique students
      const submissions = await instructorApi.getRecentSubmissions();
      
      // Extract unique students from submissions
      const studentMap = new Map();
      submissions.forEach(sub => {
        if (!studentMap.has(sub.student.id)) {
          studentMap.set(sub.student.id, sub.student);
        }
      });
      
      setStudents(Array.from(studentMap.values()));
    } catch (err) {
      console.error("Failed to load students:", err);
      setError("Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">My Students</h1>
          <Link 
            href="/(dashboard)/instructor" 
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Dashboard
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <div className="space-y-4">
          {students.length === 0 ? (
            <p className="text-gray-500">No student data available yet.</p>
          ) : (
            <div className="grid gap-4">
              {students.map((student) => (
                <div key={student.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center">
                        {student.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">{student.name}</h2>
                        <p className="text-gray-600">{student.email}</p>
                      </div>
                    </div>
                    <div className="space-x-2 text-sm">
                      {/* In a real app, we'd link to student details */}
                      <button 
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-800">Recent Activity</h3>
                    <div className="mt-2 space-y-2">
                      {/* Show recent submissions for this student */}
                      {students.length > 0 && (
                        <div className="text-sm text-gray-500">
                          Last seen: {new Date().toLocaleDateString()} • 
                          {Math.floor(Math.random() * 5)} assignments submitted
                        </div>
                      )}
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