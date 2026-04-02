"use client";

import type { BidSubmission } from "@/lib/types";
import { LaborTable } from "./LaborTable";
import { ReviewControls } from "./ReviewControls";

interface Props {
  submission: BidSubmission & {
    bid_scope_responses: { scope_item_id: string; response: string; note: string | null; scope_items: { item_text: string; drawing_ref: string | null } }[];
    bid_labor_rows: { classification: string; base_wage_entered: number; fringe_entered: number; idol_base_minimum: number; idol_fringe_minimum: number; below_minimum: boolean; variance: number; row_total: number; worker_count: number; hours_per_worker: number }[];
  };
}

export function SubmissionDetail({ submission }: Props) {
  const totalBid = submission.is_lump_sum
    ? submission.lump_sum_total ?? 0
    : submission.total_labor + submission.total_material +
      (submission.total_labor + submission.total_material) * (submission.ohp_pct / 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{submission.company_name}</h1>
        <p className="text-gray-600 capitalize">{submission.trade.replace("_", " ")}</p>
        <p className="text-2xl font-bold mt-2">
          ${totalBid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Section A — Contractor Info */}
      <section className="border rounded-lg p-4 bg-white">
        <h2 className="font-semibold mb-3">Contractor Information</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-gray-500">Contact:</span> {submission.contact_name}</div>
          <div><span className="text-gray-500">Email:</span> {submission.contact_email}</div>
          <div><span className="text-gray-500">Phone:</span> {submission.contact_phone}</div>
          <div><span className="text-gray-500">IL License:</span> {submission.il_license_number || "—"}</div>
        </div>
      </section>

      {/* Section B — Scope Responses */}
      <section className="border rounded-lg p-4 bg-white">
        <h2 className="font-semibold mb-3">Scope Confirmation</h2>
        <div className="space-y-2">
          {submission.bid_scope_responses.map((resp) => (
            <div
              key={resp.scope_item_id}
              className={`flex items-start gap-3 p-2 rounded text-sm ${
                resp.response === "excluded" ? "bg-red-50" :
                resp.response === "clarify" ? "bg-yellow-50" : ""
              }`}
            >
              <span className={`font-medium w-20 ${
                resp.response === "included" ? "text-green-600" :
                resp.response === "excluded" ? "text-red-600" : "text-yellow-600"
              }`}>
                {resp.response === "included" ? "Included" :
                 resp.response === "excluded" ? "Excluded" : "Clarify"}
              </span>
              <div className="flex-1">
                <div>{resp.scope_items.item_text}</div>
                {resp.note && <div className="text-xs text-gray-500 mt-1">{resp.note}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section C — Labor */}
      {!submission.is_lump_sum && (
        <LaborTable laborRows={submission.bid_labor_rows} />
      )}

      {submission.is_lump_sum && (
        <div className="border border-amber-300 rounded-lg p-4 bg-amber-50">
          <p className="text-amber-800 font-medium">Lump Sum Submission — No Classification Data</p>
          <p className="text-2xl font-bold mt-1">
            ${(submission.lump_sum_total ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
      )}

      {/* Section D — Summary */}
      <section className="border rounded-lg p-4 bg-white">
        <h2 className="font-semibold mb-3">Bid Summary</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-gray-500">Total Labor:</span> ${submission.total_labor.toLocaleString()}</div>
          <div><span className="text-gray-500">Total Material:</span> ${submission.total_material.toLocaleString()}</div>
          <div><span className="text-gray-500">OH&P:</span> {submission.ohp_pct}%</div>
          <div><span className="text-gray-500">PW Labor:</span> ${submission.pw_labor_total.toLocaleString()}</div>
        </div>
      </section>

      {/* Exclusions */}
      {(submission.exclusions_notes || submission.lead_time_notes) && (
        <section className="border rounded-lg p-4 bg-white">
          <h2 className="font-semibold mb-3">Exclusions &amp; Lead Times</h2>
          {submission.exclusions_notes && <p className="text-sm mb-2">{submission.exclusions_notes}</p>}
          {submission.lead_time_notes && <p className="text-sm">{submission.lead_time_notes}</p>}
        </section>
      )}

      {/* Certification */}
      <section className="border rounded-lg p-4 bg-gray-50 text-sm">
        <p>Signed by <strong>{submission.signatory_name}</strong>, {submission.signatory_title}</p>
        <p className="text-gray-500">Date: {submission.signed_date}</p>
      </section>

      {/* Review controls */}
      <ReviewControls submission={submission} />
    </div>
  );
}
