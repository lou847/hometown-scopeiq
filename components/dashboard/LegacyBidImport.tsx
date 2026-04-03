"use client";

import { useState, useRef } from "react";

interface Props {
  projectId: string;
}

export function LegacyBidImport({ projectId }: Props) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ imported: number; sheet: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/import-legacy?project_id=${projectId}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Import failed");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="px-4 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
      >
        {uploading ? "Importing..." : "Import Legacy Bids"}
      </button>

      {uploading && (
        <span className="text-sm text-gray-500">Processing spreadsheet...</span>
      )}
      {result && (
        <span className="text-sm text-green-600">
          Imported {result.imported} bids from &ldquo;{result.sheet}&rdquo;
        </span>
      )}
      {error && (
        <span className="text-sm text-red-600">{error}</span>
      )}
    </div>
  );
}
