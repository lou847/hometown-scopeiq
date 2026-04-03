"use client";

import { useState } from "react";
import type { Invitation } from "@/lib/types";
import { InvitationRow } from "./InvitationRow";
import { InviteSubModal } from "./InviteSubModal";

interface Props {
  invitations: Invitation[];
  projectId: string;
}

export function InvitationsTab({ invitations, projectId }: Props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">
          {invitations.length} invitation{invitations.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800"
        >
          + Invite Sub
        </button>
      </div>

      {invitations.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center border rounded-lg bg-white">
          No invitations sent yet. Publish scope first, then invite subs.
        </p>
      ) : (
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
      )}

      {showModal && (
        <InviteSubModal projectId={projectId} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
