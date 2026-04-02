"use client";

import type { Invitation } from "@/lib/types";

interface Props {
  invitation: Invitation;
}

const STATUS_STYLES: Record<string, string> = {
  not_started: "bg-gray-100 text-gray-600",
  link_opened: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  submitted: "bg-green-100 text-green-800",
  submitted_incomplete: "bg-amber-100 text-amber-800",
};

export function InvitationRow({ invitation }: Props) {
  async function sendReminder() {
    await fetch("/api/send-reminder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitation_id: invitation.id }),
    });
    window.location.reload();
  }

  const canRemind = !["submitted", "submitted_incomplete"].includes(invitation.status);

  return (
    <tr>
      <td className="px-4 py-2 font-medium">{invitation.company_name}</td>
      <td className="px-4 py-2">
        <div>{invitation.contact_name}</div>
        <div className="text-xs text-gray-400">{invitation.contact_email}</div>
      </td>
      <td className="px-4 py-2 capitalize">{invitation.trade.replace("_", " ")}</td>
      <td className="px-4 py-2">
        <span className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLES[invitation.status] ?? ""}`}>
          {invitation.status.replace(/_/g, " ")}
        </span>
      </td>
      <td className="px-4 py-2 text-gray-500">
        {new Date(invitation.invitation_sent_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-2">
        {canRemind && (
          <button
            onClick={sendReminder}
            className="text-xs px-3 py-1 border rounded hover:bg-gray-50"
          >
            Send Reminder
          </button>
        )}
      </td>
    </tr>
  );
}
