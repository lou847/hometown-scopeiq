"use client";

import type { ScopeItem, ScopeResponse } from "@/lib/types";

interface ScopeResponseEntry {
  scope_item_id: string;
  response: ScopeResponse;
  note: string | null;
}

interface Props {
  scopeItems: ScopeItem[];
  formState: Record<string, unknown>;
  updateField: (key: string, value: unknown) => void;
}

export function SectionB({ scopeItems, formState, updateField }: Props) {
  const responses = (formState.scope_responses as ScopeResponseEntry[]) ?? [];

  function getResponse(itemId: string) {
    return responses.find((r) => r.scope_item_id === itemId);
  }

  function setResponse(itemId: string, response: ScopeResponse) {
    const existing = responses.filter((r) => r.scope_item_id !== itemId);
    updateField("scope_responses", [
      ...existing,
      { scope_item_id: itemId, response, note: getResponse(itemId)?.note ?? null },
    ]);
  }

  function setNote(itemId: string, note: string) {
    const updated = responses.map((r) =>
      r.scope_item_id === itemId ? { ...r, note } : r
    );
    updateField("scope_responses", updated);
  }

  const unanswered = scopeItems.filter((item) => !getResponse(item.id));

  return (
    <section className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-1">Section B — Scope Confirmation</h2>
      <p className="text-sm text-gray-500 mb-4">
        Confirm each scope item. All items must be responded to before submission.
        {unanswered.length > 0 && (
          <span className="text-red-600 ml-1">({unanswered.length} remaining)</span>
        )}
      </p>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-2">Scope Item</th>
              <th className="text-center px-2 py-2 w-24">Included</th>
              <th className="text-center px-2 py-2 w-24">Excluded</th>
              <th className="text-center px-2 py-2 w-24">Clarify</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {scopeItems.map((item) => {
              const resp = getResponse(item.id);
              const needsNote = resp && (resp.response === "excluded" || resp.response === "clarify");
              const isLocked = item.is_by_others;

              return (
                <tr key={item.id} className={isLocked ? "bg-gray-50" : ""}>
                  <td className="px-4 py-3">
                    <div>{item.item_text}</div>
                    {item.drawing_ref && (
                      <div className="text-xs text-gray-400">Ref: {item.drawing_ref}</div>
                    )}
                    {item.notes && (
                      <div className="text-xs text-gray-500 mt-1">{item.notes}</div>
                    )}
                    {item.is_fbo && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1.5 rounded">FBO</span>
                    )}
                    {needsNote && (
                      <textarea
                        placeholder="Note required..."
                        value={resp?.note ?? ""}
                        onChange={(e) => setNote(item.id, e.target.value)}
                        className="mt-2 w-full border rounded px-2 py-1 text-sm"
                        rows={2}
                        required
                      />
                    )}
                  </td>
                  <td className="text-center px-2">
                    <input
                      type="radio"
                      name={`scope-${item.id}`}
                      checked={isLocked ? false : resp?.response === "included"}
                      onChange={() => setResponse(item.id, "included")}
                      disabled={isLocked}
                    />
                  </td>
                  <td className="text-center px-2">
                    <input
                      type="radio"
                      name={`scope-${item.id}`}
                      checked={isLocked ? true : resp?.response === "excluded"}
                      onChange={() => setResponse(item.id, "excluded")}
                      disabled={isLocked}
                    />
                  </td>
                  <td className="text-center px-2">
                    <input
                      type="radio"
                      name={`scope-${item.id}`}
                      checked={resp?.response === "clarify"}
                      onChange={() => setResponse(item.id, "clarify")}
                      disabled={isLocked}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
