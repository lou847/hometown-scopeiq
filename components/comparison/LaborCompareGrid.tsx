"use client";

interface LaborRow {
  classification: string;
  base_wage_entered: number;
  fringe_entered: number;
  idol_base_minimum: number;
  idol_fringe_minimum: number;
  below_minimum: boolean;
  variance: number;
  row_total: number;
}

interface Submission {
  id: string;
  company_name: string;
  bid_labor_rows: LaborRow[];
}

interface Props {
  submissions: Submission[];
}

export function LaborCompareGrid({ submissions }: Props) {
  // Collect all unique classifications across submissions
  const allClassifications = [
    ...new Set(submissions.flatMap((s) => s.bid_labor_rows.map((r) => r.classification))),
  ];

  if (!allClassifications.length) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Labor Classification Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2 w-64">Classification</th>
              <th className="text-center px-4 py-2 w-28">IDOL Min</th>
              {submissions.map((s) => (
                <th key={s.id} className="text-center px-4 py-2">{s.company_name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {allClassifications.map((cls) => {
              const rows = submissions.map((s) =>
                s.bid_labor_rows.find((r) => r.classification === cls)
              );
              const idolMin = rows.find((r) => r)
                ? (rows.find((r) => r)!.idol_base_minimum + rows.find((r) => r)!.idol_fringe_minimum)
                : 0;

              return (
                <tr key={cls}>
                  <td className="px-4 py-2 font-medium">{cls}</td>
                  <td className="text-center px-4 py-2 text-gray-500">
                    ${idolMin.toFixed(2)}
                  </td>
                  {rows.map((row, i) => {
                    if (!row) return <td key={submissions[i].id} className="text-center px-4 py-2">—</td>;
                    const total = row.base_wage_entered + row.fringe_entered;
                    const aboveThreshold = total > idolMin * 1.15;
                    return (
                      <td
                        key={submissions[i].id}
                        className={`text-center px-4 py-2 ${
                          row.below_minimum
                            ? "bg-red-100 text-red-800 font-medium"
                            : aboveThreshold
                            ? "bg-amber-50 text-amber-800"
                            : ""
                        }`}
                      >
                        ${total.toFixed(2)}
                        {row.below_minimum && (
                          <div className="text-xs">${row.variance.toFixed(2)}/hr</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
