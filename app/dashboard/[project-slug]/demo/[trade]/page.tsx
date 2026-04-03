import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { SubForm } from "@/components/bid-form/SubForm";

interface Props {
  params: Promise<{ "project-slug": string; trade: string }>;
}

export default async function DemoSubForm({ params }: Props) {
  const { "project-slug": slug, trade } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!project) return notFound();

  const { data: scopeItems } = await supabase
    .from("scope_items")
    .select("*")
    .eq("project_id", project.id)
    .eq("trade", trade)
    .order("sort_order");

  // Create a fake invitation for demo purposes
  const demoInvitation = {
    id: "demo",
    project_id: project.id,
    company_name: "Demo Electrical Co.",
    contact_name: "John Smith",
    contact_email: "demo@example.com",
    contact_phone: "",
    trade: trade,
    il_license_number: "",
    token: "demo",
    token_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    invitation_sent_at: new Date().toISOString(),
    link_opened_at: null,
    draft_started_at: null,
    submission_id: null,
    status: "link_opened" as const,
    reminder_sent_at: null,
    created_by: "",
    created_at: new Date().toISOString(),
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-amber-100 text-amber-800 text-center py-2 text-sm font-medium">
        DEMO MODE — This is a preview of the subcontractor bid form
      </div>
      <SubForm
        invitation={demoInvitation}
        project={project}
        scopeItems={scopeItems ?? []}
        existingDraft={null}
      />
    </main>
  );
}
