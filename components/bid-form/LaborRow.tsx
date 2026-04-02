"use client";

import { isBelowMinimum, getRateForClassification } from "@/lib/idol-rates";

export interface LaborRowData {
  sort_order: number;
  classification: string;
  worker_count: number;
  hours_per_worker: number;
  base_wage_entered: number;
  fringe_entered: number;
  idol_base_minimum: number;
  idol_fringe_minimum: number;
}

interface Props {
  row: LaborRowData;
  classifications: { classification: string; base_wage: number; fringe: number }[];
  onChange: (row: LaborRowData) => void;
  onRemove: () => void;
}

export function LaborRow({ row, classifications, onChange, onRemove }: Props) {
  function handleClassificationChange(classification: string) {
    const rate = getRateForClassification(classification);
    onChange({
      ...row,
      classification,
      idol_base_minimum: rate?.base_wage ?? 0,
      idol_fringe_minimum: rate?.fringe ?? 0,
    });
  }

  const totalEntered = row.base_wage_entered + row.fringe_entered;
  const idolTotal = row.idol_base_minimum + row.idol_fringe_minimum;
  const belowMin = row.classification
    ? isBelowMinimum(row.base_wage_entered, row.fringe_entered, row.idol_base_minimum, row.idol_fringe_minimum)
    : false;
  const aboveThreshold = totalEntered > idolTotal * 1.15;
  const isApprentice = row.classification.toLowerCase().includes("apprentice");

  let statusIcon = "";
  let statusClass = "";
  if (row.classification && totalEntered > 0) {
    if (belowMin) { statusIcon = "⚠"; statusClass = "text-red-600"; }
    else if (aboveThreshold) { statusIcon = "↑"; statusClass = "text-amber-600"; }
    else { statusIcon = "✓"; statusClass = "text-green-600"; }
  }

  const rowTotal = totalEntered * row.hours_per_worker * row.worker_count;

  return (
    <div className={`border rounded p-3 ${belowMin ? "border-red-300 bg-red-50" : ""}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="col-span-2">
          <label className="block text-xs font-medium mb-1">Classification</label>
          <select
            value={row.classification}
            onChange={(e) => handleClassificationChange(e.target.value)}
            className="w-full border rounded px-2 py-1.5 text-sm"
          >
            <option value="">Select classification...</option>
            {classifications.map((c) => (
              <option key={c.classification} value={c.classification}>
                {c.classification}
              </option>
            ))}
          </select>
          {isApprentice && (
            <p className="text-xs text-amber-600 mt-1">
              IDOL minimum shown is journeyman reference — verify apprentice rate with your union local
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Workers</label>
          <input
            type="number"
            min={1}
            value={row.worker_count}
            onChange={(e) => onChange({ ...row, worker_count: parseInt(e.target.value) || 0 })}
            className="w-full border rounded px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Hours / Worker</label>
          <input
            type="number"
            min={0}
            value={row.hours_per_worker}
            onChange={(e) => onChange({ ...row, hours_per_worker: parseFloat(e.target.value) || 0 })}
            className="w-full border rounded px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Base Wage $/hr</label>
          <input
            type="number"
            step="0.01"
            value={row.base_wage_entered || ""}
            onChange={(e) => onChange({ ...row, base_wage_entered: parseFloat(e.target.value) || 0 })}
            className="w-full border rounded px-2 py-1.5 text-sm"
          />
          {row.idol_base_minimum > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">IDOL min: ${row.idol_base_minimum.toFixed(2)}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Fringe $/hr</label>
          <input
            type="number"
            step="0.01"
            value={row.fringe_entered || ""}
            onChange={(e) => onChange({ ...row, fringe_entered: parseFloat(e.target.value) || 0 })}
            className="w-full border rounded px-2 py-1.5 text-sm"
          />
          {row.idol_fringe_minimum > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">IDOL min: ${row.idol_fringe_minimum.toFixed(2)}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Status</label>
          <span className={`text-lg ${statusClass}`}>{statusIcon}</span>
          {belowMin && (
            <p className="text-xs text-red-600">
              ${(idolTotal - totalEntered).toFixed(2)}/hr below minimum
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Row Total</label>
          <p className="font-medium">${rowTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
        </div>
      </div>
      <div className="mt-2 text-right">
        <button onClick={onRemove} className="text-xs text-red-600 hover:text-red-800">
          Remove
        </button>
      </div>
    </div>
  );
}
