"use client";

import { useState } from "react";
import { uploadSlxAction } from "./uploadAction";
import { save } from "../lib/slx-json.store";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const router = useRouter();

  /** Handles file selection via input */
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;
    processFile(uploadedFile);
  };

  /** Handles drag & drop upload */
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const uploadedFile = event.dataTransfer.files[0];
    if (uploadedFile) processFile(uploadedFile);
  };

  /** Processes the uploaded file */
  const processFile = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setUploading(true);
    setError("");
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const parsedData = await uploadSlxAction(formData);

      if (!parsedData) {
        throw new Error("Failed to process file");
      }

      // Store parsed data in IndexedDB
      await save(parsedData);
      console.log("SLX data saved to IndexedDB");

      setUploadSuccess(true);
    } catch (err) {
      setError("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <h2>Upload Simulink File</h2>

      {/* Drag & Drop Upload Area */}
      <div
        className={`drop-zone ${dragging ? "dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <p>Drag & Drop a file here, or click to select</p>
        <input
          type="file"
          className="file-input"
          onChange={handleFileUpload}
          id="fileUpload"
        />
      </div>

      {/* Display selected file name */}
      {file && <p className="file-name">Selected: {file.name}</p>}

      {/* Upload progress bar */}
      {uploading && (
        <div className="progress-bar">
          <div className="progress"></div>
        </div>
      )}

      {/* Error message */}
      {error && <p className="error">{error}</p>}

      {/* File selection button */}
      {!uploadSuccess && (
        <label htmlFor="fileUpload" className="upload-btn">
          Choose File
        </label>
      )}

      {/* Show "Go to Preview" button after successful upload */}
      {uploadSuccess && (
        <label className="preview-btn" onClick={() => router.push("/view")}>
          Go to Preview →
        </label>
      )}
    </div>
  );
}
