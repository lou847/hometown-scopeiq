"use client";

import { useState } from "react";
import type { Trade } from "@/lib/types";
import { getRatesForTrade } from "@/lib/idol-rates";
import { LaborRow, type LaborRowData } from "./LaborRow";

interface Props {
  formState: Record<string, unknown>;
  updateField: (key: string, value: unknown) => void;
  trade: Trade;
}

export function SectionC({ formState, updateField, trade }: Props) {
  const [isLumpSum, setIsLumpSum] = useState((formState.is_lump_sum as boolean) ?? false);
  const laborRows = (formState.labor_rows as LaborRowData[]) ?? [];
  const availableClassifications = getRatesForTrade(trade);

  function toggleLumpSum() {
    const next = !isLumpSum;
    setIsLumpSum(next);
    updateField("is_lump_sum", next);
  }

  function addRow() {
    const newRow: LaborRowData = {
      sort_order: laborRows.length,
      classification: "",
      worker_count: 1,
      hours_per_worker: 0,
      base_wage_entered: 0,
      fringe_entered: 0,
      idol_base_minimum: 0,
      idol_fringe_minimum: 0,
    };
    updateField("labor_rows", [...laborRows, newRow]);
  }

  function updateRow(index: number, row: LaborRowData) {
    const updated = [...laborRows];
    updated[index] = row;
    updateField("labor_rows", updated);
  }

  function removeRow(index: number) {
    updateField("labor_rows", laborRows.filter((_, i) => i !== index));
  }

  return (
    <section className="bg-white border rounded-lg p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-semibold">Section C — Labor Classification Detail</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isLumpSum} onChange={toggleLumpSum} />
          Submit as lump sum
        </label>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Add one row per worker classification. IDOL minimums are shown for reference.
      </p>

      {isLumpSum ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded">
          <p className="text-sm text-amber-800">
            Submissions without classification detail will be flagged as <strong>Incomplete — No Classification Data</strong> in the admin dashboard.
            Subs who provide full classification detail will receive priority consideration.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Total Labor $</label>
              <input
                type="number"
                value={(formState.lump_sum_labor as number) ?? ""}
                onChange={(e) => updateField("lump_sum_labor", parseFloat(e.target.value) || 0)}
                className="border rounded px-3 py-2 text-sm w-full"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Material $</label>
              <input
                type="number"
                value={(formState.lump_sum_material as number) ?? ""}
                onChange={(e) => updateField("lump_sum_material", parseFloat(e.target.value) || 0)}
                className="border rounded px-3 py-2 text-sm w-full"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">OH&P %</label>
              <input
                type="number"
                value={(formState.lump_sum_ohp_pct as number) ?? ""}
                onChange={(e) => updateField("lump_sum_ohp_pct", parseFloat(e.target.value) || 0)}
                className="border rounded px-3 py-2 text-sm w-full"
                step="0.1"
                placeholder="0.0"
              />
            </div>
          </div>
          {((formState.lump_sum_labor as number) > 0 || (formState.lump_sum_material as number) > 0) && (
            <div className="mt-3 pt-3 border-t border-amber-200 text-sm text-amber-900">
              <div className="flex justify-between">
                <span>Subtotal (Labor + Material):</span>
                <span className="font-medium">
                  ${(((formState.lump_sum_labor as number) || 0) + ((formState.lump_sum_material as number) || 0)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span>OH&P ({(formState.lump_sum_ohp_pct as number) || 0}%):</span>
                <span className="font-medium">
                  ${((((formState.lump_sum_labor as number) || 0) + ((formState.lump_sum_material as number) || 0)) * (((formState.lump_sum_ohp_pct as number) || 0) / 100)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between mt-1 font-semibold">
                <span>Total Bid:</span>
                <span>
                  ${((((formState.lump_sum_labor as number) || 0) + ((formState.lump_sum_material as number) || 0)) * (1 + (((formState.lump_sum_ohp_pct as number) || 0) / 100))).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="space-y-3">
            {laborRows.map((row, i) => (
              <LaborRow
                key={i}
                row={row}
                classifications={availableClassifications}
                onChange={(r) => updateRow(i, r)}
                onRemove={() => removeRow(i)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={addRow}
            className="mt-3 px-4 py-2 text-sm border rounded hover:bg-gray-50"
          >
            + Add Classification Row
          </button>
        </div>
      )}
    </section>
  );
}
