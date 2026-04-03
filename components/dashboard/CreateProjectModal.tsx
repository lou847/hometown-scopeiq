"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  onClose: () => void;
}

export function CreateProjectModal({ onClose }: Props) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [gcName, setGcName] = useState("");
  const [pwRequired, setPwRequired] = useState(true);
  const [pwCounty, setPwCounty] = useState("Cook");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    await supabase.from("projects").insert({
      name,
      address,
      gc_name: gcName,
      slug,
      pw_required: pwRequired,
      pw_county: pwCounty,
    });

    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Hometown Coffee – Bloomingdale"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address *</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="123 Main St, Bloomingdale, IL 60108"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">General Contractor *</label>
            <input
              value={gcName}
              onChange={(e) => setGcName(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="CoreBuilt Contracting"
              required
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={pwRequired}
                onChange={(e) => setPwRequired(e.target.checked)}
              />
              Prevailing Wage Required
            </label>
            {pwRequired && (
              <div>
                <select
                  value={pwCounty}
                  onChange={(e) => setPwCounty(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="Cook">Cook County</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50">
              {saving ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
