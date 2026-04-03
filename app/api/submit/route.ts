import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendSubmissionConfirmation, sendAdminNotification, sendDraftSavedEmail } from "@/lib/email";
import { v4 as uuid } from "uuid";
import { isBelowMinimum } from "@/lib/idol-rates";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();

  const {
    invitation_id,
    // Section A
    company_name, il_license_number, contact_name, contact_email, contact_phone,
    workers_comp_policy, gl_carrier_policy,
    // Section B
    scope_responses,
    // Section C
    labor_rows,
    is_lump_sum, lump_sum_total,
    // Section D
    total_labor, total_material, ohp_pct, pw_labor_total, non_pw_labor_total,
    // Section E
    exclusions_notes, lead_time_notes,
    // Section F
    signatory_name, signatory_title,
  } = body;

  // Validate invitation
  const { data: invitation } = await supabase
    .from("invitations")
    .select("*, projects(*)")
    .eq("id", invitation_id)
    .single();

  if (!invitation) {
    return NextResponse.json({ error: "Invalid invitation" }, { status: 400 });
  }

  // Compute flags
  const processedLabor = (labor_rows ?? []).map((row: {
    classification: string; worker_count: number; hours_per_worker: number;
    base_wage_entered: number; fringe_entered: number;
    idol_base_minimum: number; idol_fringe_minimum: number; sort_order: number;
  }) => {
    const totalEntered = row.base_wage_entered + row.fringe_entered;
    const idolTotal = row.idol_base_minimum + row.idol_fringe_minimum;
    const belowMin = isBelowMinimum(
      row.base_wage_entered, row.fringe_entered,
      row.idol_base_minimum, row.idol_fringe_minimum
    );
    return {
      id: uuid(),
      submission_id: "", // filled below
      sort_order: row.sort_order,
      classification: row.classification,
      worker_count: row.worker_count,
      hours_per_worker: row.hours_per_worker,
      base_wage_entered: row.base_wage_entered,
      fringe_entered: row.fringe_entered,
      idol_base_minimum: row.idol_base_minimum,
      idol_fringe_minimum: row.idol_fringe_minimum,
      total_entered_rate: totalEntered,
      idol_total_minimum: idolTotal,
      below_minimum: belowMin,
      variance: totalEntered - idolTotal,
      row_total: totalEntered * row.hours_per_worker * row.worker_count,
    };
  });

  const flaggedRowCount = processedLabor.filter((r: { below_minimum: boolean }) => r.below_minimum).length;
  const scopeGapCount = (scope_responses ?? []).filter(
    (r: { response: string }) => r.response === "excluded" || r.response === "clarify"
  ).length;

  const submissionId = uuid();

  // Insert submission
  await supabase.from("bid_submissions").insert({
    id: submissionId,
    project_id: invitation.project_id,
    invitation_id,
    company_name,
    il_license_number,
    contact_name,
    contact_email,
    contact_phone,
    trade: invitation.trade,
    workers_comp_policy,
    gl_carrier_policy,
    total_labor: total_labor ?? 0,
    total_material: total_material ?? 0,
    ohp_pct: ohp_pct ?? 0,
    pw_labor_total: pw_labor_total ?? 0,
    non_pw_labor_total: non_pw_labor_total ?? 0,
    is_lump_sum: is_lump_sum ?? false,
    lump_sum_total,
    exclusions_notes,
    lead_time_notes,
    signatory_name,
    signatory_title,
    signed_date: new Date().toISOString().split("T")[0],
    flagged_row_count: flaggedRowCount,
    scope_gap_count: scopeGapCount,
  });

  // Insert scope responses
  if (scope_responses?.length) {
    await supabase.from("bid_scope_responses").insert(
      scope_responses.map((r: { scope_item_id: string; response: string; note: string | null }) => ({
        id: uuid(),
        submission_id: submissionId,
        scope_item_id: r.scope_item_id,
        response: r.response,
        note: r.note,
      }))
    );
  }

  // Insert labor rows
  if (processedLabor.length) {
    await supabase.from("bid_labor_rows").insert(
      processedLabor.map((r: { id: string; sort_order: number; classification: string; worker_count: number; hours_per_worker: number; base_wage_entered: number; fringe_entered: number; idol_base_minimum: number; idol_fringe_minimum: number; total_entered_rate: number; idol_total_minimum: number; below_minimum: boolean; variance: number; row_total: number }) => ({ ...r, submission_id: submissionId }))
    );
  }

  // Update invitation status
  const status = is_lump_sum ? "submitted_incomplete" : "submitted";
  await supabase
    .from("invitations")
    .update({ submission_id: submissionId, status })
    .eq("id", invitation_id);

  // Delete draft if exists
  await supabase.from("bid_drafts").delete().eq("invitation_id", invitation_id);

  // Send emails
  const project = invitation.projects;
  await sendSubmissionConfirmation({
    to: contact_email,
    contactName: contact_name,
    companyName: company_name,
    projectName: project.name,
    trade: invitation.trade,
  });

  const { data: recipients } = await supabase
    .from("notification_recipients")
    .select("email")
    .eq("project_id", invitation.project_id);

  if (recipients?.length) {
    await sendAdminNotification({
      recipients: recipients.map((r) => r.email),
      companyName: company_name,
      projectName: project.name,
      trade: invitation.trade,
    });
  }

  return NextResponse.json({ submission_id: submissionId });
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const { invitation_id, form_state } = await req.json();

  if (!invitation_id || !form_state) {
    return NextResponse.json({ error: "Missing invitation_id or form_state" }, { status: 400 });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await supabase.from("bid_drafts").upsert(
    {
      invitation_id,
      form_state,
      last_saved_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    },
    { onConflict: "invitation_id" }
  );

  // Update invitation status to in_progress if not already submitted
  await supabase
    .from("invitations")
    .update({ status: "in_progress", draft_started_at: new Date().toISOString() })
    .eq("id", invitation_id)
    .in("status", ["not_started", "link_opened"]);

  // Send magic link email if contact_email is in form_state
  const contactEmail = form_state.contact_email as string | undefined;
  const contactName = form_state.contact_name as string | undefined;
  if (contactEmail) {
    const { data: invitation } = await supabase
      .from("invitations")
      .select("token, trade, projects(name)")
      .eq("id", invitation_id)
      .single();

    if (invitation) {
      const formUrl = `${process.env.NEXT_PUBLIC_APP_URL}/submit/${invitation.token}`;
      await sendDraftSavedEmail({
        to: contactEmail,
        contactName: contactName ?? "Contractor",
        projectName: invitation.projects?.name ?? "Project",
        trade: invitation.trade,
        formUrl,
      }).catch(() => {}); // Don't fail save if email fails
    }
  }

  return NextResponse.json({ saved: true });
}
