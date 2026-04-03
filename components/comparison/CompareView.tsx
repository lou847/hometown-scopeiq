"use client";

import { useState } from "react";
import type { BidSubmission, ScopeItem, ReferenceBid, Trade } from "@/lib/types";
import { TRADES } from "@/lib/types";
import { ScopeCompareGrid } from "./ScopeCompareGrid";
import { LaborCompareGrid } from "./LaborCompareGrid";
import { ReferenceColumn } from "./ReferenceColumn";
import type { LegacyBid } from "@/components/dashboard/LegacyBidsTab";

interface Props {
  submissions: (BidSubmission & {
    bid_scope_responses: { scope_item_id: string; response: string; note: string | null }[];
    bid_labor_rows: { classification: string; base_wage_entered: number; fringe_entered: number; idol_base_minimum: number; idol_fringe_minimum: number; worker_count: number; hours_per_worker: number; below_minimum: boolean; variance: number; row_total: number }[];
  })[];
  scopeItems: ScopeItem[];
  referenceBids: ReferenceBid[];
  legacyBids?: LegacyBid[];
}

export function CompareView({ submissions, scopeItems, referenceBids, legacyBids = [] }: Props) {
  const tradesWithData = TRADES.filter((t) =>
    submissions.some((s) => s.trade === t) || legacyBids.some((lb) => lb.trade === t)
  );
  const [activeTrade, setActiveTrade] = useState<Trade>(tradesWithData[0] ?? "electrical");

  const tradeSubs = submissions.filter((s) => s.trade === activeTrade);
  const tradeScope = scopeItems.filter((s) => s.trade === activeTrade);
  const tradeRef = referenceBids.filter((r) => r.trade === activeTrade);
  const tradeLegacy = legacyBids.filter((lb) => lb.trade === activeTrade);

  return (
    <div>
      {/* Trade tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tradesWithData.map((trade) => {
          const subCount = submissions.filter((s) => s.trade === trade).length;
          const legacyCount = legacyBids.filter((lb) => lb.trade === trade).length;
          return (
            <button
              key={trade}
              onClick={() => setActiveTrade(trade)}
              className={`px-3 py-1 text-sm rounded capitalize ${activeTrade === trade ? "bg-black text-white" : "bg-gray-100"}`}
            >
              {trade.replace(/_/g, " ")} ({subCount}{legacyCount > 0 ? `+${legacyCount}` : ""})
            </button>
          );
        })}
      </div>

      {tradeSubs.length === 0 && tradeLegacy.length === 0 ? (
        <p className="text-gray-500">No submissions for this trade yet.</p>
      ) : (
        <div className="space-y-8">
          {/* Summary row */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 w-48"></th>
                  {tradeSubs.map((s) => (
                    <th key={s.id} className="text-center px-4 py-2 font-medium">{s.company_name}</th>
                  ))}
                  {tradeRef.map((r) => (
                    <th key={r.id} className="text-center px-4 py-2 font-medium text-gray-400">
                      {r.company_name} (Ref)
                    </th>
                  ))}
                  {tradeLegacy.map((lb) => (
                    <th key={lb.id} className="text-center px-4 py-2 font-medium text-gray-400 bg-gray-100">
                      {lb.vendor} (Legacy)
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-2 font-medium">Total Bid</td>
                  {tradeSubs.map((s) => (
                    <td key={s.id} className="text-center px-4 py-2 font-bold">
                      ${(s.total_labor + s.total_material + (s.total_labor + s.total_material) * (s.ohp_pct / 100)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                  ))}
                  {tradeRef.map((r) => (
                    <td key={r.id} className="text-center px-4 py-2 text-gray-400">
                      {r.total_bid_amount ? `$${r.total_bid_amount.toLocaleString()}` : "—"}
                    </td>
                  ))}
                  {tradeLegacy.map((lb) => (
                    <td key={lb.id} className="text-center px-4 py-2 text-gray-500 bg-gray-100">
                      {lb.bid_amount != null ? `$${lb.bid_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "N/A"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">Flagged Rows</td>
                  {tradeSubs.map((s) => (
                    <td key={s.id} className={`text-center px-4 py-2 ${s.flagged_row_count > 0 ? "text-red-600 font-bold" : ""}`}>
                      {s.flagged_row_count}
                    </td>
                  ))}
                  {tradeRef.map((r) => <td key={r.id} className="text-center px-4 py-2 text-gray-400">—</td>)}
                  {tradeLegacy.map((lb) => <td key={lb.id} className="text-center px-4 py-2 text-gray-400 bg-gray-100">—</td>)}
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">OH&P %</td>
                  {tradeSubs.map((s) => (
                    <td key={s.id} className="text-center px-4 py-2">{s.ohp_pct}%</td>
                  ))}
                  {tradeRef.map((r) => <td key={r.id} className="text-center px-4 py-2 text-gray-400">—</td>)}
                  {tradeLegacy.map((lb) => <td key={lb.id} className="text-center px-4 py-2 text-gray-400 bg-gray-100">—</td>)}
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium">PW Confirmed</td>
                  {tradeSubs.map((s) => <td key={s.id} className="text-center px-4 py-2">—</td>)}
                  {tradeRef.map((r) => <td key={r.id} className="text-center px-4 py-2 text-gray-400">—</td>)}
                  {tradeLegacy.map((lb) => (
                    <td key={lb.id} className="text-center px-4 py-2 bg-gray-100">
                      {lb.pw_confirmed ? <span className="text-green-600">Yes</span> : <span className="text-red-500">No</span>}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Legacy bid scope & exclusion notes */}
          {tradeLegacy.some((lb) => lb.scope_notes || lb.exclusions) && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Legacy Bid Notes</h3>
              <div className="space-y-2">
                {tradeLegacy.filter((lb) => lb.scope_notes || lb.exclusions).map((lb) => (
                  <div key={lb.id} className="text-sm">
                    <span className="font-medium">{lb.vendor}:</span>
                    {lb.scope_notes && <span className="text-gray-600 ml-2">Scope: {lb.scope_notes}</span>}
                    {lb.exclusions && <span className="text-red-600 ml-2">Exclusions: {lb.exclusions}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scope comparison */}
          <ScopeCompareGrid scopeItems={tradeScope} submissions={tradeSubs} />

          {/* Labor comparison */}
          <LaborCompareGrid submissions={tradeSubs} />

          {/* Reference bids */}
          {tradeRef.map((ref) => (
            <ReferenceColumn key={ref.id} referenceBid={ref} />
          ))}
        </div>
      )}
    </div>
  );
}
