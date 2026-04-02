"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { NotificationRecipient } from "@/lib/types";

export default function SettingsPage() {
  const [recipients, setRecipients] = useState<NotificationRecipient[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const supabase = createClient();

  useEffect(() => {
    loadRecipients();
  }, []);

  async function loadRecipients() {
    const { data } = await supabase
      .from("notification_recipients")
      .select("*")
      .order("created_at");
    if (data) setRecipients(data);
  }

  async function addRecipient(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail) return;

    await supabase.from("notification_recipients").insert({
      email: newEmail,
      name: newName || null,
      project_id: null, // global recipient
    });

    setNewEmail("");
    setNewName("");
    loadRecipients();
  }

  async function removeRecipient(id: string) {
    await supabase.from("notification_recipients").delete().eq("id", id);
    loadRecipients();
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <section>
        <h2 className="text-xl font-semibold mb-4">Notification Recipients</h2>
        <p className="text-sm text-gray-600 mb-4">
          These people receive an email when a new bid is submitted.
        </p>

        <form onSubmit={addRecipient} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Name (optional)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            type="email"
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            className="border rounded px-3 py-2 text-sm flex-1"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800"
          >
            Add
          </button>
        </form>

        <div className="border rounded-lg divide-y">
          {recipients.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3">
              <div>
                {r.name && <span className="font-medium mr-2">{r.name}</span>}
                <span className="text-gray-600">{r.email}</span>
              </div>
              <button
                onClick={() => removeRecipient(r.id)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          {recipients.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-500">No recipients added yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
