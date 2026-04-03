"use client";

import { LegacyBidImport } from "./LegacyBidImport";

export interface LegacyBid {
  id: string;
  project_id: string;
  trade: string;
  vendor: string;
  bid_amount: number | null;
  file_type: string | null;
  pw_confirmed: boolean;
  detail_score: number | null;
  issues: string | null;
  scope_notes: string | null;
  exclusions: string | null;
  source_file: string | null;
  imported_at: string;
}

interface Props {
  legacyBids: LegacyBid[];
  projectId: string;
}

export function LegacyBidsTab({ legacyBids, projectId }: Props) {
  // Group bids by trade
  const grouped = legacyBids.reduce<Record<string, LegacyBid[]>>((acc, bid) => {
    if (!acc[bid.trade]) acc[bid.trade] = [];
    acc[bid.trade].push(bid);
    return acc;
  }, {});

  const trades = Object.keys(grouped).sort();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Legacy Bids</h2>
        <LegacyBidImport projectId={projectId} />
      </div>

      {trades.length === 0 ? (
        <p className="text-gray-500">No legacy bids imported yet. Upload a bid comparison spreadsheet to get started.</p>
      ) : (
        <div className="space-y-6">
          {trades.map((trade) => (
            <div key={trade}>
              <h3 className="text-lg font-medium capitalize mb-2">
                {trade.replace(/_/g, " ")}
                <span className="text-sm text-gray-400 ml-2">({grouped[trade].length} bids)</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2">Vendor</th>
                      <th className="text-right px-4 py-2">Bid Amount</th>
                      <th className="text-center px-4 py-2">PW</th>
                      <th className="text-center px-4 py-2">Detail Score</th>
                      <th className="text-left px-4 py-2">Issues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {grouped[trade].map((bid) => (
                      <tr key={bid.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{bid.vendor}</td>
                        <td className="px-4 py-2 text-right">
                          {bid.bid_amount != null
                            ? `$${bid.bid_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                            : "N/A"}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {bid.pw_confirmed ? (
                            <span className="text-green-600 font-medium">Yes</span>
                          ) : (
                            <span className="text-red-500">No</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {bid.detail_score != null ? bid.detail_score : "---"}
                        </td>
                        <td className="px-4 py-2 text-gray-600 max-w-xs truncate" title={bid.issues ?? undefined}>
                          {bid.issues ?? "---"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
