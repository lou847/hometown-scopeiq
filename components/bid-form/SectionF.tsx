"use client";

interface Props {
  formState: Record<string, unknown>;
  updateField: (key: string, value: unknown) => void;
  onSubmit: () => void;
}

export function SectionF({ formState, updateField, onSubmit }: Props) {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-1">Section F — Certification</h2>
      <p className="text-sm text-gray-500 mb-4">
        By signing below, you certify the accuracy of this submission.
      </p>

      <div className="p-4 bg-gray-50 rounded border text-sm text-gray-700 mb-4">
        I certify that all labor classifications, wage rates, and fringe benefits listed
        in this bid are accurate and comply with the Illinois Prevailing Wage Act for
        Cook County. I understand that misrepresentation of labor classifications or
        rates may result in bid disqualification and potential legal action.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Typed Signature *</label>
          <input
            type="text"
            value={(formState.signatory_name as string) ?? ""}
            onChange={(e) => updateField("signatory_name", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            type="text"
            value={(formState.signatory_title as string) ?? ""}
            onChange={(e) => updateField("signatory_title", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <p className="px-3 py-2 text-sm bg-gray-100 rounded">{today}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        className="mt-6 w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition"
      >
        Submit Bid
      </button>
    </section>
  );
}
