import type { ReferenceBid } from "@/lib/types";

interface Props {
  referenceBid: ReferenceBid;
}

export function ReferenceColumn({ referenceBid }: Props) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h3 className="text-lg font-semibold mb-1 text-gray-600">
        Reference Bid — {referenceBid.company_name}
      </h3>
      {referenceBid.total_bid_amount && (
        <p className="text-sm text-gray-500 mb-4">
          Total: ${referenceBid.total_bid_amount.toLocaleString()}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-semibold mb-2 text-green-700">Inclusions</h4>
          <ul className="text-sm space-y-1">
            {referenceBid.inclusions.map((inc, i) => (
              <li key={i} className="text-gray-700">
                {inc.item}
                {inc.drawing_ref && (
                  <span className="text-xs text-gray-400 ml-1">({inc.drawing_ref})</span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-2 text-red-700">Exclusions</h4>
          <ul className="text-sm space-y-1">
            {referenceBid.exclusions.map((exc, i) => (
              <li key={i} className="text-gray-700">
                {exc.item}
                {exc.note && (
                  <span className="text-xs text-gray-400 ml-1">— {exc.note}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
