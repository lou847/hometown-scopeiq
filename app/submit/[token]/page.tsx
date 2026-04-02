import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { SubForm } from "@/components/bid-form/SubForm";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function SubmitPage({ params }: Props) {
  const { token } = await params;
  const supabase = await createClient();

  // Look up invitation by token
  const { data: invitation } = await supabase
    .from("invitations")
    .select("*, projects(*)")
    .eq("token", token)
    .single();

  if (!invitation) return notFound();

  // Mark link as opened if first time
  if (!invitation.link_opened_at) {
    await supabase
      .from("invitations")
      .update({ link_opened_at: new Date().toISOString(), status: "link_opened" })
      .eq("id", invitation.id);
  }

  // Fetch published scope items for this trade
  const { data: scopeItems } = await supabase
    .from("scope_items")
    .select("*")
    .eq("project_id", invitation.project_id)
    .eq("trade", invitation.trade)
    .eq("published", true)
    .order("sort_order");

  // Check for existing draft
  const { data: draft } = await supabase
    .from("bid_drafts")
    .select("*")
    .eq("invitation_id", invitation.id)
    .single();

  return (
    <main className="min-h-screen bg-gray-50">
      <SubForm
        invitation={invitation}
        project={invitation.projects}
        scopeItems={scopeItems ?? []}
        existingDraft={draft}
      />
    </main>
  );
}
