import Link from "next/link";
import type { BidSubmission } from "@/lib/types";

interface Props {
  submission: BidSubmission;
  projectSlug: string;
}

const REVIEW_STYLES: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  in_review: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export function SubmissionRow({ submission, projectSlug }: Props) {
  const totalBid = submission.is_lump_sum
    ? submission.lump_sum_total ?? 0
    : submission.total_labor + submission.total_material +
      (submission.total_labor + submission.total_material) * (submission.ohp_pct / 100);

  return (
    <tr>
      <td className="px-4 py-2">
        <Link
          href={`/dashboard/${projectSlug}/${submission.id}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {submission.company_name}
        </Link>
      </td>
      <td className="px-4 py-2 capitalize">{submission.trade.replace("_", " ")}</td>
      <td className="px-4 py-2 text-right font-medium">
        ${totalBid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </td>
      {!submission.is_lump_sum && (
        <>
          <td className="px-4 py-2 text-center">
            {submission.flagged_row_count > 0 ? (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                {submission.flagged_row_count} flagged
              </span>
            ) : (
              <span className="text-xs text-green-600">—</span>
            )}
          </td>
          <td className="px-4 py-2 text-center">
            {submission.scope_gap_count > 0 ? (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                {submission.scope_gap_count} gaps
              </span>
            ) : (
              <span className="text-xs text-green-600">—</span>
            )}
          </td>
        </>
      )}
      <td className="px-4 py-2">
        <span className={`text-xs px-2 py-0.5 rounded ${REVIEW_STYLES[submission.review_status] ?? ""}`}>
          {submission.review_status.replace("_", " ")}
        </span>
      </td>
    </tr>
  );
}
