"use client";

import type { BidSubmission } from "@/lib/types";
import { SubmissionRow } from "./SubmissionRow";

interface Props {
  submissions: BidSubmission[];
  projectSlug: string;
}

export function SubmissionsTab({ submissions, projectSlug }: Props) {
  const complete = submissions.filter((s) => !s.is_lump_sum);
  const incomplete = submissions.filter((s) => s.is_lump_sum);

  if (!submissions.length) {
    return <p className="text-sm text-gray-500">No submissions received yet.</p>;
  }

  return (
    <div className="space-y-6">
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
    </div>
  );
}
