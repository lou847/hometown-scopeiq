"use client";

import { useState } from "react";
import type { BidSubmission, Trade } from "@/lib/types";
import { TRADES } from "@/lib/types";
import { SubmissionRow } from "./SubmissionRow";

interface Props {
  submissions: BidSubmission[];
  projectSlug: string;
}

export function SubmissionsTab({ submissions, projectSlug }: Props) {
  const [tradeFilter, setTradeFilter] = useState<Trade | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFlagged, setShowFlagged] = useState(false);
  const [showGaps, setShowGaps] = useState(false);

  if (!submissions.length) {
    return <p className="text-sm text-gray-500">No submissions received yet.</p>;
  }

  let filtered = submissions;
  if (tradeFilter !== "all") filtered = filtered.filter((s) => s.trade === tradeFilter);
  if (statusFilter !== "all") filtered = filtered.filter((s) => s.review_status === statusFilter);
  if (showFlagged) filtered = filtered.filter((s) => s.flagged_row_count > 0);
  if (showGaps) filtered = filtered.filter((s) => s.scope_gap_count > 0);

  const complete = filtered.filter((s) => !s.is_lump_sum);
  const incomplete = filtered.filter((s) => s.is_lump_sum);
  const tradesInSubs = [...new Set(submissions.map((s) => s.trade))];

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex gap-3 flex-wrap items-center">
        <select
          value={tradeFilter}
          onChange={(e) => setTradeFilter(e.target.value as Trade | "all")}
          className="border rounded px-2 py-1 text-sm capitalize"
        >
          <option value="all">All trades</option>
          {TRADES.filter((t) => tradesInSubs.includes(t)).map((t) => (
            <option key={t} value={t}>{t.replace("_", " ")}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_review">In Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={showFlagged} onChange={(e) => setShowFlagged(e.target.checked)} />
          Flagged only
        </label>
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={showGaps} onChange={(e) => setShowGaps(e.target.checked)} />
          Scope gaps only
        </label>
        <span className="text-xs text-gray-400">{filtered.length} of {submissions.length}</span>
      </div>

      {complete.length > 0 && (
        <div className="border rounded-lg bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2">Company</th>
                <th className="text-left px-4 py-2">Trade</th>
                <th className="text-right px-4 py-2">Total Bid</th>
                <th className="text-center px-4 py-2">Flagged</th>
                <th className="text-center px-4 py-2">Scope Gaps</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {complete.map((sub) => (
                <SubmissionRow key={sub.id} submission={sub} projectSlug={projectSlug} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {incomplete.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-amber-800 mb-2">
            Incomplete — No Classification Data ({incomplete.length})
          </h3>
          <div className="border border-amber-200 rounded-lg bg-amber-50 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-amber-100 border-b border-amber-200">
                <tr>
                  <th className="text-left px-4 py-2">Company</th>
                  <th className="text-left px-4 py-2">Trade</th>
                  <th className="text-right px-4 py-2">Lump Sum</th>
                  <th className="text-left px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200">
                {incomplete.map((sub) => (
                  <SubmissionRow key={sub.id} submission={sub} projectSlug={projectSlug} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-sm text-gray-500 py-4 text-center">No submissions match filters.</p>
      )}
    </div>
  );
}
