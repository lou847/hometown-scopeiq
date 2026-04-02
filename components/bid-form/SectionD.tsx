"use client";

import type { LaborRowData } from "./LaborRow";

interface Props {
  formState: Record<string, unknown>;
  updateField: (key: string, value: unknown) => void;
}

export function SectionD({ formState, updateField }: Props) {
  const laborRows = (formState.labor_rows as LaborRowData[]) ?? [];
  const isLumpSum = (formState.is_lump_sum as boolean) ?? false;

  const totalLabor = isLumpSum
    ? 0
    : laborRows.reduce(
        (sum, r) =>
          sum + (r.base_wage_entered + r.fringe_entered) * r.hours_per_worker * r.worker_count,
        0
      );

  const totalMaterial = (formState.total_material as number) ?? 0;
  const ohpPct = (formState.ohp_pct as number) ?? 0;
  const ohpAmount = (totalLabor + totalMaterial) * (ohpPct / 100);
  const totalBid = isLumpSum
    ? ((formState.lump_sum_total as number) ?? 0) + totalMaterial + ohpAmount
    : totalLabor + totalMaterial + ohpAmount;

  const pwLaborTotal = (formState.pw_labor_total as number) ?? totalLabor;
  const nonPwLabor = totalLabor - pwLaborTotal;

  return (
    <section className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-1">Section D — Bid Summary</h2>
      <p className="text-sm text-gray-500 mb-4">Review your totals.</p>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block text-xs font-medium mb-1">Total Labor $</label>
          <p className="font-medium text-lg">
            {isLumpSum ? "Lump Sum" : `$${totalLabor.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Total Material $</label>
          <input
            type="number"
            step="0.01"
            value={totalMaterial || ""}
            onChange={(e) => updateField("total_material", parseFloat(e.target.value) || 0)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">OH&P % *</label>
          <input
            type="number"
            step="0.1"
            value={ohpPct || ""}
            onChange={(e) => updateField("ohp_pct", parseFloat(e.target.value) || 0)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">OH&P Amount</label>
          <p className="font-medium">${ohpAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">PW Labor Total $</label>
          <input
            type="number"
            step="0.01"
            value={pwLaborTotal || ""}
            onChange={(e) => updateField("pw_labor_total", parseFloat(e.target.value) || 0)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Non-PW Labor Total $</label>
          <p className="font-medium">${nonPwLabor.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Total Bid</p>
        <p className="text-3xl font-bold">${totalBid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
      </div>
    </section>
  );
}
