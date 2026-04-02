"use client";

import { useState } from "react";
import type { ScopeItem, ProjectDocument, Trade } from "@/lib/types";
import { TRADES } from "@/lib/types";
import { ScopeItemRow } from "./ScopeItemRow";
import { ScopePublishButton } from "./ScopePublishButton";

interface Props {
  projectId: string;
  scopeItems: ScopeItem[];
  documents: ProjectDocument[];
}

export function ScopeReviewTable({ projectId, scopeItems, documents }: Props) {
  const [items, setItems] = useState(scopeItems);
  const [activeTrade, setActiveTrade] = useState<Trade | "all">("all");

  const tradesWithItems = TRADES.filter((t) =>
    items.some((item) => item.trade === t)
  );

  const filtered = activeTrade === "all"
    ? items
    : items.filter((item) => item.trade === activeTrade);

  return (
    <div>
      {/* Document upload section */}
      <div className="mb-6 p-4 border rounded-lg bg-white">
        <h3 className="font-semibold mb-2">Documents ({documents.length})</h3>
        {/* TODO: File upload UI */}
        <p className="text-sm text-gray-500">Upload PDFs to extract scope items using AI.</p>
      </div>

      {/* Trade filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setActiveTrade("all")}
          className={`px-3 py-1 text-sm rounded ${activeTrade === "all" ? "bg-black text-white" : "bg-gray-100"}`}
        >
          All ({items.length})
        </button>
        {tradesWithItems.map((trade) => (
          <button
            key={trade}
            onClick={() => setActiveTrade(trade)}
            className={`px-3 py-1 text-sm rounded capitalize ${activeTrade === trade ? "bg-black text-white" : "bg-gray-100"}`}
          >
            {trade.replace("_", " ")} ({items.filter((i) => i.trade === trade).length})
          </button>
        ))}
      </div>

      {/* Scope items table */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-2">Scope Item</th>
              <th className="text-left px-4 py-2 w-24">Drawing Ref</th>
              <th className="text-left px-4 py-2 w-20">FBO</th>
              <th className="text-left px-4 py-2 w-20">By Others</th>
              <th className="text-left px-4 py-2 w-24">Confidence</th>
              <th className="text-left px-4 py-2 w-24">Status</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((item) => (
              <ScopeItemRow key={item.id} item={item} onUpdate={setItems} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Publish controls per trade */}
      <div className="mt-6 flex gap-4">
        {tradesWithItems.map((trade) => (
          <ScopePublishButton
            key={trade}
            projectId={projectId}
            trade={trade}
            items={items.filter((i) => i.trade === trade)}
          />
        ))}
      </div>
    </div>
  );
}
