import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendInvitationEmail } from "@/lib/email";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    project_id, company_name, contact_name, contact_email,
    contact_phone, trade, il_license_number, bid_due_date,
  } = body;

  // Fetch project
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", project_id)
    .single();

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const token = uuid();
  const tokenExpiresAt = new Date();
  tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 30); // 30 day expiry

  const invitation = {
    id: uuid(),
    project_id,
    company_name,
    contact_name,
    contact_email,
    contact_phone: contact_phone || null,
    trade,
    il_license_number: il_license_number || null,
    token,
    token_expires_at: tokenExpiresAt.toISOString(),
    invitation_sent_at: new Date().toISOString(),
    status: "not_started" as const,
    created_by: user.id,
  };

  await supabase.from("invitations").insert(invitation);

  const formUrl = `${process.env.NEXT_PUBLIC_APP_URL}/submit/${token}`;

  await sendInvitationEmail({
    to: contact_email,
    contactName: contact_name,
    companyName: company_name,
    projectName: project.name,
    projectAddress: project.address,
    trade,
    bidDueDate: bid_due_date,
    formUrl,
  });

  return NextResponse.json({ invitation_id: invitation.id, token });
}
