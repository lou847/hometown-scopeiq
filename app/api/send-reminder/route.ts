import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendReminderEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { invitation_id } = await req.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: invitation } = await supabase
    .from("invitations")
    .select("*, projects(*)")
    .eq("id", invitation_id)
    .single();

  if (!invitation) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });

  const formUrl = `${process.env.NEXT_PUBLIC_APP_URL}/submit/${invitation.token}`;

  await sendReminderEmail({
    to: invitation.contact_email,
    contactName: invitation.contact_name,
    projectName: invitation.projects.name,
    trade: invitation.trade,
    bidDueDate: invitation.token_expires_at,
    formUrl,
  });

  await supabase
    .from("invitations")
    .update({ reminder_sent_at: new Date().toISOString() })
    .eq("id", invitation_id);

  return NextResponse.json({ success: true });
}
