"use client";

interface Props {
  formState: Record<string, unknown>;
  updateField: (key: string, value: unknown) => void;
}

export function SectionE({ formState, updateField }: Props) {
  return (
    <section className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-1">Section E — Exclusions &amp; Lead Times</h2>
      <p className="text-sm text-gray-500 mb-4">
        Provide additional detail on excluded items and lead times.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Lead Time Items</label>
          <textarea
            value={(formState.lead_time_notes as string) ?? ""}
            onChange={(e) => updateField("lead_time_notes", e.target.value)}
            placeholder="List items with lead times: description, weeks required, schedule impact..."
            className="w-full border rounded px-3 py-2 text-sm"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">General Exclusions</label>
          <textarea
            value={(formState.exclusions_notes as string) ?? ""}
            onChange={(e) => updateField("exclusions_notes", e.target.value)}
            placeholder="Additional items not in scope confirmation that are excluded from your bid..."
            className="w-full border rounded px-3 py-2 text-sm"
            rows={4}
          />
        </div>
      </div>
    </section>
  );
}
