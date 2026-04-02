"use client";

import type { Invitation } from "@/lib/types";
import { InvitationRow } from "./InvitationRow";

interface Props {
  invitations: Invitation[];
  projectId: string;
}

export function InvitationsTab({ invitations, projectId: _projectId }: Props) {
  if (!invitations.length) {
    return <p className="text-sm text-gray-500">No invitations sent yet.</p>;
  }

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-2">Company</th>
            <th className="text-left px-4 py-2">Contact</th>
            <th className="text-left px-4 py-2">Trade</th>
            <th className="text-left px-4 py-2">Status</th>
            <th className="text-left px-4 py-2">Sent</th>
            <th className="w-32"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {invitations.map((inv) => (
            <InvitationRow key={inv.id} invitation={inv} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
