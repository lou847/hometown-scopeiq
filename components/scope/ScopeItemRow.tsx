"use client";

import type { ScopeItem } from "@/lib/types";

interface Props {
  item: ScopeItem;
  onUpdate: React.Dispatch<React.SetStateAction<ScopeItem[]>>;
}

export function ScopeItemRow({ item, onUpdate: _onUpdate }: Props) {
  const confidenceBadge = {
    high: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-red-100 text-red-800",
  }[item.ai_confidence];

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
        {/* TODO: Edit / Delete actions */}
      </td>
    </tr>
  );
}
