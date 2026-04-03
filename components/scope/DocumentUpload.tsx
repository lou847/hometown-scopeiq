"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DOCUMENT_TYPES, type DocumentType, type ProjectDocument } from "@/lib/types";
import { v4 as uuid } from "uuid";

interface Props {
  projectId: string;
  documents: ProjectDocument[];
}

export function DocumentUpload({ projectId, documents }: Props) {
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressPhase, setProgressPhase] = useState("");
  const [docType, setDocType] = useState<DocumentType>("blueprints");
  const router = useRouter();
  const supabase = createClient();

  const unprocessed = documents.filter((d) => !d.ai_processed);

  async function handleReset() {
    await fetch("/api/extract", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId }),
    });
    router.refresh();
  }

  async function handleDeleteDoc(docId: string, fileUrl: string) {
    await supabase.storage.from("documents").remove([fileUrl]);
    await supabase.from("project_documents").delete().eq("id", docId);
    router.refresh();
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      for (const file of Array.from(files)) {
        const fileId = uuid();
        const storagePath = `${projectId}/${fileId}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(storagePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        await supabase.from("project_documents").insert({
          project_id: projectId,
          file_name: file.name,
          file_url: storagePath,
          document_type: docType,
          uploaded_by: user.id,
        });
      }

      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  async function handleExtract() {
    setExtracting(true);
    setProgress(0);
    setProgressPhase("Starting...");

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId }),
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        try {
          const err = JSON.parse(text);
          alert(`Extraction failed: ${err.error}`);
        } catch {
          alert(`Extraction failed: ${text || "Unknown error"}`);
        }
        return;
      }

      // Read SSE stream
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.error) {
              alert(`Extraction failed: ${data.error}`);
              return;
            }
            if (data.pct !== undefined) {
              setProgress(data.pct);
              setProgressPhase(data.phase);
            }
            if (data.done) {
              setProgress(100);
              setProgressPhase(`Done! ${data.scope_items_created} items extracted.`);
            }
          } catch {
            // skip malformed SSE
          }
        }
      }

      router.refresh();
    } finally {
      setTimeout(() => {
        setExtracting(false);
        setProgress(0);
        setProgressPhase("");
      }, 1500);
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload controls */}
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Document Type</label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocumentType)}
            className="border rounded px-3 py-2 text-sm"
          >
            {DOCUMENT_TYPES.map((dt) => (
              <option key={dt} value={dt}>
                {dt.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Upload PDFs</label>
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="text-sm"
          />
        </div>
        {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
      </div>

      {/* Document list */}
      {documents.length > 0 && (
        <div className="border rounded divide-y text-sm">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <span>{doc.file_name}</span>
                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded capitalize">
                  {doc.document_type.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${doc.ai_processed ? "text-green-600" : "text-gray-400"}`}>
                  {doc.ai_processed ? "Processed" : "Pending"}
                </span>
                <button
                  onClick={() => handleDeleteDoc(doc.id, doc.file_url)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {extracting && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{progressPhase}</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-black h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Extract / Reset button */}
      {!extracting && (
        <div className="flex gap-2">
          {unprocessed.length > 0 ? (
            <button
              onClick={handleExtract}
              className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800"
            >
              Run AI Extraction ({unprocessed.length} document{unprocessed.length > 1 ? "s" : ""})
            </button>
          ) : documents.length > 0 ? (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
            >
              Reset &amp; Re-extract
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
