"use client";

import { useState } from "react";
import type { Invitation, Project, ScopeItem, BidDraft } from "@/lib/types";
import { SectionA } from "./SectionA";
import { SectionB } from "./SectionB";
import { SectionC } from "./SectionC";
import { SectionD } from "./SectionD";
import { SectionE } from "./SectionE";
import { SectionF } from "./SectionF";
import { SaveResumeButton } from "./SaveResumeButton";

interface Props {
  invitation: Invitation;
  project: Project;
  scopeItems: ScopeItem[];
  existingDraft: BidDraft | null;
}

export function SubForm({ invitation, project, scopeItems, existingDraft }: Props) {
  const [formState, setFormState] = useState<Record<string, unknown>>(
    existingDraft?.form_state ?? {
      company_name: invitation.company_name,
      contact_name: invitation.contact_name,
      contact_email: invitation.contact_email,
      contact_phone: invitation.contact_phone ?? "",
      il_license_number: invitation.il_license_number ?? "",
    }
  );
  const [submitted, setSubmitted] = useState(false);

  function updateField(key: string, value: unknown) {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formState, invitation_id: invitation.id }),
    });

    if (res.ok) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Bid Submitted</h1>
        <p className="text-gray-600">
          Your bid for {project.name} has been received. A confirmation email
          has been sent to {formState.contact_email as string}.
        </p>
      </div>
    );
  }

  const hasExclusions = (formState.scope_responses as { response: string }[] | undefined)?.some(
    (r) => r.response === "excluded" || r.response === "clarify"
  );

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="text-gray-600">{project.address}</p>
        <p className="text-sm text-gray-500 mt-1">
          Trade: <span className="capitalize font-medium">{invitation.trade.replace("_", " ")}</span>
        </p>
      </div>

      <div className="space-y-8">
        <SectionA formState={formState} updateField={updateField} trade={invitation.trade} />
        <SectionB scopeItems={scopeItems} formState={formState} updateField={updateField} />
        <SectionC formState={formState} updateField={updateField} trade={invitation.trade} />
        <SectionD formState={formState} updateField={updateField} />
        {hasExclusions && <SectionE formState={formState} updateField={updateField} />}
        <SectionF formState={formState} updateField={updateField} onSubmit={handleSubmit} />
      </div>

      <SaveResumeButton invitationId={invitation.id} formState={formState} />
    </div>
  );
}
