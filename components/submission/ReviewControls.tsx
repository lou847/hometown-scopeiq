"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BidSubmission, ReviewStatus } from "@/lib/types";
import { REVIEW_STATUSES } from "@/lib/types";

interface Props {
  submission: BidSubmission;
}

export function ReviewControls({ submission }: Props) {
  const [status, setStatus] = useState<ReviewStatus>(submission.review_status);
  const [notes, setNotes] = useState(submission.review_notes ?? "");
  const supabase = createClient();

  async function updateStatus(newStatus: ReviewStatus) {
    setStatus(newStatus);
    await supabase
      .from("bid_submissions")
      .update({
        review_status: newStatus,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submission.id);
  }

  async function saveNotes() {
    await supabase
      .from("bid_submissions")
      .update({ review_notes: notes })
      .eq("id", submission.id);
  }

  return (
    <section className="border rounded-lg p-4 bg-white">
      <h2 className="font-semibold mb-3">Admin Review</h2>

      <div className="flex gap-2 mb-4">
        {REVIEW_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => updateStatus(s)}
            className={`px-3 py-1.5 text-sm rounded capitalize ${
              status === s
                ? s === "approved" ? "bg-green-600 text-white"
                : s === "rejected" ? "bg-red-600 text-white"
                : "bg-black text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Review Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
          className="w-full border rounded px-3 py-2 text-sm"
          rows={3}
          placeholder="Internal notes (auto-saves on blur)..."
        />
      </div>
    </section>
  );
}
