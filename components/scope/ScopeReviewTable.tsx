"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ScopeItem, ProjectDocument, Trade } from "@/lib/types";
import { TRADES } from "@/lib/types";
import { ScopeItemRow } from "./ScopeItemRow";
import { ScopePublishButton } from "./ScopePublishButton";
import { DocumentUpload } from "./DocumentUpload";
import { v4 as uuid } from "uuid";

interface Props {
  projectId: string;
  scopeItems: ScopeItem[];
  documents: ProjectDocument[];
}

export function ScopeReviewTable({ projectId, scopeItems, documents }: Props) {
  const [items, setItems] = useState(scopeItems);
  const [activeTrade, setActiveTrade] = useState<Trade | "all">("all");
  const [adding, setAdding] = useState(false);
  const [newTrade, setNewTrade] = useState<Trade>("electrical");
  const [newText, setNewText] = useState("");
  const [newRef, setNewRef] = useState("");
  const supabase = createClient();

  const tradesWithItems = TRADES.filter((t) =>
    items.some((item) => item.trade === t)
  );

  const filtered = activeTrade === "all"
    ? items
    : items.filter((item) => item.trade === activeTrade);

  async function handleMove(id: string, direction: "up" | "down") {
    const idx = items.findIndex((i) => i.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;

    const updated = [...items];
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    updated[idx].sort_order = idx;
    updated[swapIdx].sort_order = swapIdx;
    setItems(updated);

    await supabase.from("scope_items").update({ sort_order: idx }).eq("id", updated[idx].id);
    await supabase.from("scope_items").update({ sort_order: swapIdx }).eq("id", updated[swapIdx].id);
  }

  async function handleAddItem() {
    if (!newText.trim()) return;

    const newItem: ScopeItem = {
      id: uuid(),
      project_id: projectId,
      trade: newTrade,
      item_text: newText,
      drawing_ref: newRef || null,
      notes: null,
      is_fbo: false,
      is_by_others: false,
      lead_time_flag: false,
      sort_order: items.length,
      created_by_ai: false,
      ai_confidence: "high",
      published: false,
      published_at: null,
      created_at: new Date().toISOString(),
    };

    await supabase.from("scope_items").insert(newItem);
    setItems((prev) => [...prev, newItem]);
    setNewText("");
    setNewRef("");
    setAdding(false);
  }

  return (
    <div>
      {/* Document upload section */}
      <div className="mb-6 p-4 border rounded-lg bg-white">
        <h3 className="font-semibold mb-2">Documents ({documents.length})</h3>
        <DocumentUpload projectId={projectId} documents={documents} />
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
              <ScopeItemRow key={item.id} item={item} onUpdate={setItems} onMove={handleMove} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No scope items yet. Upload documents and run AI extraction, or add items manually.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add item */}
      <div className="mt-4">
        {adding ? (
          <div className="flex items-end gap-2 p-3 border rounded-lg bg-white">
            <div>
              <label className="block text-xs font-medium mb-1">Trade</label>
              <select
                value={newTrade}
                onChange={(e) => setNewTrade(e.target.value as Trade)}
                className="border rounded px-2 py-1.5 text-sm capitalize"
              >
                {TRADES.map((t) => (
                  <option key={t} value={t}>{t.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1">Scope Item</label>
              <input
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full border rounded px-2 py-1.5 text-sm"
                placeholder="Describe the scope item..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Drawing Ref</label>
              <input
                value={newRef}
                onChange={(e) => setNewRef(e.target.value)}
                className="border rounded px-2 py-1.5 text-sm w-24"
                placeholder="E4.0"
              />
            </div>
            <button onClick={handleAddItem} className="px-3 py-1.5 bg-black text-white text-sm rounded">
              Add
            </button>
            <button onClick={() => setAdding(false)} className="px-3 py-1.5 border text-sm rounded">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
          >
            + Add Scope Item
          </button>
        )}
      </div>

      {/* Publish controls per trade */}
      <div className="mt-6 flex gap-4 flex-wrap">
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
