"use client";

import type { ScopeItem } from "@/lib/types";

interface Submission {
  id: string;
  company_name: string;
  bid_scope_responses: { scope_item_id: string; response: string; note: string | null }[];
}

interface Props {
  scopeItems: ScopeItem[];
  submissions: Submission[];
}

export function ScopeCompareGrid({ scopeItems, submissions }: Props) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Scope Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2 w-64">Scope Item</th>
              {submissions.map((s) => (
                <th key={s.id} className="text-center px-4 py-2">{s.company_name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {scopeItems.map((item) => {
              const responses = submissions.map((s) =>
                s.bid_scope_responses.find((r) => r.scope_item_id === item.id)
              );
              const hasGap = responses.some((r) => r?.response === "excluded") &&
                responses.some((r) => r?.response === "included");

              return (
                <tr key={item.id} className={hasGap ? "bg-amber-50" : ""}>
                  <td className="px-4 py-2">
                    <div className="font-medium">{item.item_text}</div>
                    {item.drawing_ref && (
                      <div className="text-xs text-gray-400">{item.drawing_ref}</div>
                    )}
                  </td>
                  {responses.map((resp, i) => (
                    <td
                      key={submissions[i].id}
                      className={`text-center px-4 py-2 ${
                        resp?.response === "excluded" && hasGap
                          ? "bg-amber-100 text-amber-800 font-medium"
                          : resp?.response === "excluded"
                          ? "text-red-600"
                          : resp?.response === "clarify"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {resp?.response === "included" && "Included"}
                      {resp?.response === "excluded" && "Excluded"}
                      {resp?.response === "clarify" && "Clarify"}
                      {!resp && "—"}
                      {resp?.note && (
                        <div className="text-xs mt-1 text-gray-500">{resp.note}</div>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
