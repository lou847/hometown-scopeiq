"use client";

import type { Trade } from "@/lib/types";

interface Props {
  formState: Record<string, unknown>;
  updateField: (key: string, value: unknown) => void;
  trade: Trade;
}

export function SectionA({ formState, updateField, trade }: Props) {
  return (
    <section className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-1">Section A — Contractor Confirmation</h2>
      <p className="text-sm text-gray-500 mb-4">Confirm or correct your company information.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Company Name *</label>
          <input
            type="text"
            value={(formState.company_name as string) ?? ""}
            onChange={(e) => updateField("company_name", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">IL License Number</label>
          <input
            type="text"
            value={(formState.il_license_number as string) ?? ""}
            onChange={(e) => updateField("il_license_number", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contact Name *</label>
          <input
            type="text"
            value={(formState.contact_name as string) ?? ""}
            onChange={(e) => updateField("contact_name", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            value={(formState.contact_email as string) ?? ""}
            onChange={(e) => updateField("contact_email", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            value={(formState.contact_phone as string) ?? ""}
            onChange={(e) => updateField("contact_phone", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Trade</label>
          <input
            type="text"
            value={trade.replace("_", " ")}
            className="w-full border rounded px-3 py-2 text-sm bg-gray-50 capitalize"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Workers&apos; Comp Policy #</label>
          <input
            type="text"
            value={(formState.workers_comp_policy as string) ?? ""}
            onChange={(e) => updateField("workers_comp_policy", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">GL Carrier &amp; Policy #</label>
          <input
            type="text"
            value={(formState.gl_carrier_policy as string) ?? ""}
            onChange={(e) => updateField("gl_carrier_policy", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
      </div>
    </section>
  );
}
