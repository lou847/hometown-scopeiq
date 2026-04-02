"use client";

import { useState } from "react";

interface Props {
  invitationId: string;
  formState: Record<string, unknown>;
}

export function SaveResumeButton({ invitationId, formState }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/submit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitation_id: invitationId,
          form_state: formState,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6">
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-3 bg-white border-2 border-black rounded-lg shadow-lg hover:bg-gray-50 font-medium text-sm disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save Progress"}
      </button>
    </div>
  );
}
