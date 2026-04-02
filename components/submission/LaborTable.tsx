interface LaborRow {
  classification: string;
  base_wage_entered: number;
  fringe_entered: number;
  idol_base_minimum: number;
  idol_fringe_minimum: number;
  below_minimum: boolean;
  variance: number;
  row_total: number;
  worker_count: number;
  hours_per_worker: number;
}

interface Props {
  laborRows: LaborRow[];
}

export function LaborTable({ laborRows }: Props) {
  return (
    <section className="border rounded-lg bg-white overflow-hidden">
      <h2 className="font-semibold p-4 pb-0">Labor Classification Detail</h2>
      <table className="w-full text-sm mt-3">
        <thead className="bg-gray-50 border-y">
          <tr>
            <th className="text-left px-4 py-2">Classification</th>
            <th className="text-center px-2 py-2">Workers</th>
            <th className="text-center px-2 py-2">Hrs/Wkr</th>
            <th className="text-right px-2 py-2">Base $/hr</th>
            <th className="text-right px-2 py-2">Fringe $/hr</th>
            <th className="text-right px-2 py-2">IDOL Min</th>
            <th className="text-center px-2 py-2">Status</th>
            <th className="text-right px-4 py-2">Row Total</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {laborRows.map((row, i) => {
            const totalEntered = row.base_wage_entered + row.fringe_entered;
            const idolTotal = row.idol_base_minimum + row.idol_fringe_minimum;
            return (
              <tr key={i} className={row.below_minimum ? "bg-red-50" : ""}>
                <td className="px-4 py-2 font-medium">{row.classification}</td>
                <td className="text-center px-2 py-2">{row.worker_count}</td>
                <td className="text-center px-2 py-2">{row.hours_per_worker}</td>
                <td className="text-right px-2 py-2">${row.base_wage_entered.toFixed(2)}</td>
                <td className="text-right px-2 py-2">${row.fringe_entered.toFixed(2)}</td>
                <td className="text-right px-2 py-2 text-gray-500">${idolTotal.toFixed(2)}</td>
                <td className="text-center px-2 py-2">
                  {row.below_minimum ? (
                    <span className="text-red-600 font-bold" title={`$${Math.abs(row.variance).toFixed(2)}/hr below`}>
                      ⚠ ${Math.abs(row.variance).toFixed(2)}/hr below
                    </span>
                  ) : totalEntered > idolTotal * 1.15 ? (
                    <span className="text-amber-600">↑</span>
                  ) : (
                    <span className="text-green-600">✓</span>
                  )}
                </td>
                <td className="text-right px-4 py-2 font-medium">
                  ${row.row_total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
