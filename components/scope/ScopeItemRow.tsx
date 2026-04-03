"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ScopeItem, Trade } from "@/lib/types";
import { TRADES } from "@/lib/types";

interface Props {
  item: ScopeItem;
  onUpdate: React.Dispatch<React.SetStateAction<ScopeItem[]>>;
  onMove?: (id: string, direction: "up" | "down") => void;
}

export function ScopeItemRow({ item, onUpdate, onMove }: Props) {
  const [editing, setEditing] = useState(false);
  const [itemText, setItemText] = useState(item.item_text);
  const [drawingRef, setDrawingRef] = useState(item.drawing_ref ?? "");
  const [notes, setNotes] = useState(item.notes ?? "");
  const [isFbo, setIsFbo] = useState(item.is_fbo);
  const [isByOthers, setIsByOthers] = useState(item.is_by_others);
  const [trade, setTrade] = useState<Trade>(item.trade);
  const supabase = createClient();

  const confidenceBadge = {
    high: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-red-100 text-red-800",
  }[item.ai_confidence];

  async function handleSave() {
    const updates = {
      item_text: itemText,
      drawing_ref: drawingRef || null,
      notes: notes || null,
      is_fbo: isFbo,
      is_by_others: isByOthers,
      trade,
    };

    await supabase.from("scope_items").update(updates).eq("id", item.id);

    onUpdate((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, ...updates } : i))
    );
    setEditing(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this scope item?")) return;
    await supabase.from("scope_items").delete().eq("id", item.id);
    onUpdate((prev) => prev.filter((i) => i.id !== item.id));
  }

  if (editing) {
    return (
      <tr className="bg-blue-50">
        <td className="px-4 py-2">
          <select
            value={trade}
            onChange={(e) => setTrade(e.target.value as Trade)}
            className="border rounded px-2 py-1 text-xs mb-1 capitalize w-full"
          >
            {TRADES.map((t) => (
              <option key={t} value={t}>{t.replace("_", " ")}</option>
            ))}
          </select>
          <textarea
            value={itemText}
            onChange={(e) => setItemText(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm"
            rows={2}
          />
        </td>
        <td className="px-4 py-2">
          <input
            value={drawingRef}
            onChange={(e) => setDrawingRef(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm"
            placeholder="E4.0"
          />
        </td>
        <td className="px-4 py-2">
          <input type="checkbox" checked={isFbo} onChange={(e) => setIsFbo(e.target.checked)} />
        </td>
        <td className="px-4 py-2">
          <input type="checkbox" checked={isByOthers} onChange={(e) => setIsByOthers(e.target.checked)} />
        </td>
        <td className="px-4 py-2" colSpan={2}>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm"
            placeholder="Notes..."
          />
        </td>
        <td className="px-4 py-2">
          <div className="flex gap-1">
            <button onClick={handleSave} className="text-xs px-2 py-1 bg-black text-white rounded">
              Save
            </button>
            <button onClick={() => setEditing(false)} className="text-xs px-2 py-1 border rounded">
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className={item.ai_confidence === "low" ? "bg-amber-50" : ""}>
      <td className="px-4 py-2">
        <div className="font-medium">{item.item_text}</div>
        {item.notes && <div className="text-xs text-gray-500 mt-1">{item.notes}</div>}
        {item.lead_time_flag && (
          <span className="inline-block text-xs bg-orange-100 text-orange-800 px-1.5 rounded mt-1">
            Lead Time
          </span>
        )}
      </td>
      <td className="px-4 py-2 text-gray-600">{item.drawing_ref ?? "—"}</td>
      <td className="px-4 py-2">{item.is_fbo ? "Yes" : "—"}</td>
      <td className="px-4 py-2">{item.is_by_others ? "Yes" : "—"}</td>
      <td className="px-4 py-2">
        <span className={`text-xs px-2 py-0.5 rounded ${confidenceBadge}`}>
          {item.ai_confidence}
        </span>
        {item.created_by_ai && (
          <span className="text-xs text-gray-400 ml-1">AI</span>
        )}
      </td>
      <td className="px-4 py-2">
        {item.published ? (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Published</span>
        ) : (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Draft</span>
        )}
      </td>
      <td className="px-4 py-2">
        <div className="flex gap-1 items-center">
          {onMove && (
            <>
              <button onClick={() => onMove(item.id, "up")} className="text-xs text-gray-400 hover:text-gray-700" title="Move up">^</button>
              <button onClick={() => onMove(item.id, "down")} className="text-xs text-gray-400 hover:text-gray-700" title="Move down">v</button>
            </>
          )}
          <button onClick={() => setEditing(true)} className="text-xs text-blue-600 hover:text-blue-800">
            Edit
          </button>
          <button onClick={handleDelete} className="text-xs text-red-600 hover:text-red-800">
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
