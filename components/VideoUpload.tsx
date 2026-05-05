"use client";

import { useState, useRef } from "react";

interface VideoUploadProps {
  lessonId: string;
  selectedFile?: File | null;
  onFileSelect: (lessonId: string, file: File | null) => void;
  existingVideoUrl?: string;
  disabled?: boolean;
}

export function VideoUpload({
  lessonId,
  selectedFile,
  onFileSelect,
  existingVideoUrl,
  disabled = false,
}: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (disabled) return;
    if (!file) {
      onFileSelect(lessonId, null);
      return;
    }

    // Validate file type
    const validTypes = ["video/mp4", "video/webm", "video/quicktime"];
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid video file (MP4, WebM, or MOV)");
      return;
    }

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      alert("File size must be less than 500MB");
      return;
    }

    onFileSelect(lessonId, file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    handleFileSelect(file);
  };

  const clearFile = () => {
    onFileSelect(lessonId, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (existingVideoUrl) {
    return (
      <div className="flex items-center gap-2.5 p-2 rounded-lg bg-green-50 border border-green-100">
        <div className="w-6 h-6 rounded-md bg-green-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-green-700 truncate">Uploaded</p>
          <p className="text-[10px] text-green-600 truncate">{existingVideoUrl.split("/").pop()}</p>
        </div>
        <video src={existingVideoUrl} className="w-10 h-7 object-cover rounded" controls />
      </div>
    );
  }

  if (selectedFile) {
    return (
      <div className="flex items-center gap-2.5 p-2 rounded-lg bg-blue-50 border border-blue-100">
        <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-blue-700 truncate">{selectedFile.name}</p>
          <p className="text-[10px] text-blue-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            clearFile();
          }}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
        isDragging
          ? "border-blue-400 bg-blue-50"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-500 mt-1">MP4, WebM, MOV (max 500MB)</p>
        </div>
      </div>
    </div>
  );
}
